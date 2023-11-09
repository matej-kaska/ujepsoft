from django.contrib import admin
from django import forms

from .models import (
    GradeType,
    Grade,
    Subject,
    Tag,
    LinkURL,
    Language,
    TeachingUnit,
    Lesson,
    Rating,
    RatingComment,
    FavoriteList,
    Curriculum
)

# Teaching unit form with optional alternatives field
class TeachingUnitForm(forms.ModelForm):
    class Meta:
        model = TeachingUnit
        fields = '__all__'

    alternatives = forms.ModelMultipleChoiceField(
        queryset=TeachingUnit.objects.all(),
        required=False
    )

class TeachingUnitAdmin(admin.ModelAdmin):
    form = TeachingUnitForm

admin.site.register(GradeType)
admin.site.register(Grade)
admin.site.register(Subject)
admin.site.register(Tag)
admin.site.register(LinkURL)
admin.site.register(Language)
admin.site.register(TeachingUnit, TeachingUnitAdmin)
admin.site.register(Lesson)
admin.site.register(Rating)
admin.site.register(RatingComment)
admin.site.register(FavoriteList)
admin.site.register(Curriculum)
