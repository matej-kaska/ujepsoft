from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError
import redis
import time
import os

class Command(BaseCommand):
    def handle(self, *args, **options):
        db_failed = True
        redis_failed = True
        
        while db_failed:
            try:
                db_conn = connections['default']
                cursor = db_conn.cursor()
            except OperationalError:
                self.stdout.write('Database unavailable, waiting 1 second...')
                time.sleep(1)
            else:
                db_failed = False
                self.stdout.write(self.style.SUCCESS('Database available!'))

        while redis_failed:
            try:
                r = redis.Redis(
                    host='redis',
                    port=6379,
                    password=os.getenv('REDIS_PASSWORD', None),
                    db=0,
                    socket_timeout=1
                )
                r.ping()
            except redis.ConnectionError:
                self.stdout.write('Redis unavailable, waiting 1 second...')
                time.sleep(1)
            else:
                redis_failed = False
                self.stdout.write(self.style.SUCCESS('Redis available!'))
