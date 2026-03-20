#!/usr/bin/env bash
# Flask aus dem backend-Ordner: ignoriert ein fälschlich gesetztes FLASK_APP=backend.app (z. B. aus ~/.zshrc).
set -euo pipefail
cd "$(dirname "$0")/.."
unset FLASK_APP
export PYTHONPATH="${PWD}${PYTHONPATH:+:$PYTHONPATH}"
exec .venv/bin/python -m flask --app app:app "$@"
