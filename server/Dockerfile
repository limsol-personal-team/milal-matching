# # Setup and build react client

# FROM node:20-alpine as client

# WORKDIR /client
# COPY client .
# RUN npm ci
# RUN npm run build

# Build new image

FROM python:3.10-slim

# Install all system dependencies in one RUN command to reduce image layers
RUN apt-get update && apt-get install -y \
    # Redis for Django caching and Celery task queue
    redis \
    # LibreOffice Writer for DOCX to PDF conversion
    libreoffice-writer \
    # LibreOffice Common libraries required by Writer
    libreoffice-common \
    # Python dev headers for C extension compilation
    python3-dev \
    # PostgreSQL dev libraries for psycopg2
    libpq-dev \
    # GCC compiler for Python C extensions
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Setup and start django server. Expose 8000

WORKDIR /app/server
# COPY --from=client /client/build /app/client/build
COPY . /app/server

EXPOSE 8000
RUN pip install -r requirements.txt
CMD python manage.py migrate && \
    redis-server --daemonize yes && \ 
    celery -A server worker --loglevel=INFO --detach && \
    celery -A server beat --loglevel=info --detach && \
    gunicorn
