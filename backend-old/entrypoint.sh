#!/bin/sh

python manage.py collectstatic --noinput
python manage.py wait_for_dbs 
python manage.py migrate
# Check if the 'loaddata' command has already been executed
if [ ! -f "db_loaded" ]; then
    # If not, run 'loaddata' and create a file to indicate that the data has been loaded
    python manage.py loaddata datadumps/user_data.json
    python manage.py loaddata datadumps/language.json
    python manage.py loaddata datadumps/subject.json
    python manage.py loaddata datadumps/grade_type.json
    python manage.py loaddata datadumps/grade.json
    python manage.py loaddata datadumps/teaching_unit.json
    touch db_loaded
fi

exec "$@"
