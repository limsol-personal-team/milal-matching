# Setup and build react client

FROM node:20-alpine as client

WORKDIR /client
COPY client .
RUN npm ci
RUN npm run build

# Build new image

FROM python:3.10-alpine

# Install redis

RUN apk update && apk add redis

# Setup and start django server. Expose 8000

WORKDIR /app/server
COPY --from=client /client/build /app/client/build
COPY server /app/server

EXPOSE 8000
RUN pip install -r requirements.txt
RUN python manage.py migrate
CMD redis-server --daemonize yes && 
    celery -A server worker --loglevel=INFO &&
    celery -A server beat --loglevel=info &&
    python manage.py runserver 0.0.0.0:8000
