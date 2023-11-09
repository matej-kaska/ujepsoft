from django.test import TestCase
from rest_framework.test import APIRequestFactory, APIClient

from users.models import User
from eduklub.models import (GradeType,
                            Grade,
                            Subject,
                            Language,
                            TeachingUnit,
                            Rating)

# Create your tests here.
class TeachingUnitsListViewTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.uri = '/api/teaching-units'

        self.author = User.objects.create_user(
            email='test@eduklub.cz',
            password='test',
        )
        self.author2 = User.objects.create_user(
            email='test2@eduklub.cz',
            password='test2',
        )

        self.grade_type = GradeType.objects.create(name='Gympl')
        self.grade_type2 = GradeType.objects.create(name='Základka')

        self.grade = Grade.objects.create(name='1. třída', grade_type=self.grade_type)
        self.grade2 = Grade.objects.create(name='2. třída', grade_type=self.grade_type2)
        self.grade3 = Grade.objects.create(name='3. třída', grade_type=self.grade_type)

        self.subject = Subject.objects.create(name='Matika')
        self.subject2 = Subject.objects.create(name='Čeština')

        self.language = Language.objects.create(name='Čeština')
        self.language2 = Language.objects.create(name='Angličtina')

        self.teaching_unit = TeachingUnit.objects.create(
            name='Test teaching unit',
            author=self.author,
            grade=self.grade,
            subject=self.subject,
            language=self.language,
            number_of_lessons=1,
            number_of_downloads=1,
            certificated=True,
            zip_file='non-existent.zip',
        )
        self.teaching_unit2 = TeachingUnit.objects.create(
            name='Test teaching unit 2',
            author=self.author2,
            grade=self.grade2,
            subject=self.subject2,
            language=self.language2,
            number_of_lessons=2,
            number_of_downloads=2,
            is_recommended=True,
            zip_file='non-existent.zip',
        )
        self.teaching_unit3 = TeachingUnit.objects.create(
            name='Test teaching unit 3',
            author=self.author2,
            grade=self.grade,
            subject=self.subject,
            language=self.language,
            number_of_lessons=3,
            number_of_downloads=3,
            is_recommended=True,
            zip_file='non-existent.zip',
        )
        self.teaching_unit4 = TeachingUnit.objects.create(
            name='Test teaching unit 4',
            author=self.author,
            grade=self.grade2,
            subject=self.subject2,
            language=self.language2,
            number_of_lessons=4,
            number_of_downloads=4,
            certificated=True,
            zip_file='non-existent.zip',
        )
        self.teaching_unit5 = TeachingUnit.objects.create(
            name='Test teaching unit 5',
            author=self.author,
            grade=self.grade3,
            subject=self.subject,
            language=self.language,
            number_of_lessons=5,
            number_of_downloads=5,
            zip_file='non-existent.zip',
            parent=self.teaching_unit,
        )

        Rating.objects.create(
            rating=1,
            author=self.author,
            teaching_unit=self.teaching_unit,
        )
        Rating.objects.create(
            rating=2,
            author=self.author,
            teaching_unit=self.teaching_unit2,
        )
        Rating.objects.create(
            rating=3,
            author=self.author,
            teaching_unit=self.teaching_unit3,
        )
        Rating.objects.create(
            rating=4,
            author=self.author,
            teaching_unit=self.teaching_unit4,
        )
        Rating.objects.create(
            rating=5,
            author=self.author,
            teaching_unit=self.teaching_unit5,
        )
        Rating.objects.create(
            rating=4,
            author=self.author,
            teaching_unit=self.teaching_unit5,
        )

    def test_get_list(self):
        response = self.client.get(self.uri)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 5)

    def test_get_list_filter_q(self):
        response = self.client.get(self.uri, {'q': 'Test teaching unit 2'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 2')

    def test_get_list_filter_grade(self):
        response = self.client.get(self.uri, {'grades': self.grade.pk})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 3')

        response = self.client.get(self.uri, {'grades': ",".join([str(self.grade.pk), str(self.grade2.pk)])})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 4)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][2]["name"], 'Test teaching unit 3')
        self.assertEqual(response.data["results"][3]["name"], 'Test teaching unit 4')

    def test_get_list_filter_grade_type(self):
        response = self.client.get(self.uri, {'grade-types': self.grade_type.pk})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 3)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 3')
        self.assertEqual(response.data["results"][2]["name"], 'Test teaching unit 5')

        response = self.client.get(self.uri, {'grade-types': self.grade_type2.pk})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 4')

        response = self.client.get(self.uri, {'grade-types': ",".join([str(self.grade_type.pk), str(self.grade_type2.pk)])})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 5)

    def test_get_list_filter_author(self):
        response = self.client.get(self.uri, {'author': self.author.pk})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 3)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 4')
        self.assertEqual(response.data["results"][2]["name"], 'Test teaching unit 5')

        response = self.client.get(self.uri, {'author': self.author2.pk})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 3')

    def test_get_list_filter_certificated(self):
        response = self.client.get(self.uri, {'certificated': 1})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 4')

        response = self.client.get(self.uri, {'certificated': 0})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 3)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 3')
        self.assertEqual(response.data["results"][2]["name"], 'Test teaching unit 5')

    def test_get_list_filter_language(self):
        response = self.client.get(self.uri, {'language': self.language.pk})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 3)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 3')
        self.assertEqual(response.data["results"][2]["name"], 'Test teaching unit 5')

        response = self.client.get(self.uri, {'language': self.language2.pk})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 4')

    def test_get_list_filter_subject(self):
        response = self.client.get(self.uri, {'subjects': self.subject.pk})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 3)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 3')
        self.assertEqual(response.data["results"][2]["name"], 'Test teaching unit 5')

        response = self.client.get(self.uri, {'subjects': self.subject2.pk})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 4')

    def test_get_list_filter_is_mutation(self):
        response = self.client.get(self.uri, {'is-mutation': 1})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 5')

        response = self.client.get(self.uri, {'is-mutation': 0})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 4)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][2]["name"], 'Test teaching unit 3')
        self.assertEqual(response.data["results"][3]["name"], 'Test teaching unit 4')

    def test_get_list_filter_rating_class(self):
        response = self.client.get(self.uri, {'rating-class': '5-4'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 4')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 5')

        response = self.client.get(self.uri, {'rating-class': '4-3'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 3')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 4')

        response = self.client.get(self.uri, {'rating-class': '3-2'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 3')

        response = self.client.get(self.uri, {'rating-class': '2-1'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 2')

    def test_get_list_filter_order_by(self):
        # id by default
        response = self.client.get(self.uri)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 5)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][2]["name"], 'Test teaching unit 3')
        self.assertEqual(response.data["results"][3]["name"], 'Test teaching unit 4')
        self.assertEqual(response.data["results"][4]["name"], 'Test teaching unit 5')

        response = self.client.get(self.uri, {'order-by': '-number_of_lessons'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 5)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 5')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 4')
        self.assertEqual(response.data["results"][2]["name"], 'Test teaching unit 3')
        self.assertEqual(response.data["results"][3]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][4]["name"], 'Test teaching unit')

        response = self.client.get(self.uri, {'order-by': '-number_of_downloads'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 5)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 5')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 4')
        self.assertEqual(response.data["results"][2]["name"], 'Test teaching unit 3')
        self.assertEqual(response.data["results"][3]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][4]["name"], 'Test teaching unit')

        response = self.client.get(self.uri, {'order-by': '-avg_rating'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 5)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 5')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 4')
        self.assertEqual(response.data["results"][2]["name"], 'Test teaching unit 3')
        self.assertEqual(response.data["results"][3]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][4]["name"], 'Test teaching unit')

    def test_get_list_filter_is_recommended(self):
        response = self.client.get(self.uri, {'is-recommended': 1})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit 2')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 3')

        response = self.client.get(self.uri, {'is-recommended': 0})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 3)
        self.assertEqual(response.data["results"][0]["name"], 'Test teaching unit')
        self.assertEqual(response.data["results"][1]["name"], 'Test teaching unit 4')
        self.assertEqual(response.data["results"][2]["name"], 'Test teaching unit 5')

