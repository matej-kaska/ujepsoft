# Generated by Django 4.2.4 on 2023-12-10 09:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='offer',
            name='files',
        ),
        migrations.AddField(
            model_name='file',
            name='offer',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='files', to='api.offer'),
        ),
    ]
