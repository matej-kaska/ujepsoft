# Generated by Django 4.2.4 on 2023-08-14 18:26

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Grade',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=63)),
            ],
        ),
        migrations.CreateModel(
            name='GradeType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=63)),
            ],
        ),
        migrations.CreateModel(
            name='Language',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=63)),
            ],
        ),
        migrations.CreateModel(
            name='LinkURL',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.URLField()),
            ],
        ),
        migrations.CreateModel(
            name='Rating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.IntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('creation_date', models.DateField(auto_now_add=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Subject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=63)),
            ],
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=63)),
            ],
        ),
        migrations.CreateModel(
            name='TeachingUnit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=63)),
                ('description', models.TextField(blank=True, null=True)),
                ('certificated', models.BooleanField(default=False)),
                ('creation_date', models.DateField(auto_now_add=True)),
                ('number_of_lessons', models.IntegerField()),
                ('number_of_downloads', models.IntegerField(default=0)),
                ('zip_file', models.FileField(upload_to='teaching_units/zip_files')),
                ('advice_urls', models.ManyToManyField(related_name='advice_urls', to='eduklub.linkurl')),
                ('alternatives', models.ManyToManyField(related_name='alternatives', to='eduklub.teachingunit')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
                ('grade', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='eduklub.grade')),
                ('guide_urls', models.ManyToManyField(related_name='guide_urls', to='eduklub.linkurl')),
                ('language', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='eduklub.language')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='eduklub.teachingunit')),
                ('subject', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='eduklub.subject')),
                ('tags', models.ManyToManyField(related_name='teaching_units', to='eduklub.tag')),
            ],
        ),
        migrations.CreateModel(
            name='RatingComment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('is_positive', models.BooleanField()),
                ('rating', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='eduklub.rating')),
            ],
        ),
        migrations.AddField(
            model_name='rating',
            name='teaching_unit',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ratings', to='eduklub.teachingunit'),
        ),
        migrations.CreateModel(
            name='Lesson',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=63)),
                ('preview_file', models.FileField(upload_to='lessons/preview_files')),
                ('teaching_unit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='eduklub.teachingunit')),
            ],
        ),
        migrations.AddField(
            model_name='grade',
            name='grade_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='eduklub.gradetype'),
        ),
        migrations.CreateModel(
            name='FavoriteList',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=63)),
                ('is_main', models.BooleanField(default=False)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('teaching_units', models.ManyToManyField(related_name='favorite_lists', to='eduklub.teachingunit')),
            ],
        ),
    ]
