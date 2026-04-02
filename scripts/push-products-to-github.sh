#!/usr/bin/env bash
# One script: sync images → public/products (optional), then batched git commit + push.
set -euo pipefail

usage() {
  cat <<'EOF'
Push product images to GitHub in batches (default 99 files per commit).

Steps:
  1) Optionally rsync a source folder into public/products/
  2) git add / commit / push in chunks (default 99 files per commit)

Run from the repository root (or anywhere inside it).

Examples (one command per line):
  npm run push:products
  ./scripts/push-products-to-github.sh --dry-run
  ./scripts/push-products-to-github.sh --source ~/Pictures/shop-export

Options:
  --dry-run       Print diagnostics and batch plan only
  --batch N       Files per commit (default: 99)
  --path DIR      Where Next serves from (default: public/products)
  --source DIR    Copy this folder into --path before git (rsync)
  --no-sync       Do not rsync; only commit what is already new under --path

Environment:
  SYNC_FROM=products   Require ./products and rsync it (same idea as --source products)

Tip: If you see "0 files" under ./products, restore your image folder there or use --source.
EOF
  exit "${1:-0}"
}

count_files() {
  local d="${1:-}"
  [[ -d "$d" ]] || { echo "0"; return; }
  find "$d" -type f ! -name '.DS_Store' ! -name '._*' 2>/dev/null | wc -l | tr -d ' '
}

cd "$(git rev-parse --show-toplevel)"

DRY_RUN=false
BATCH="${BATCH:-99}"
TARGET="public/products"
NO_SYNC=false
SOURCE_ARG=""

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

BRANCH="$(git branch --show-current)"
REMOTE="${REMOTE:-origin}"

# Legacy env: SYNC_FROM=products (only if --source not set)
if [[ "${SYNC_FROM:-}" == "products" ]]; then
  if $NO_SYNC; then
    echo "SYNC_FROM=products conflicts with --no-sync" >&2
    exit 1
  fi
  SOURCE_ARG="${SOURCE_ARG:-products}"
fi

echo "=== Product push diagnostics ==="
pc=0
[[ -d products ]] && pc="$(count_files products)"
pub="$(count_files public/products 2>/dev/null || echo 0)"
echo "  Files on disk:  ./products = ${pc}   public/products = ${pub}"

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

pending="$(mktemp)"
build_pending_list "$pending"
total="$(wc -l <"$pending" | tr -d ' ')"

tracked="$(git ls-files "$TARGET" 2>/dev/null | wc -l | tr -d ' ')"
echo "  Git: tracked under $TARGET = ${tracked}   pending commit = ${total}"
echo "================================"

if [[ -z "$total" || "$total" -eq 0 ]]; then
  echo "Nothing new to commit under $TARGET."
  echo
  echo "Next steps:"
  echo "  • Put images in ./products/<category>/ then run this script again, or"
  echo "  • Run: ./scripts/push-products-to-github.sh --source /path/to/your/folder"
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

if $DRY_RUN; then
  echo "Dry run done ($batch_num batch(es))."
else
  echo "Done. Pushed $batch_num batch(es)."
fi
