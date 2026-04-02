#!/usr/bin/env bash
# Batch-commit and push files under public/products/ (default 99 files per commit).
#
# Run ONE command per line (do not paste the "# comment" lines from docs — zsh may error).
#
# Usage:
#   ./scripts/push-public-products-batched.sh [--dry-run] [--batch N] [--path DIR]
#   SYNC_FROM=products ./scripts/push-public-products-batched.sh [--dry-run]
#
# Optional: copy from repo-root mirror first (ignored by git):
#   SYNC_FROM=products ./scripts/push-public-products-batched.sh
#
# Requires: clean git state except for the target path (stash other changes first).

set -euo pipefail

usage() {
  cat <<'EOF'
Batch-commit and push files under public/products/ (default 99 files per commit).

Run ONE shell command per line — do not paste whole docs blocks (zsh may try to run "# ..." lines).

Usage:
  ./scripts/push-public-products-batched.sh [--dry-run] [--batch N] [--path DIR]
  SYNC_FROM=products ./scripts/push-public-products-batched.sh [--dry-run]

  --path DIR   folder to upload (default: public/products). No bare words like "batches".

Examples:
  npm run push:products-batched
  ./scripts/push-public-products-batched.sh --dry-run
  SYNC_FROM=products ./scripts/push-public-products-batched.sh
EOF
  exit "${1:-0}"
}

cd "$(git rev-parse --show-toplevel)"

DRY_RUN=false
BATCH=99
TARGET="public/products"

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
    -*)
      echo "Unknown option: $1 (try --help)" >&2
      exit 1
      ;;
    *)
      echo "Unexpected argument: $1" >&2
      echo "Use --path DIR for a custom folder (bare words like \"batches\" are not allowed)." >&2
      exit 1
      ;;
  esac
done

if ! [[ "$BATCH" =~ ^[1-9][0-9]*$ ]]; then
  echo "Batch size must be a positive integer" >&2
  exit 1
fi

BRANCH="$(git branch --show-current)"
REMOTE="${REMOTE:-origin}"

if [[ "${SYNC_FROM:-}" == "products" ]]; then
  if [[ ! -d products ]]; then
    echo "SYNC_FROM=products set but ./products does not exist" >&2
    exit 1
  fi
  echo "Syncing products/ → public/products/ (rsync)..."
  mkdir -p public/products
  rsync -a --exclude='.DS_Store' products/ public/products/
fi

if [[ ! -d "$TARGET" ]]; then
  echo "Target directory missing: $TARGET" >&2
  exit 1
fi

# Avoid committing unrelated work that was already staged
if ! $DRY_RUN; then
  while IFS= read -r p; do
    [[ -z "$p" ]] && continue
    case "$p" in
      "$TARGET"/*) ;;
      "$TARGET") ;;
      *)
        echo "Abort: unrelated path already staged: $p" >&2
        echo "Commit or reset staging, then run again." >&2
        exit 1
        ;;
    esac
  done < <(git diff --cached --name-only)
fi

# Pending = untracked + modified (working tree + index) under TARGET
pending="$(mktemp)"
{
  git ls-files -o --exclude-standard -- "$TARGET" || true
  git diff --name-only -- "$TARGET" || true
  git diff --name-only --cached -- "$TARGET" || true
} | sort -u > "${pending}.raw"

: >"$pending"
while IFS= read -r f || [[ -n "${f:-}" ]]; do
  [[ -z "$f" ]] && continue
  [[ -f "$f" ]] && printf '%s\n' "$f" >>"$pending"
done < "${pending}.raw"
rm -f "${pending}.raw"

total="$(wc -l <"$pending" | tr -d ' ')"
if [[ -z "$total" || "$total" -eq 0 ]]; then
  echo "Nothing to commit under $TARGET (already synced with git)."
  if [[ "${SYNC_FROM:-}" == "products" ]]; then
    echo "Hint: ./products may be empty, or files are already tracked under public/products/." >&2
  else
    echo "Hint: add images under public/products/<category>/ or run with SYNC_FROM=products if you keep a mirror in ./products/." >&2
  fi
  rm -f "$pending"
  exit 0
fi

echo "Found $total file(s) to add under $TARGET (batch size $BATCH)."

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
      echo "[dry-run] batch $batch_num: would add $n files (first: $(head -1 "$chunk_file"))"
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
    echo "[dry-run] batch $batch_num: would add $n files (last batch)"
  else
    git_add_from_file "$chunk_file"
    git commit -m "chore(products): add assets batch $batch_num ($n files)"
    git push "$REMOTE" "$BRANCH"
  fi
fi

rm -f "$pending" "$chunk_file"

if $DRY_RUN; then
  echo "Dry run finished ($batch_num batch(es))."
else
  echo "Done. Pushed $batch_num batch(es) to $REMOTE/$BRANCH."
fi
