"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 4.2.7.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("DJANGO_SECRET", 'django-insecure-o!t-tj#9&_%9cranyr65a^a91douw@)!!l5_t@6bv-_yqacw+8')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DJANGO_PRODUCTION", "False") == "False"

ALLOWED_HOSTS = [host for host in os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")]

SESSION_COOKIE_SECURE = os.environ.get("DJANGO_PRODUCTION", "False") == "True"
CSRF_COOKIE_SECURE = os.environ.get("DJANGO_PRODUCTION", "False") == "True"
CSRF_TRUSTED_ORIGINS = [host for host in os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS", "http://localhost:8000").split(",")]


# Application definition

INSTALLED_APPS = [
    "users.apps.UsersConfig",
    "utils.apps.UtilsConfig",
    "api.apps.ApiConfig",

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    "rest_framework",
    "rest_framework.authtoken",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get("DJANGO_DB_NAME", "ujepsoft"),
        'USER': os.environ.get("DJANGO_DB_USER", "postgres"),
        'PASSWORD': os.environ.get("DJANGO_DB_PASSWORD", "postgres"),
        'HOST': os.environ.get("DJANGO_DB_HOST", "localhost"),
        'PORT': os.environ.get("DJANGO_DB_PORT", "5432"),
    }
}

CACHES = {
    "default": {
        "BACKEND": "api.caching_logging.LoggingRedisCache",
        "LOCATION": os.environ.get("DJANGO_REDIS_LOCATION", "redis://localhost:6379/1"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "PASSWORD": os.environ.get("REDIS_PASSWORD"),
        }
    }
}

# TODO: Disable Logging on Production
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'api.caching_logging': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Custom user model

AUTH_USER_MODEL = "users.User"
AUTHENTICATION_BACKENDS = ['users.auth_backends.EmailBackend']

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

MEDIA_URL = os.environ.get("DJANGO_MEDIA_URL", "media/")
MEDIA_ROOT = BASE_DIR / "media"

STATIC_URL = os.environ.get("DJANGO_STATIC_URL", "static/")
STATICFILES_DIRS = [
    BASE_DIR / "static",
    ]
STATIC_ROOT = BASE_DIR / "staticfiles"

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email settings
EMAIL_HOST = os.environ.get("DJANGO_EMAIL_HOST", None)
EMAIL_PORT = os.environ.get("DJANGO_EMAIL_PORT", None)
EMAIL_USE_TLS = os.environ.get("DJANGO_EMAIL_USE_TLS", "").lower() == "true"
EMAIL_HOST_USER = os.environ.get("DJANGO_EMAIL_HOST_USER", None)
EMAIL_HOST_PASSWORD = os.environ.get("DJANGO_EMAIL_HOST_PASSWORD", None)