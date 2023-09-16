import os

GSHEET_CONFIG = {
    "SATURDAY_CHECKIN_SPREADSHEET_ID": "1Z566UWaWeCIkUtND8hx7721963J2gUHzwFJN2_Nh-bk",
    "SATURDAY_CHECKIN_SPREADSHEET_RANGE": "Sheet1!A:C",
}

# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_ENDPOINT"),
        "PORT": os.getenv("DB_PORT"),
    }
}
