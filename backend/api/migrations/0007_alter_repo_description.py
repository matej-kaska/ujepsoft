# Generated by Django 4.2.4 on 2023-12-13 11:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_issue_body'),
    ]

    operations = [
        migrations.AlterField(
            model_name='repo',
            name='description',
            field=models.CharField(blank=True, max_length=8192, null=True),
        ),
    ]
