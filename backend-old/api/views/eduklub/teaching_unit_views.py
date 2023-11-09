from rest_framework import generics
from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.core.files import File

from eduklub.models import (TeachingUnit, LinkURL, Curriculum, Lesson, Subject, Grade, Language, Tag)
from api.serializers.eduklub import (TeachingUnitSerializer, CurriculumSerializer)
from api.permissions import (IsAuthor)
from api.pagination import StandardPagination

import base64
import io
import zipfile
import json

class TeachingUnitAddAlternatives(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, teaching_unit_pk):
        """
        Add alternative to teaching unit
        Example data:
        {
            "alternatives": 1
        }
        """
        alternative = request.data.get('alternative', None)
        if alternative is None:
            return Response({
                "en": "Alternative must be specified",
                "cz": "Alternativa musí být specifikována"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            alternative = int(alternative)
        except ValueError:
            return Response({
                "en": "Alternative must be integer",
                "cz": "Alternativa musí být celé číslo"
            }, status=status.HTTP_400_BAD_REQUEST)

        teaching_unit = generics.get_object_or_404(TeachingUnit, pk=teaching_unit_pk, is_hidden=False)
        alternative_unit = generics.get_object_or_404(TeachingUnit, pk=alternative, is_hidden=False)
        if alternative == teaching_unit.pk:
            return Response({
                "en": "Alternative can't be the same as teaching unit",
                "cz": "Alternativa nemůže být stejná jako výuka"
            }, status=status.HTTP_400_BAD_REQUEST)

        if self.request.user != teaching_unit.author and not self.request.user.is_staff:
            return Response({
                #"en": "You are not the author of this teaching unit",
                "en": f"DEBUG {self.request.user} {teaching_unit.author} {self.request.user.is_staff}",
                "cz": "Nejste autorem této výuky"
            }, status=status.HTTP_403_FORBIDDEN)

        if teaching_unit.alternatives.filter(pk=alternative).exists():
            return Response({
                "en": "Teaching unit is already assigned to this alternative",
                "cz": "Výuka je již přiřazena k této alternativě"
            }, status=status.HTTP_409_CONFLICT)

        teaching_unit.alternatives.add(alternative_unit)
        teaching_unit.save()

        return Response(status=status.HTTP_201_CREATED)

class TeachingUnitAddAdviceURL(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, teaching_unit_pk):
        """
        Add advice url to teaching unit
        Example data:
        {
            "url": "https://www.google.com"
        }
        """
        url = request.data.get('url', None)
        if url is None:
            return Response({
                "en": "URL must be specified",
                "cz": "URL musí být specifikováno"
            }, status=status.HTTP_400_BAD_REQUEST)

        teaching_unit = generics.get_object_or_404(TeachingUnit, pk=teaching_unit_pk, is_hidden=False)
        if self.request.user != teaching_unit.author and not self.request.user.is_staff:
            return Response({
                "en": "You are not the author of this teaching unit",
                "cz": "Nejste autorem této výuky"
            }, status=status.HTTP_403_FORBIDDEN)

        if teaching_unit.advice_urls.filter(url=url).exists():
            return Response({
                "en": "Teaching unit already has this advice url",
                "cz": "Výuka již má přiřazený tento článek"
            }, status=status.HTTP_409_CONFLICT)

        link = LinkURL.objects.create(url=url)
        teaching_unit.advice_urls.add(link)

        return Response(status=status.HTTP_201_CREATED)

class TeachingUnitAddGuideURL(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, teaching_unit_pk):
        """
        Add guide url to teaching unit
        Example data:
        {
            "url": "https://www.google.com"
        }
        """
        url = request.data.get('url', None)
        if url is None:
            return Response({
                "en": "URL must be specified",
                "cz": "URL musí být specifikováno"
            }, status=status.HTTP_400_BAD_REQUEST)

        teaching_unit = generics.get_object_or_404(TeachingUnit, pk=teaching_unit_pk, is_hidden=False)
        if self.request.user != teaching_unit.author and not self.request.user.is_staff:
            return Response({
                "en": "You are not the author of this teaching unit",
                "cz": "Nejste autorem této výuky"
            }, status=status.HTTP_403_FORBIDDEN)

        if teaching_unit.guide_urls.filter(url=url).exists():
            return Response({
                "en": "Teaching unit already has this guide url",
                "cz": "Výuka již má přiřazený tento návod"
            }, status=status.HTTP_409_CONFLICT)

        link = LinkURL.objects.create(url=url)
        teaching_unit.guide_urls.add(link)

        return Response(status=status.HTTP_201_CREATED)

class TeachingUnitsRecommendedListView(generics.ListAPIView):
    serializer_class = TeachingUnitSerializer

    def get_queryset(self):
        count = self.request.query_params.get('count', 10)
        if count is not None:
            try:
                count = int(count)
            except ValueError:
                return TeachingUnit.objects.none()

        return TeachingUnit.objects.filter(is_hidden=False).filter(is_recommended=1).order_by('?')[:count]

class TeachingUnitsPlanView(APIView):

    def get(self, request, teaching_unit_pk):
        unit = generics.get_object_or_404(TeachingUnit, pk=teaching_unit_pk, is_hidden=False)

        lessons = unit.lessons.all()

        data = []
        for lesson in lessons:
            data.append({
                "id": lesson.pk,
                "name": lesson.name,
                "preview_file": lesson.preview_file.url
            })

        return Response({"lessons": data}, status=status.HTTP_200_OK)

class TeachingUnitCirriculumsListView(generics.ListAPIView):
    serializer_class = CurriculumSerializer

    def get_queryset(self):
        try:
            return Curriculum.objects.filter(teaching_units__pk=self.kwargs['pk'], teaching_units__is_hidden=False)
        except TeachingUnit.DoesNotExist:
            return Curriculum.objects.none()

class TeachingUnitCirruculumsAssignView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, teaching_unit_pk):
        """
        Assign teaching unit to curriculum
        Example data:
        {
            "curriculum": 1
        }
        """
        curriculum_id = request.data.get('curriculum', None)
        if curriculum_id is None:
            return Response({
                "en": "Curriculum must be specified",
                "cz": "Kurikulum musí být specifikováno"
            }, status=status.HTTP_400_BAD_REQUEST)

        teaching_unit = generics.get_object_or_404(TeachingUnit, pk=teaching_unit_pk, is_hidden=False)
        if self.request.user != teaching_unit.author and not self.request.user.is_staff:
            return Response({
                "en": "You are not the author of this teaching unit",
                "cz": "Nejste autorem této výuky"
            }, status=status.HTTP_403_FORBIDDEN)

        curriculum = generics.get_object_or_404(Curriculum, pk=curriculum_id)
        if curriculum in teaching_unit.curriculums.all():
            return Response({
                "en": "Teaching unit is already assigned to this curriculum",
                "cz": "Výuka je již přiřazena k tomuto kurikulu"
            }, status=status.HTTP_400_BAD_REQUEST)

        teaching_unit.curriculums.add(curriculum)

        return Response(status=status.HTTP_201_CREATED)

    def delete(self, request, teaching_unit_pk):
        """
        Unassign teaching unit from curriculum
        Example data:
        {
            "curriculum": 1
        }
        """
        curriculum_id = request.data.get('curriculum', None)
        if curriculum_id is None:
            return Response({
                "en": "Curriculum must be specified",
                "cz": "Kurikulum musí být specifikováno"
            }, status=status.HTTP_400_BAD_REQUEST)

        teaching_unit = generics.get_object_or_404(TeachingUnit, pk=teaching_unit_pk)
        if self.request.user != teaching_unit.author and not self.request.user.is_staff:
            return Response({
                "en": "You are not the author of this teaching unit",
                "cz": "Nejste autorem této výuky"
            }, status=status.HTTP_403_FORBIDDEN)

        curriculum = generics.get_object_or_404(Curriculum, pk=curriculum_id)
        if curriculum not in teaching_unit.curriculums.all():
            return Response({
                "en": "Teaching unit is not assigned to this curriculum",
                "cz": "Výuka není přiřazena k tomuto kurikulu"
            }, status=status.HTTP_400_BAD_REQUEST)

        teaching_unit.curriculums.remove(curriculum)

        return Response(status=status.HTTP_204_NO_CONTENT)

class TeachingUnitAddView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        name = request.data.get('name', None)
        lesson_count = request.data.get('lessonCount', None)
        description = request.data.get('description', None)
        subject_id = request.data.get('subject', {}).get('id', None)
        grade_id = request.data.get('grade', {}).get('id', None)
        language_id = request.data.get('language', {}).get('id', None)
        curriculums = request.data.get('curriculums', [])
        keywords = request.data.get('keywords', [])
        zip_file = request.data.get('zipFile', None)
        lessons = request.data.get('lessons', None)

        # Check if all required fields are present
        if name is None or lesson_count is None or subject_id is None or grade_id is None\
              or language_id is None or zip_file is None or lessons is None:
            return Response({
                "en": "All required fields must be specified",
                "cz": "Všechna povinná pole musí být specifikována"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if all required fields are valid
        if not Subject.objects.filter(pk=subject_id).exists():
            return Response({
                "en": "Subject is not valid",
                "cz": "Předmět není platný"
            }, status=status.HTTP_400_BAD_REQUEST)

        if not Grade.objects.filter(pk=grade_id).exists():
            return Response({
                "en": "Grade is not valid",
                "cz": "Ročník není platný"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not Language.objects.filter(pk=language_id).exists():
            return Response({
                "en": "Language is not valid",
                "cz": "Jazyk není platný"
            }, status=status.HTTP_400_BAD_REQUEST)

        # decode base64 zip file
        zip_file_raw = zip_file.split(",")[1]
        zip_file_decoded = base64.b64decode(zip_file_raw)
        # unzip the file in memory
        zip_lessons = []
        with zipfile.ZipFile(io.BytesIO(zip_file_decoded)) as zip_file:
            for filename in zip_file.namelist():
                if not filename.endswith(".json"):
                    continue

                file = zip_file.open(filename)
                file_decoded = file.read()
                file_decoded = file_decoded.decode('utf-8')
                data = json.loads(file_decoded)

                if "lessons" in data:
                    continue

                if "name" not in data:
                    return Response({
                        "en": "Invalid ZIP file",
                        "cz": "Neplatný ZIP soubor"
                    }, status=status.HTTP_400_BAD_REQUEST)

                preview_html_filename = filename.replace(".json", ".html")
                with zip_file.open(preview_html_filename) as preview_html_file:
                    preview_html_file = preview_html_file.read()
                    django_file = File(io.BytesIO(preview_html_file), name=preview_html_filename)

                    lesson = {
                        "name": data["name"],
                        "preview_html_file": django_file,
                    }
                    zip_lessons.append(lesson)

        if len(zip_lessons) != lesson_count:
            return Response({
                "en": "Invalid ZIP file",
                "cz": "Neplatný ZIP soubor"
            }, status=status.HTTP_400_BAD_REQUEST)

        for zip_lesson, lesson_name in zip(zip_lessons, lessons):
            if zip_lesson["name"] != lesson_name:
                return Response({
                    "en": "Invalid ZIP file",
                    "cz": "Neplatný ZIP soubor"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        zip_file_file = File(io.BytesIO(zip_file_decoded), name="file.zip")
        # Create teaching unit
        tu = TeachingUnit.objects.create(
            name=name,
            number_of_lessons=lesson_count,
            description=description,
            subject_id=subject_id,
            grade_id=grade_id,
            language_id=language_id,
            author=self.request.user,
            zip_file=zip_file_file
        )

        for lesson in zip_lessons:
            Lesson.objects.create(
                name=lesson["name"],
                preview_file=lesson["preview_html_file"],
                teaching_unit=tu
            )

        for curriculum in curriculums:
            try:
                cur = Curriculum.objects.get(name__iexact=curriculum)
            except Curriculum.DoesNotExist:
                cur = Curriculum.objects.create(name=curriculum)
            tu.curriculums.add(cur)

        for keyword in keywords:
            try:
                tag = Tag.objects.get(name__iexact=keyword)
            except Tag.DoesNotExist:
                tag = Tag.objects.create(name=keyword)

            tu.tags.add(tag)

        return Response({
            "id": tu.pk
        }, status=status.HTTP_201_CREATED)


class TeachingUnitDeleteView(generics.DestroyAPIView):
    permission_classes = (permissions.IsAdminUser | IsAuthor,)

    def get_queryset(self):
        return TeachingUnit.objects.filter(is_hidden=False)

    def perform_destroy(self, instance):
        instance.is_hidden = True
        instance.save()

class TeachingUnitUpdateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request, pk):
        name = request.data.get('name', None)
        lesson_count = request.data.get('lessonCount', None)
        description = request.data.get('description', None)
        subject_id = request.data.get('subject', {}).get('id', None)
        grade_id = request.data.get('grade', {}).get('id', None)
        language_id = request.data.get('language', {}).get('id', None)
        curriculums = request.data.get('curriculums', [])
        keywords = request.data.get('keywords', [])

        ### VALIDATE INPUT
        if subject_id:
            if not Subject.objects.filter(pk=subject_id).exists():
                return Response({
                    "en": "Subject is not valid",
                    "cz": "Předmět není platný"
                }, status=status.HTTP_400_BAD_REQUEST)

        if grade_id:
            if not Grade.objects.filter(pk=grade_id).exists():
                return Response({
                    "en": "Grade is not valid",
                    "cz": "Ročník není platný"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if language_id:
            if not Language.objects.filter(pk=language_id).exists():
                return Response({
                    "en": "Language is not valid",
                    "cz": "Jazyk není platný"
                }, status=status.HTTP_400_BAD_REQUEST)

        ### GET OBJ
        try:
            tu = TeachingUnit.objects.get(pk=pk, is_hidden=False)
        except TeachingUnit.DoesNotExist:
            return Response({
                "en": "Teaching unit does not exist",
                "cz": "Výuka neexistuje"
            }, status=status.HTTP_404_NOT_FOUND)

        if self.request.user != tu.author and not self.request.user.is_staff:
            return Response({
                "en": "You are not the author of this teaching unit",
                "cz": "Nejste autorem této výuky"
            }, status=status.HTTP_403_FORBIDDEN)

        if name is not None:
            tu.name = name

        if description is not None:
            tu.description = description

        if lesson_count is not None:
            tu.number_of_lessons = lesson_count

        if subject_id is not None:
            tu.subject_id = subject_id

        if grade_id is not None:
            tu.grade_id = grade_id

        if language_id is not None:
            tu.language_id = language_id


        tu.curriculums.clear()
        for curriculum in curriculums:
            try:
                cur = Curriculum.objects.get(name__iexact=curriculum)
            except Curriculum.DoesNotExist:
                cur = Curriculum.objects.create(name=curriculum)
            tu.curriculums.add(cur)

        tu.tags.clear()
        for keyword in keywords:
            try:
                tag = Tag.objects.get(name__iexact=keyword)
            except Tag.DoesNotExist:
                tag = Tag.objects.create(name=keyword)

            tu.tags.add(tag)

        tu.save()

        serializer = TeachingUnitSerializer(tu)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TeachingUnitDeleteAlternativeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, unit_pk, alternative_pk):
        try:
            unit = TeachingUnit.objects.get(pk=unit_pk, is_hidden=False)
        except TeachingUnit.DoesNotExist:
            return Response({
                "en": "Teaching unit does not exist",
                "cz": "Výuka neexistuje"
            }, status=status.HTTP_404_NOT_FOUND)
        
        if self.request.user != unit.author and not self.request.user.is_staff:
            return Response({
                "en": "You are not the author of this teaching unit",
                "cz": "Nejste autorem této výuky"
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not unit.alternatives.filter(pk=alternative_pk).exists():
            return Response({
                "en": "Alternative does not exist",
                "cz": "Alternativa neexistuje"
            }, status=status.HTTP_404_NOT_FOUND)
        
        unit.alternatives.remove(alternative_pk)
        unit.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class TeachingUnitMutationAddView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, parent_pk):
        name = request.data.get('name', None)
        lesson_count = request.data.get('lessonCount', None)
        description = request.data.get('description', None)
        subject_id = request.data.get('subject', {}).get('id', None)
        grade_id = request.data.get('grade', {}).get('id', None)
        language_id = request.data.get('language', {}).get('id', None)
        curriculums = request.data.get('curriculums', [])
        keywords = request.data.get('keywords', [])
        zip_file = request.data.get('zipFile', None)
        lessons = request.data.get('lessons', None)

        # Check if all required fields are present
        if name is None or lesson_count is None or subject_id is None or grade_id is None\
              or language_id is None or zip_file is None or lessons is None:
            return Response({
                "en": "All required fields must be specified",
                "cz": "Všechna povinná pole musí být specifikována"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if all required fields are valid
        if not Subject.objects.filter(pk=subject_id).exists():
            return Response({
                "en": "Subject is not valid",
                "cz": "Předmět není platný"
            }, status=status.HTTP_400_BAD_REQUEST)

        if not Grade.objects.filter(pk=grade_id).exists():
            return Response({
                "en": "Grade is not valid",
                "cz": "Ročník není platný"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not Language.objects.filter(pk=language_id).exists():
            return Response({
                "en": "Language is not valid",
                "cz": "Jazyk není platný"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            parent_unit = TeachingUnit.objects.get(pk=parent_pk, is_hidden=False)
        except TeachingUnit.DoesNotExist:
            return Response({
                "en": "Parent teaching unit does not exist",
                "cz": "Mateřská výuka neexistuje"
            }, status=status.HTTP_404_NOT_FOUND)

        if subject_id != parent_unit.subject_id:
            return Response({
                "en": "Subject must be the same as parent teaching unit",
                "cz": "Předmět musí být stejný jako mateřská výuka"
            }, status=status.HTTP_400_BAD_REQUEST)

        # decode base64 zip file
        zip_file_raw = zip_file.split(",")[1]
        zip_file_decoded = base64.b64decode(zip_file_raw)
        # unzip the file in memory
        zip_lessons = []
        with zipfile.ZipFile(io.BytesIO(zip_file_decoded)) as zip_file:
            for filename in zip_file.namelist():
                if not filename.endswith(".json"):
                    continue

                file = zip_file.open(filename)
                file_decoded = file.read()
                file_decoded = file_decoded.decode('utf-8')
                data = json.loads(file_decoded)

                if "lessons" in data:
                    continue

                if "name" not in data:
                    return Response({
                        "en": "Invalid ZIP file",
                        "cz": "Neplatný ZIP soubor"
                    }, status=status.HTTP_400_BAD_REQUEST)

                preview_html_filename = filename.replace(".json", ".html")
                with zip_file.open(preview_html_filename) as preview_html_file:
                    preview_html_file = preview_html_file.read()
                    django_file = File(io.BytesIO(preview_html_file), name=preview_html_filename)

                    lesson = {
                        "name": data["name"],
                        "preview_html_file": django_file,
                    }
                    zip_lessons.append(lesson)

        if len(zip_lessons) != lesson_count:
            return Response({
                "en": "Invalid ZIP file",
                "cz": "Neplatný ZIP soubor"
            }, status=status.HTTP_400_BAD_REQUEST)

        for zip_lesson, lesson_name in zip(zip_lessons, lessons):
            if zip_lesson["name"] != lesson_name:
                return Response({
                    "en": "Invalid ZIP file",
                    "cz": "Neplatný ZIP soubor"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        zip_file_file = File(io.BytesIO(zip_file_decoded), name="file.zip")
        # Create teaching unit
        tu = TeachingUnit.objects.create(
            name=name,
            number_of_lessons=lesson_count,
            description=description,
            subject_id=subject_id,
            grade_id=grade_id,
            language_id=language_id,
            author=self.request.user,
            zip_file=zip_file_file,
            parent=parent_unit
        )

        for lesson in zip_lessons:
            Lesson.objects.create(
                name=lesson["name"],
                preview_file=lesson["preview_html_file"],
                teaching_unit=tu
            )

        for curriculum in curriculums:
            try:
                cur = Curriculum.objects.get(name__iexact=curriculum)
            except Curriculum.DoesNotExist:
                cur = Curriculum.objects.create(name=curriculum)
            tu.curriculums.add(cur)

        for keyword in keywords:
            try:
                tag = Tag.objects.get(name__iexact=keyword)
            except Tag.DoesNotExist:
                tag = Tag.objects.create(name=keyword)

            tu.tags.add(tag)

        return Response({
            "id": tu.pk
        }, status=status.HTTP_201_CREATED)

class TeachingUnitDeleteGuideURLView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, unit_pk, guide_url_pk):
        try:
            unit = TeachingUnit.objects.get(pk=unit_pk, is_hidden=False)
        except TeachingUnit.DoesNotExist:
            return Response({
                "en": "Teaching unit does not exist",
                "cz": "Výuka neexistuje"
            }, status=status.HTTP_404_NOT_FOUND)
        
        if self.request.user != unit.author and not self.request.user.is_staff:
            return Response({
                "en": "You are not the author of this teaching unit",
                "cz": "Nejste autorem této výuky"
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not unit.guide_urls.filter(pk=guide_url_pk).exists():
            return Response({
                "en": "Guide does not exist",
                "cz": "Návod neexistuje"
            }, status=status.HTTP_404_NOT_FOUND)
        
        unit.guide_urls.remove(guide_url_pk)
        unit.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

class TeachingUnitDeleteAdviceURLView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, unit_pk, advice_url_pk):
        try:
            unit = TeachingUnit.objects.get(pk=unit_pk, is_hidden=False)
        except TeachingUnit.DoesNotExist:
            return Response({
                "en": "Teaching unit does not exist",
                "cz": "Výuka neexistuje"
            }, status=status.HTTP_404_NOT_FOUND)
        
        if self.request.user != unit.author and not self.request.user.is_staff:
            return Response({
                "en": "You are not the author of this teaching unit",
                "cz": "Nejste autorem této výuky"
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not unit.advice_urls.filter(pk=advice_url_pk).exists():
            return Response({
                "en": "Advice does not exist",
                "cz": "Článek neexistuje"
            }, status=status.HTTP_404_NOT_FOUND)
        
        unit.advice_urls.remove(advice_url_pk)
        unit.save()

        return Response(status=status.HTTP_204_NO_CONTENT)