#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

# Load env vars from .env
set -a
source "$DIR/server/.env"
set +a

export PROD_ENV=false

# Start Redis if not already running
if ! redis-cli ping &>/dev/null; then
  redis-server --daemonize yes
fi

cd "$DIR/server" && source "$DIR/venv/bin/activate" && python manage.py runserver
