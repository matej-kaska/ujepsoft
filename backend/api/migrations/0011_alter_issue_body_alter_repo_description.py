# Generated by Django 5.0.2 on 2024-02-18 12:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_alter_comment_number_alter_issue_gh_id_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='issue',
            name='body',
            field=models.CharField(blank=True, max_length=8192),
        ),
        migrations.AlterField(
            model_name='repo',
            name='description',
            field=models.CharField(blank=True, max_length=8192),
        ),
    ]