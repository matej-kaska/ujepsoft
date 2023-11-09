from rest_framework import serializers

from django.db.models import Avg

from eduklub.models import (FavoriteList,
                            Subject,
                            GradeType,
                            Grade,
                            Language,
                            TeachingUnit,
                            Rating,
                            RatingComment,
                            LinkURL,
                            Curriculum,
                            Tag)


class FavoriteListSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteList
        fields = '__all__'
        read_only_fields = ('author', 'is_main')

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class GradeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeType
        fields = '__all__'

class GradeSerializer(serializers.ModelSerializer):
    grade_type_name = serializers.CharField(source='grade_type.name', read_only=True)

    class Meta:
        model = Grade
        fields = '__all__'

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'

class LinkURLSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkURL
        fields = '__all__'

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class AlternativeTeachingUnitSerializer(serializers.ModelSerializer):
    number_of_ratings = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    grade_type = serializers.IntegerField(source='grade.grade_type.id', read_only=True)
    mutations = serializers.SerializerMethodField()

    _tags = TagSerializer(many=True, read_only=True, source="tags")

    class Meta:
        model = TeachingUnit
        fields = ("id", "name", "description", "certificated", "is_recommended",
                   "creation_date", "number_of_lessons", "number_of_downloads",
                     "language", "author", "tags", "_tags", "subject", "grade",
                     "grade_type", "mutations", "number_of_ratings", "average_rating", "is_hidden")
        read_only_fields = ("id", "name", "description", "certificated", "is_recommended",
                     "creation_date", "number_of_lessons", "number_of_downloads",
                        "language", "author", "tags", "subject", "grade", "is_hidden")

    def get_number_of_ratings(self, obj):
        return obj.ratings.count()

    def get_average_rating(self, obj):
        avg_rating = Rating.objects.filter(teaching_unit=obj).aggregate(Avg('rating'))['rating__avg']
        return avg_rating if avg_rating else None
      
    def get_mutations(self, obj):
        return [ mut.pk for mut in TeachingUnit.objects.filter(parent=obj, is_hidden=False) ]

class TeachingUnitSerializer(serializers.ModelSerializer):
    number_of_ratings = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    _advice_urls = LinkURLSerializer(many=True, read_only=True, source="advice_urls")
    _guide_urls = LinkURLSerializer(many=True, read_only=True, source="guide_urls")
    #_alternatives = AlternativeTeachingUnitSerializer(many=True, read_only=True, source="alternatives")
    _alternatives = serializers.SerializerMethodField()

    _tags = TagSerializer(many=True, read_only=True, source="tags")

    grade_type = serializers.IntegerField(source='grade.grade_type.id', read_only=True)
    mutations = serializers.SerializerMethodField()
    _mutations = serializers.SerializerMethodField()


    class Meta:
        model = TeachingUnit
        fields = (
            "id",
            "name",
            "description",
            "certificated",
            "is_recommended",
            "creation_date",
            "number_of_lessons",
            "number_of_downloads",
            "zip_file",
            "language",
            "author",
            "tags",
            "_tags",
            "parent",
            "_alternatives",
            "_advice_urls",
            "_guide_urls",
            "subject",
            "grade",
            "grade_type",
            "mutations",
            "_mutations",

            "number_of_ratings",
            "average_rating",

            "is_hidden",
        )
        read_only_fields = (
            "name",
            "description",
            #"certificated", # updatable
            #"is_recommended", # updatable
            "creation_date",
            "number_of_lessons",
            "number_of_downloads",
            "zip_file",
            "language",
            "author",
            "tags",
            "parent",
            "alternatives",
            "advice_urls",
            "guide_urls",
            "subject",
            "grade",

            "is_hidden",
        )

    def get_number_of_ratings(self, obj):
        return obj.ratings.count()

    def get_average_rating(self, obj):
        avg_rating = Rating.objects.filter(teaching_unit=obj).aggregate(Avg('rating'))['rating__avg']
        return avg_rating if avg_rating else None
      
    def get_mutations(self, obj):
        return [ mut.pk for mut in TeachingUnit.objects.filter(parent=obj, is_hidden=False) ]

    def get__mutations(self, obj):
        serializer = AlternativeTeachingUnitSerializer(TeachingUnit.objects.filter(parent=obj, is_hidden=False), many=True)
        return serializer.data

    def get__alternatives(self, obj):
        alternatives = obj.alternatives.filter(is_hidden=False)
        serializer = AlternativeTeachingUnitSerializer(alternatives, many=True)
        return serializer.data


class RatingCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RatingComment
        fields = ("text", "is_positive")
        read_only_fields = ("text", "is_positive")

class RatingSerializer(serializers.ModelSerializer):
    _comments = RatingCommentSerializer(many=True, read_only=True, source="comments")

    class Meta:
        model = Rating
        fields = ("id", "rating", "author", "creation_date", "teaching_unit", "_comments")
        read_only_fields = ("id", "rating", "author", "creation_date", "teaching_unit")

class RatingMutationSerializer(serializers.ModelSerializer):
    _comments = RatingCommentSerializer(many=True, read_only=True, source="comments")
    mutation_author = serializers.SerializerMethodField()

    class Meta:
        model = Rating
        fields = ("id", "rating", "author", "creation_date", "teaching_unit", "_comments", "mutation_author")
        read_only_fields = ("id", "rating", "author", "creation_date", "teaching_unit")

    def get_mutation_author(self, obj):
        teaching_unit = TeachingUnit.objects.get(pk=obj.teaching_unit.pk)
        if teaching_unit.parent is None:
            return None
        if teaching_unit.author is None:
            return None
        return teaching_unit.author.pk

class CurriculumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curriculum
        fields = '__all__'
