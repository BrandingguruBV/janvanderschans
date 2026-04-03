#!/usr/bin/env bash
# One script: sync images → public/products (optional), then batched git commit + push.
# Skips files over MAX_FILE_MB (default 95) so GitHub’s 100 MiB/file limit is not hit.
set -euo pipefail

usage() {
  cat <<'EOF'
Push product images to GitHub in batches (default 99 files per commit).

Steps:
  1) Optionally rsync a source folder into public/products/
  2) Skip files larger than MAX_FILE_MB (default: 95 MiB; GitHub max is 100 MiB)
  3) Write scripts/skipped-product-uploads.txt (paths + sizes)
  4) Refresh public/products/.gitignore so skipped files stay untracked cleanly
  5) git add / commit / push in batches

On GitHub the shop assets live under **public/products/** (not a top-level "products" folder).

Examples:
  npm run push:products
  MAX_FILE_MB=50 ./scripts/push-products-to-github.sh --dry-run
  ./scripts/push-products-to-github.sh --source products --batch 99

Environment:
  MAX_FILE_MB=95     Max size per file to upload (decimal integer MiB)
  SYNC_FROM=products Same as --source products
  BATCH, REMOTE      See below
EOF
  exit "${1:-0}"
}

count_files() {
  local d="${1:-}"
  [[ -d "$d" ]] || { echo "0"; return; }
  find "$d" -type f ! -name '.DS_Store' ! -name '._*' 2>/dev/null | wc -l | tr -d ' '
}

file_bytes() {
  local f="$1"
  if stat -f%z "$f" >/dev/null 2>&1; then
    stat -f%z "$f"
  else
    stat -c%s "$f"
  fi
}

human_bytes() {
  local b="$1"
  if command -v numfmt >/dev/null 2>&1; then
    numfmt --to=iec-i --suffix=B "$b" 2>/dev/null || echo "${b} B"
  else
    echo "${b} B"
  fi
}

cd "$(git rev-parse --show-toplevel)"

DRY_RUN=false
BATCH="${BATCH:-99}"
MAX_FILE_MB="${MAX_FILE_MB:-95}"
TARGET="public/products"
NO_SYNC=false
SOURCE_ARG=""
SKIP_REPORT="scripts/skipped-product-uploads.txt"
BEGIN_MARK="# BEGIN push-products-oversize"
END_MARK="# END push-products-oversize"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h) usage 0 ;;
    --dry-run) DRY_RUN=true; shift ;;
    --batch)
      BATCH="${2:?--batch needs a number}"
      shift 2
      ;;
    --path)
      TARGET="${2:?--path needs a directory}"
      TARGET="${TARGET%/}"
      shift 2
      ;;
    --source)
      SOURCE_ARG="${2:?--source needs a directory}"
      SOURCE_ARG="${SOURCE_ARG%/}"
      shift 2
      ;;
    --no-sync) NO_SYNC=true; shift ;;
    -*)
      echo "Unknown option: $1 (use --help)" >&2
      exit 1
      ;;
    *)
      echo "Unexpected argument: $1 (use --source DIR or --help)" >&2
      exit 1
      ;;
  esac
done

if ! [[ "$BATCH" =~ ^[1-9][0-9]*$ ]]; then
  echo "Batch size must be a positive integer" >&2
  exit 1
fi

if ! [[ "$MAX_FILE_MB" =~ ^[1-9][0-9]*$ ]]; then
  echo "MAX_FILE_MB must be a positive integer (MiB)" >&2
  exit 1
fi

MAX_BYTES=$((MAX_FILE_MB * 1024 * 1024))

BRANCH="$(git branch --show-current)"
REMOTE="${REMOTE:-origin}"

if [[ "${SYNC_FROM:-}" == "products" ]]; then
  if $NO_SYNC; then
    echo "SYNC_FROM=products conflicts with --no-sync" >&2
    exit 1
  fi
  SOURCE_ARG="${SOURCE_ARG:-products}"
fi

echo "=== Product push diagnostics ==="
echo "  GitHub path:   $TARGET/  (open this folder on github.com — there is no repo-root \"products/\" folder)"
echo "  Size limit:    ${MAX_FILE_MB} MiB per file (oversize → skipped list + local .gitignore)"
pc=0
[[ -d products ]] && pc="$(count_files products)"
pub="$(count_files public/products 2>/dev/null || echo 0)"
echo "  Files on disk: ./products = ${pc}   public/products = ${pub}"

SYNC_FROM_PATH=""
if $NO_SYNC; then
  echo "  Rsync: skipped (--no-sync)"
elif [[ -n "$SOURCE_ARG" ]]; then
  if [[ ! -d "$SOURCE_ARG" ]]; then
    echo "Source directory does not exist: $SOURCE_ARG" >&2
    exit 1
  fi
  SYNC_FROM_PATH="$SOURCE_ARG"
  echo "  Rsync: $SYNC_FROM_PATH/ → $TARGET/"
elif [[ "$pc" -gt 0 ]]; then
  SYNC_FROM_PATH="products"
  echo "  Rsync: products/ → $TARGET/ (./products has files)"
else
  echo "  Rsync: skipped (./products empty or missing — use --source DIR or add files under public/products/)"
fi

if [[ -n "$SYNC_FROM_PATH" ]]; then
  mkdir -p "$TARGET"
  if $DRY_RUN; then
    echo "  [dry-run] would run: rsync -a --exclude='.DS_Store' --exclude='._*' \"$SYNC_FROM_PATH/\" \"$TARGET/\""
  else
    rsync -a --exclude='.DS_Store' --exclude='._*' "$SYNC_FROM_PATH/" "$TARGET/"
  fi
fi

if [[ ! -d "$TARGET" ]]; then
  echo "Target directory missing: $TARGET" >&2
  exit 1
fi

if ! $DRY_RUN; then
  while IFS= read -r p; do
    [[ -z "$p" ]] && continue
    case "$p" in
      "$TARGET"/*) ;;
      "$TARGET") ;;
      scripts/skipped-product-uploads.txt | "$TARGET/.gitignore") ;;
      *)
        echo "Abort: unrelated path already staged: $p" >&2
        echo "Commit or reset staging, then run again." >&2
        exit 1
        ;;
    esac
  done < <(git diff --cached --name-only)
fi

build_pending_list() {
  local out="$1"
  {
    git ls-files -o --exclude-standard -- "$TARGET" || true
    git diff --name-only -- "$TARGET" || true
    git diff --name-only --cached -- "$TARGET" || true
  } | sort -u >"${out}.raw"
  : >"$out"
  while IFS= read -r f || [[ -n "${f:-}" ]]; do
    [[ -z "$f" ]] && continue
    [[ -f "$f" ]] && printf '%s\n' "$f" >>"$out"
  done <"${out}.raw"
  rm -f "${out}.raw"
}

# Full scan: every file under TARGET over limit (for report + gitignore)
oversize_scan="$(mktemp)"
: >"$oversize_scan"
oversize_count=0
while IFS= read -r -d '' f; do
  [[ -z "$f" ]] && continue
  sz=$(file_bytes "$f")
  if [[ "$sz" -gt "$MAX_BYTES" ]]; then
    printf '%s\t%s\n' "$sz" "$f" >>"$oversize_scan"
    oversize_count=$((oversize_count + 1))
  fi
done < <(find "$TARGET" -type f ! -name '.DS_Store' ! -name '._*' -print0 2>/dev/null)

mkdir -p scripts
report_tmp="$(mktemp)"
{
  echo "# Skipped from GitHub upload (over size limit)"
  echo "# Generated (UTC): $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "# Limit: ${MAX_FILE_MB} MiB (${MAX_BYTES} bytes). GitHub rejects files > 100 MiB."
  echo "# On github.com open: ${TARGET}/"
  echo "#"
  echo -e "# bytes\thuman_size\tpath (repo-relative)"
  sort -t$'\t' -nr "$oversize_scan" 2>/dev/null | while IFS=$'\t' read -r sz path; do
    [[ -z "${path:-}" ]] && continue
    h="$(human_bytes "$sz")"
    printf "%s\t%s\t%s\n" "$sz" "$h" "$path"
  done
} >"$report_tmp"

if [[ "$oversize_count" -gt 0 ]]; then
  if $DRY_RUN; then
    echo "  [dry-run] would write $SKIP_REPORT ($oversize_count oversize file(s) under $TARGET)"
    rm -f "$report_tmp"
  else
    mv "$report_tmp" "$SKIP_REPORT"
  fi
else
  rm -f "$report_tmp"
  if ! $DRY_RUN; then
    {
      echo "# Skipped from GitHub upload (over size limit)"
      echo "# Generated (UTC): $(date -u +%Y-%m-%dT%H:%M:%SZ)"
      echo "# Limit: ${MAX_FILE_MB} MiB — none over limit right now."
      echo "#"
    } >"$SKIP_REPORT"
  fi
fi

# public/products/.gitignore: ignore oversize paths (relative to this folder) if not tracked
if [[ "$oversize_count" -gt 0 ]]; then
  ig_tmp="$(mktemp)"
  gitignore_path="$TARGET/.gitignore"
  if [[ -f "$gitignore_path" ]]; then
    awk -v b="$BEGIN_MARK" -v e="$END_MARK" '
      $0==b {skip=1; next}
      $0==e {skip=0; next}
      !skip {print}
    ' "$gitignore_path" >"$ig_tmp" || true
  else
    : >"$ig_tmp"
  fi
  {
    echo ""
    echo "$BEGIN_MARK"
    echo "# Do not edit by hand — regenerated by scripts/push-products-to-github.sh"
    sort -t$'\t' -k2 "$oversize_scan" | while IFS=$'\t' read -r sz f; do
      [[ -z "$f" ]] && continue
      if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
        echo "# (tracked, cannot ignore) $f" >&2
        continue
      fi
      rel="${f#${TARGET}/}"
      printf '%s\n' "$rel"
    done | sort -u
    echo "$END_MARK"
  } >>"$ig_tmp"
  if $DRY_RUN; then
    echo "  [dry-run] would update $gitignore_path (oversize ignore block)"
    rm -f "$ig_tmp"
  else
    mv "$ig_tmp" "$gitignore_path"
  fi
elif [[ -f "$TARGET/.gitignore" ]]; then
  if ! $DRY_RUN; then
    awk -v b="$BEGIN_MARK" -v e="$END_MARK" '
      $0==b {skip=1; next}
      $0==e {skip=0; next}
      !skip {print}
    ' "$TARGET/.gitignore" >"${TARGET}/.gitignore.tmp" && mv "${TARGET}/.gitignore.tmp" "$TARGET/.gitignore"
  fi
fi

rm -f "$oversize_scan"

pending="$(mktemp)"
build_pending_list "$pending"

# Drop oversize paths from pending
pending_ok="$(mktemp)"
skipped_from_pending=0
while IFS= read -r f || [[ -n "${f:-}" ]]; do
  [[ -z "$f" ]] && continue
  sz=$(file_bytes "$f")
  if [[ "$sz" -gt "$MAX_BYTES" ]]; then
    skipped_from_pending=$((skipped_from_pending + 1))
    continue
  fi
  printf '%s\n' "$f" >>"$pending_ok"
done <"$pending"
mv "$pending_ok" "$pending"

total="$(wc -l <"$pending" | tr -d ' ')"
tracked="$(git ls-files "$TARGET" 2>/dev/null | wc -l | tr -d ' ')"
echo "  Git: tracked under $TARGET = ${tracked}   pending upload (under limit) = ${total}"
[[ "$skipped_from_pending" -gt 0 ]] && echo "  Skipped from this upload (over ${MAX_FILE_MB} MiB): ${skipped_from_pending} file(s) — see $SKIP_REPORT"
[[ "$oversize_count" -gt 0 ]] && echo "  Total oversize on disk under $TARGET: ${oversize_count} — listed in $SKIP_REPORT"
echo "================================"

meta_commit_needed=false
if ! $DRY_RUN; then
  if [[ -n "$(git status --porcelain -- "$SKIP_REPORT" "$TARGET/.gitignore" 2>/dev/null)" ]]; then
    meta_commit_needed=true
  fi
fi

if [[ -z "$total" || "$total" -eq 0 ]]; then
  echo "Nothing new to commit under $TARGET (within size limit)."
  if $meta_commit_needed; then
    echo "Committing skip list / .gitignore updates only..."
    [[ -f "$SKIP_REPORT" ]] && git add -- "$SKIP_REPORT"
    [[ -f "$TARGET/.gitignore" ]] && git add -- "$TARGET/.gitignore"
    git commit -m "chore(products): update skipped large files list and .gitignore" || true
    git push "$REMOTE" "$BRANCH" || true
  fi
  echo
  echo "Next steps:"
  echo "  • On GitHub: browse **$TARGET** (not ./products)."
  echo "  • Compress or use Git LFS / CDN for paths in $SKIP_REPORT"
  rm -f "$pending"
  exit 0
fi

echo "Uploading $total file(s) in batches of $BATCH → $REMOTE/$BRANCH"

git_add_from_file() {
  local file="$1"
  while IFS= read -r path || [[ -n "${path:-}" ]]; do
    [[ -z "$path" ]] && continue
    git add -- "$path"
  done <"$file"
}

n=0
batch_num=0
chunk_file="$(mktemp)"
while IFS= read -r f || [[ -n "${f:-}" ]]; do
  [[ -z "$f" ]] && continue
  printf '%s\n' "$f" >>"$chunk_file"
  n=$((n + 1))
  if [[ "$n" -ge "$BATCH" ]]; then
    batch_num=$((batch_num + 1))
    if $DRY_RUN; then
      echo "[dry-run] batch $batch_num: $n files (e.g. $(head -1 "$chunk_file"))"
    else
      git_add_from_file "$chunk_file"
      git commit -m "chore(products): add assets batch $batch_num ($n files)"
      git push "$REMOTE" "$BRANCH"
    fi
    : >"$chunk_file"
    n=0
  fi
done <"$pending"

if [[ "$n" -gt 0 ]]; then
  batch_num=$((batch_num + 1))
  if $DRY_RUN; then
    echo "[dry-run] batch $batch_num: $n files (final)"
  else
    git_add_from_file "$chunk_file"
    git commit -m "chore(products): add assets batch $batch_num ($n files)"
    git push "$REMOTE" "$BRANCH"
  fi
fi

rm -f "$pending" "$chunk_file"

if ! $DRY_RUN; then
  if [[ -f "$SKIP_REPORT" ]] || [[ -f "$TARGET/.gitignore" ]]; then
    git add -- "$SKIP_REPORT" 2>/dev/null || true
    [[ -f "$TARGET/.gitignore" ]] && git add -- "$TARGET/.gitignore"
    if ! git diff --cached --quiet; then
      git commit -m "chore(products): skipped large files list + oversize .gitignore" || true
      git push "$REMOTE" "$BRANCH" || true
    fi
  fi
fi

if $DRY_RUN; then
  echo "Dry run done ($batch_num asset batch(es))."
else
  echo "Done. Pushed $batch_num asset batch(es). See $SKIP_REPORT for anything over ${MAX_FILE_MB} MiB."
fi
