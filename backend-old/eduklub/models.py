from django.db import models
from users.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


# Gympl/základka/střední...
class GradeType(models.Model):
    name = models.CharField(max_length=63)

    def __repr__(self):
        return f"[{self.pk}] {self.name}"
    
    def __str__(self):
        return repr(self)

# Třída 1-9/septa/oktáva...
class Grade(models.Model):
    name = models.CharField(max_length=63)
    grade_type = models.ForeignKey(GradeType, on_delete=models.PROTECT)

    def __repr__(self):
        return f"[{self.pk}] ({self.grade_type.name}) {self.name}"
    
    def __str__(self):
        return repr(self)


class Subject(models.Model):
    name = models.CharField(max_length=63)

    def __repr__(self):
        return f"[{self.pk}] {self.name}"
    
    def __str__(self):
        return repr(self)

class Tag(models.Model):
    name = models.CharField(max_length=63)

    def __repr__(self):
        return f"[{self.pk}] {self.name}"
    
    def __str__(self):
        return repr(self)

class LinkURL(models.Model):
    url = models.URLField()

    def __repr__(self):
        return f"[{self.pk}] {self.url}"
    
    def __str__(self):
        return repr(self)

class Language(models.Model):
    name = models.CharField(max_length=63)

    def __repr__(self):
        return f"[{self.pk}] {self.name}"
    
    def __str__(self):
        return repr(self)

class Curriculum(models.Model):
    name = models.CharField(max_length=1024)

    def __repr__(self):
        return f"[{self.pk}] {self.name}"
    
    def __str__(self):
        return repr(self)

class TeachingUnit(models.Model):
    name = models.CharField(max_length=63)
    description = models.TextField(null=True, blank=True)
    certificated = models.BooleanField(default=False)
    is_recommended = models.BooleanField(default=False)
    creation_date = models.DateField(auto_now_add=True)
    is_hidden = models.BooleanField(default=False)

    number_of_lessons = models.IntegerField()
    number_of_downloads = models.IntegerField(default=0)

    # ZIP bundle to be downlaoded by user
    zip_file = models.FileField(upload_to='teaching_units/zip_files')

    language = models.ForeignKey(Language, on_delete=models.PROTECT)
    author = models.ForeignKey(User, on_delete=models.PROTECT, null=True)
    tags = models.ManyToManyField(Tag, related_name='teaching_units', blank=True)

    parent = models.ForeignKey('self', on_delete=models.PROTECT, null=True, blank=True)

    alternatives = models.ManyToManyField('self', blank=False)
    advice_urls = models.ManyToManyField(LinkURL, related_name='advice_urls', blank=True)
    guide_urls = models.ManyToManyField(LinkURL, related_name='guide_urls', blank=True)

    subject = models.ForeignKey(Subject, on_delete=models.PROTECT)
    grade = models.ForeignKey(Grade, on_delete=models.PROTECT)

    curriculums = models.ManyToManyField(Curriculum, related_name='teaching_units', blank=True)

    def __repr__(self):
        return f"[{self.pk}] {self.name}"
    
    def __str__(self):
        return repr(self)

class Lesson(models.Model):
    name = models.CharField(max_length=63)

    # Preview HTML file
    preview_file = models.FileField(upload_to='lessons/preview_files')

    teaching_unit = models.ForeignKey(TeachingUnit, on_delete=models.CASCADE, related_name='lessons')

    def __repr__(self):
        return f"[{self.pk}] {self.name}"
    
    def __str__(self):
        return repr(self)

class Rating(models.Model):
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])

    creation_date = models.DateField(auto_now_add=True)

    author = models.ForeignKey(User, on_delete=models.CASCADE)
    teaching_unit = models.ForeignKey(TeachingUnit, on_delete=models.CASCADE,
                                      related_name='ratings')

    def __repr__(self):
        return f"[{self.pk}] {self.rating}"
    
    def __str__(self):
        return repr(self)

class RatingComment(models.Model):
    text = models.TextField()
    is_positive = models.BooleanField()
    rating = models.ForeignKey(Rating, on_delete=models.CASCADE,
                                 related_name='comments')

    def __repr__(self):
        return f"[{self.pk}] {self.text}"
    
    def __str__(self):
        return repr(self)

class FavoriteList(models.Model):
    name = models.CharField(max_length=63)
    # For košík/aktuální list
    is_main = models.BooleanField(default=False)

    author = models.ForeignKey(User, on_delete=models.CASCADE)
    teaching_units = models.ManyToManyField(TeachingUnit, related_name='favorite_lists', blank=True)

    def __repr__(self):
        return f"[{self.pk}] {self.name}"
    
    def __str__(self):
        return repr(self)