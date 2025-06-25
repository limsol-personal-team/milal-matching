import os

LOCAL_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

GSHEET_CONFIG = {
    "SATURDAY_CHECKIN_SPREADSHEET_ID": "1Rjcd9oaugMVqE7nVRmOQRsz8GX_hm2MCl_swpi3pdno",
    "SATURDAY_CHECKIN_SPREADSHEET_RANGE": "Sheet1!A:C",
}

# Email settings for development
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL')

# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(LOCAL_BASE_DIR, "db.sqlite3"),
    }
}
