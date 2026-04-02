import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  googleAnalyticsMeasurementId: z.string().max(32).nullable().optional(),
  googleTagManagerContainerId: z.string().max(32).nullable().optional(),
  googleSearchConsoleVerification: z.string().max(200).nullable().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 401 });
  }
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }
  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      googleAnalyticsMeasurementId: parsed.data.googleAnalyticsMeasurementId ?? null,
      googleTagManagerContainerId: parsed.data.googleTagManagerContainerId ?? null,
      googleSearchConsoleVerification: parsed.data.googleSearchConsoleVerification ?? null,
    },
    update: {
      ...parsed.data,
    },
  });
  return NextResponse.json(settings);
}
