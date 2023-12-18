# Generated by Django 4.2.4 on 2023-12-12 17:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_squashed_0003_alter_file_offer'),
    ]

    operations = [
        migrations.CreateModel(
            name='Label',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=63)),
            ],
        ),
        migrations.CreateModel(
            name='Reactions',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=63)),
                ('count', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Repo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.CharField(max_length=8192)),
                ('url', models.CharField(max_length=255)),
                ('author', models.CharField(max_length=255)),
                ('author_profile_pic', models.CharField(max_length=1023)),
                ('private', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Issue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.IntegerField()),
                ('title', models.CharField(max_length=255)),
                ('body', models.CharField(max_length=8192)),
                ('state', models.CharField(max_length=15)),
                ('author', models.CharField(max_length=255)),
                ('author_profile_pic', models.CharField(max_length=1023)),
                ('created_at', models.DateTimeField()),
                ('updated_at', models.DateTimeField()),
                ('labels', models.ManyToManyField(related_name='issues', to='api.label')),
                ('reactions', models.ManyToManyField(related_name='issues', to='api.reactions')),
                ('repo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='issues', to='api.repo')),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.IntegerField()),
                ('body', models.CharField(max_length=8192)),
                ('author', models.CharField(max_length=255)),
                ('author_profile_pic', models.CharField(max_length=1023)),
                ('created_at', models.DateTimeField()),
                ('updated_at', models.DateTimeField()),
                ('issue', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='api.issue')),
                ('reactions', models.ManyToManyField(related_name='comments', to='api.reactions')),
            ],
        ),
    ]