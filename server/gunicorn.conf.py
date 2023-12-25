import os

wsgi_app = "server.wsgi"
bind = f"0.0.0.0:{os.getenv('PORT')}"
