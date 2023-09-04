# Setup and build react client

FROM node:19.6-alpine as client

WORKDIR /client
COPY client .
RUN npm ci
RUN npm run build

# Setup and start django server

FROM python:3.10-alpine

## Setup local redis client

RUN apt install lsb-release curl gpg
RUN curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
RUN apt-get update
RUN apt-get install redis
RUN redis-server

WORKDIR /app/server
COPY --from=client /client/build /app/client/build
COPY server /app/server

EXPOSE 8000
RUN pip install -r requirements.txt
RUN python manage.py migrate
CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]

