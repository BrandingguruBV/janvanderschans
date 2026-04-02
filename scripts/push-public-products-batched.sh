#!/usr/bin/env bash
# Backward-compatible entry; use scripts/push-products-to-github.sh
exec "$(cd "$(dirname "$0")" && pwd)/push-products-to-github.sh" "$@"
