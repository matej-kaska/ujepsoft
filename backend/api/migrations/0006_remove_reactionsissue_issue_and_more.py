# Generated by Django 5.0.6 on 2024-05-22 20:43

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_squashed_0005_alter_comment_body_alter_issue_body_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reactionsissue',
            name='issue',
        ),
        migrations.AlterField(
            model_name='commentfile',
            name='remote_url',
            field=models.CharField(blank=True, max_length=1024, validators=[django.core.validators.URLValidator()]),
        ),
        migrations.AlterField(
            model_name='issuefile',
            name='remote_url',
            field=models.CharField(blank=True, max_length=1024, validators=[django.core.validators.URLValidator()]),
        ),
        migrations.DeleteModel(
            name='ReactionsComment',
        ),
        migrations.DeleteModel(
            name='ReactionsIssue',
        ),
    ]
