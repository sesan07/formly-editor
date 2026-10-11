#!/usr/bin/env bash
set -euo pipefail
repository_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$repository_root"
if command -v act >/dev/null 2>&1; then
  runner=(act)
elif command -v gh >/dev/null 2>&1 && gh act --help >/dev/null 2>&1; then
  runner=(gh act)
else
  printf 'Local act is unavailable (act or gh act is required).\n' >&2
  exit 1
fi
command_name="${1:-list}"
args=(-W .github/workflows/ci.yml --secret-file /dev/null --env-file /dev/null)
case "$command_name" in
  list) args+=(-l) ;;
  job)
    case "${2:-}" in
      lint|test|build|docs-check) ;;
      *) printf 'Only CI job IDs are allowed; release workflows are never run locally.\n' >&2; exit 2 ;;
    esac
    docker info >/dev/null
    args+=(push -e tools/ci/events/push.json -j "$2" --platform ubuntu-latest=catthehacker/ubuntu:act-latest)
    ;;
  *) printf 'Usage: %s list | job <lint|test|build|docs-check>\n' "$0" >&2; exit 2 ;;
esac
exec "${runner[@]}" "${args[@]}"