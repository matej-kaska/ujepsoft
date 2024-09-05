#!/bin/sh

python manage.py collectstatic --noinput
python manage.py wait_for_dbs 
python manage.py migrate

exec "$@"