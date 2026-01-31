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

# Start Django server
(cd "$DIR/server" && source "$DIR/venv/bin/activate" && python manage.py runserver) &
DJANGO_PID=$!

# Start React client
(cd "$DIR/client" && npm start) &
REACT_PID=$!

# Shut down both on Ctrl+C
trap "kill $DJANGO_PID $REACT_PID 2>/dev/null; exit" INT TERM

wait
