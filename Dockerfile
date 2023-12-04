# Setup and build react client

FROM node:20-alpine as client

WORKDIR /client
COPY client .
RUN npm ci
RUN npm run build

# Build new image

FROM python:3.10-slim

# Install redis

RUN apt-get update && apt-get install -y redis

# Install PostGres depedencies for psycop

RUN apt install -y python3-dev libpq-dev gcc

# Setup and start django server. Expose 8000

WORKDIR /app/server
COPY --from=client /client/build /app/client/build
COPY server /app/server

EXPOSE 8000
RUN pip install -r requirements.txt
CMD python manage.py migrate && \
    redis-server --daemonize yes && \ 
    celery -A server worker --loglevel=INFO --detach && \
    celery -A server beat --loglevel=info --detach && \
    python manage.py runserver 0.0.0.0:8000
