from django.contrib.postgres.operations import TrigramExtension
from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('eduklub', '0005_alter_lesson_teaching_unit'),
    ]

    operations = [
        TrigramExtension(),
    ]