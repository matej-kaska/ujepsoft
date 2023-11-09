from rest_framework.test import APITestCase
from rest_framework import status
from django.test import TestCase
from rest_framework.test import APIClient

from .utils import create_basic_data

from users.models import User
from eduklub.models import (Subject,
                            GradeType,
                            Grade,
                            Language,
                            TeachingUnit,
                            Rating,
                            Curriculum)

class TeachingUnitTests2(APITestCase):

    def setUp(self):
        self.author = User.objects.create_user(
            email='test@eduklub.cz',
            password='test',
        )
        self.admin = User.objects.create_superuser(
            email="admin",
            password="admin",
        )
        self.other_user = User.objects.create_user(
            email="other",
            password="other",
        )

        self.grade_type = GradeType.objects.create(name='Gympl')
        self.grade_type2 = GradeType.objects.create(name='Základka')

        self.grade = Grade.objects.create(name='1. třída', grade_type=self.grade_type)
        self.grade2 = Grade.objects.create(name='2. třída', grade_type=self.grade_type2)

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
            author=self.author,
            grade=self.grade,
            subject=self.subject,
            language=self.language,
            number_of_lessons=2,
            number_of_downloads=2,
            is_recommended=True,
            zip_file='non-existent.zip',
        )
        self.teaching_unit_child = TeachingUnit.objects.create(
            name='Test teaching unit child',
            author=self.author,
            grade=self.grade,
            subject=self.subject,
            language=self.language,
            number_of_lessons=2,
            number_of_downloads=2,
            is_recommended=True,
            zip_file='non-existent.zip',
            parent=self.teaching_unit,
        )
        self.teaching_unit_child.alternatives.add(self.teaching_unit2)

    def test_delete_alternative(self):
        self.client.force_authenticate(user=self.author)

        response = self.client.delete(f"/api/teaching-units/{self.teaching_unit_child.pk}/alternatives/{self.teaching_unit2.pk}/delete")
        self.assertEqual(response.status_code, 204)

        self.teaching_unit_child.refresh_from_db()
        self.assertEqual(self.teaching_unit_child.alternatives.count(), 0)

    def test_delete_alternative_admin(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(f"/api/teaching-units/{self.teaching_unit_child.pk}/alternatives/{self.teaching_unit2.pk}/delete")
        self.assertEqual(response.status_code, 204)

        self.teaching_unit_child.refresh_from_db()
        self.assertEqual(self.teaching_unit_child.alternatives.count(), 0)

    def test_delete_alternative_other_user(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.delete(f"/api/teaching-units/{self.teaching_unit_child.pk}/alternatives/{self.teaching_unit2.pk}/delete")
        self.assertEqual(response.status_code, 403)

        self.teaching_unit_child.refresh_from_db()
        self.assertEqual(self.teaching_unit_child.alternatives.count(), 1)

    def test_update_teaching_unit_partial(self):
        self.client.force_authenticate(user=self.author)

        data = {
            "name": "Test teaching unit updated",
        }
        response = self.client.put(f"/api/teaching-units/{self.teaching_unit.pk}/update", data=data, format="json")
        self.assertEqual(response.status_code, 200)

        self.teaching_unit.refresh_from_db()
        self.assertEqual(self.teaching_unit.name, "Test teaching unit updated")
        self.assertEqual(self.teaching_unit.description, None)
        self.assertEqual(self.teaching_unit.subject.pk, self.subject.pk)
        self.assertEqual(self.teaching_unit.grade.pk, self.grade.pk)
        self.assertEqual(self.teaching_unit.language.pk, self.language.pk)
        self.assertEqual(self.teaching_unit.curriculums.count(), 0)
        self.assertEqual(self.teaching_unit.tags.count(), 0)

    def test_update_teaching_unit(self):
        self.client.force_authenticate(user=self.author)

        data = {
            "name": "Test teaching unit updated",
            "lessonCount": 999,
            "description": "Test description",
            "subject": {
                "id": self.subject2.pk,
            },
            "grade": {
                "id": self.grade2.pk,
            },
            "language": {
                "id": self.language2.pk,
            },
            "curriculums": ["olala"],
            "keywords": ["kek"],
        }
        response = self.client.put(f"/api/teaching-units/{self.teaching_unit.pk}/update", data=data, format="json")
        self.assertEqual(response.status_code, 200)

        self.teaching_unit.refresh_from_db()
        self.assertEqual(self.teaching_unit.name, "Test teaching unit updated")
        self.assertEqual(self.teaching_unit.description, "Test description")
        self.assertEqual(self.teaching_unit.subject.pk, self.subject2.pk)
        self.assertEqual(self.teaching_unit.grade.pk, self.grade2.pk)
        self.assertEqual(self.teaching_unit.language.pk, self.language2.pk)
        self.assertEqual(self.teaching_unit.curriculums.count(), 1)
        self.assertEqual(self.teaching_unit.curriculums.first().name, "olala")
        self.assertEqual(self.teaching_unit.tags.count(), 1)
        self.assertEqual(self.teaching_unit.tags.first().name, "kek")

    def test_update_teaching_unit_admin(self):
        self.client.force_authenticate(user=self.admin)

        data = {
            "name": "Test teaching unit updated",
            "lessonCount": 999,
            "description": "Test description",
            "subject": {
                "id": self.subject2.pk,
            },
            "grade": {
                "id": self.grade2.pk,
            },
            "language": {
                "id": self.language2.pk,
            },
            "curriculums": [],
            "keywords": [],
        }
        response = self.client.put(f"/api/teaching-units/{self.teaching_unit.pk}/update", data=data, format="json")
        self.assertEqual(response.status_code, 200)

        self.teaching_unit.refresh_from_db()
        self.assertEqual(self.teaching_unit.name, "Test teaching unit updated")
        self.assertEqual(self.teaching_unit.description, "Test description")
        self.assertEqual(self.teaching_unit.subject.pk, self.subject2.pk)
        self.assertEqual(self.teaching_unit.grade.pk, self.grade2.pk)
        self.assertEqual(self.teaching_unit.language.pk, self.language2.pk)
        self.assertEqual(self.teaching_unit.curriculums.count(), 0)
        self.assertEqual(self.teaching_unit.tags.count(), 0)

    def test_update_technig_unit_other_user(self):
        self.client.force_authenticate(user=self.other_user)

        data = {
            "name": "Test teaching unit updated",
            "lessonCount": 999,
            "description": "Test description",
            "subject": {
                "id": self.subject2.pk,
            },
            "grade": {
                "id": self.grade2.pk,
            },
            "language": {
                "id": self.language2.pk,
            },
            "curriculums": [],
            "keywords": [],
        }
        response = self.client.put(f"/api/teaching-units/{self.teaching_unit.pk}/update", data=data, format="json")
        self.assertEqual(response.status_code, 403)

    def test_remove_teaching_unit(self):
        self.assertEqual(self.teaching_unit_child.alternatives.count(), 1)
        self.client.force_authenticate(user=self.author)

        response = self.client.delete(f"/api/teaching-units/{self.teaching_unit2.pk}/delete")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(TeachingUnit.objects.filter(is_hidden=False).count(), 2)

        self.teaching_unit_child.refresh_from_db()
        self.assertEqual(self.teaching_unit_child.alternatives.filter(is_hidden=False).count(), 0)

    def test_remove_child_teaching_unit(self):
        self.client.force_authenticate(user=self.author)

        response = self.client.delete(f"/api/teaching-units/{self.teaching_unit_child.pk}/delete")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(TeachingUnit.objects.filter(is_hidden=False).count(), 2)

    def test_remove_parent_teaching_unit(self):
        self.client.force_authenticate(user=self.author)

        response = self.client.delete(f"/api/teaching-units/{self.teaching_unit.pk}/delete")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(TeachingUnit.objects.filter(is_hidden=False).count(), 2)

    def test_delete_teaching_unit_admin(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(f"/api/teaching-units/{self.teaching_unit2.pk}/delete")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(TeachingUnit.objects.filter(is_hidden=False).count(), 2)

    def test_delete_teaching_unit_other_user(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.delete(f"/api/teaching-units/{self.teaching_unit2.pk}/delete")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(TeachingUnit.objects.filter(is_hidden=False).count(), 3)


class TeachingUnitsTest(APITestCase):

    def setUp(self):
        self.curriculum1 = Curriculum.objects.create(name="Curriculum 1")

        self.admin = User.objects.create_superuser('admin', 'admin')
        self.user = User.objects.create_user('user', 'user')

        (self.author, self.grade_type, self.grade,
          self.subject, self.language, self.teaching_unit,
            self.teaching_unit2, self.favorite_list) = create_basic_data()

    def test_deassign_curriculum(self):
        """
        Ensure we can deassign a curriculum from a teaching unit.
        """
        self.client.force_authenticate(self.author)

        self.teaching_unit.curriculums.add(self.curriculum1)

        url = f'/api/teaching-units/{self.teaching_unit.pk}/curriculums/assign'
        data = {'curriculum': self.curriculum1.pk}

        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(TeachingUnit.objects.get(pk=self.teaching_unit.pk).curriculums.count(), 0)

    def test_deassign_nonexistent_curriculum(self):
        """
        Ensure we cannot deassign a nonexistent curriculum from a teaching unit.
        """
        self.client.force_authenticate(self.author)

        url = f'/api/teaching-units/{self.teaching_unit.pk}/curriculums/assign'
        data = {'curriculum': self.curriculum1.pk}

        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(TeachingUnit.objects.get(pk=self.teaching_unit.pk).curriculums.count(), 0)

    def test_assign_curriculum(self):
        """
        Ensure we can assign a curriculum to a teaching unit.
        """
        self.client.force_authenticate(self.author)

        url = f'/api/teaching-units/{self.teaching_unit.pk}/curriculums/assign'
        data = {'curriculum': self.curriculum1.pk}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TeachingUnit.objects.get(pk=self.teaching_unit.pk).curriculums.first().pk, self.curriculum1.pk)

    def test_double_assign_curriculum(self):
        """
        Ensure we cannot assign a curriculum to a teaching unit twice.
        """
        self.client.force_authenticate(self.author)

        url = f'/api/teaching-units/{self.teaching_unit.pk}/curriculums/assign'
        data = {'curriculum': self.curriculum1.pk}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TeachingUnit.objects.get(pk=self.teaching_unit.pk).curriculums.first().pk, self.curriculum1.pk)

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_assign_curriculum_admin(self):
        """
        Ensure we can assign a curriculum to a teaching unit as admin.
        """
        self.client.force_authenticate(self.admin)

        url = f'/api/teaching-units/{self.teaching_unit.pk}/curriculums/assign'
        data = {'curriculum': self.curriculum1.pk}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TeachingUnit.objects.get(pk=self.teaching_unit.pk).curriculums.first().pk, self.curriculum1.pk)

    def test_assign_curriculum_not_author(self):
        """
        Ensure we cannot assign a curriculum to a teaching unit as not author.
        """
        self.client.force_authenticate(self.user)

        url = f'/api/teaching-units/{self.teaching_unit.pk}/curriculums/assign'
        data = {'curriculum': self.curriculum1.pk}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_assign_curriculum_unauthenticated(self):
        """
        Ensure we cannot assign a curriculum to a teaching unit as unauthenticated.
        """
        url = f'/api/teaching-units/{self.teaching_unit.pk}/curriculums/assign'
        data = {'curriculum': self.curriculum1.pk}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_alternative(self):
        self.client.force_authenticate(user=self.author)

        data = {
            'alternative': self.teaching_unit2.pk,
        }

        response = self.client.post(f'/api/teaching-units/{self.teaching_unit.pk}/alternatives', data=data)
        self.assertEqual(response.status_code, 201)

        self.teaching_unit.refresh_from_db()
        self.assertEqual(self.teaching_unit.alternatives.count(), 1)
        self.assertEqual(self.teaching_unit.alternatives.first().pk, self.teaching_unit2.pk)

    def test_add_advice_url(self):
        self.client.force_authenticate(user=self.author)

        data = {
            'url': 'https://www.google.com',
        }

        response = self.client.post(f'/api/teaching-units/{self.teaching_unit.pk}/advice-urls', data=data)
        self.assertEqual(response.status_code, 201)

        self.teaching_unit.refresh_from_db()
        self.assertEqual(self.teaching_unit.advice_urls.count(), 1)
        self.assertEqual(self.teaching_unit.advice_urls.first().url, 'https://www.google.com')

    def test_add_guide_url(self):
        self.client.force_authenticate(user=self.author)

        data = {
            'url': 'https://www.google.com',
        }

        response = self.client.post(f'/api/teaching-units/{self.teaching_unit.pk}/guide-urls', data=data)
        self.assertEqual(response.status_code, 201)

        self.teaching_unit.refresh_from_db()
        self.assertEqual(self.teaching_unit.guide_urls.count(), 1)
        self.assertEqual(self.teaching_unit.guide_urls.first().url, 'https://www.google.com')


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


class TeachingUnitUpdateAdminTest(APITestCase):

    def _make_uri(self, teaching_unit_id: int):
        return f'/api/teaching-units/{teaching_unit_id}/update/admin'

    def setUp(self):
        self.author = User.objects.create_user(
            email='test@eduklub.cz',
            password='test',
        )
        self.admin = User.objects.create_user(
            email="admin@eduklub.cz",
            password="admin",
            is_staff=True,
        )

        self.grade_type = GradeType.objects.create(name='Gympl')
        self.grade = Grade.objects.create(name='1. třída', grade_type=self.grade_type)
        self.subject = Subject.objects.create(name='Matika')
        self.language = Language.objects.create(name='Čeština')

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

    def test_update_certificated(self):
        self.client.force_authenticate(self.admin)

        response = self.client.put(
            self._make_uri(self.teaching_unit.pk),
            data={
                'certificated': False,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['certificated'], False)

    def test_update_is_reccomended(self):
        self.client.force_authenticate(self.admin)

        response = self.client.put(
            self._make_uri(self.teaching_unit.pk),
            data={
                'is_recommended': True,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_recommended'], True)

    def test_update_certificated_and_is_recommended(self):
        self.client.force_authenticate(self.admin)

        response = self.client.put(
            self._make_uri(self.teaching_unit.pk),
            data={
                'certificated': False,
                'is_recommended': True,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['certificated'], False)
        self.assertEqual(response.data['is_recommended'], True)

    def test_update_as_unauthenticated(self):
        response = self.client.put(
            self._make_uri(self.teaching_unit.pk),
            data={
                'certificated': False,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_with_patch(self):
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            self._make_uri(self.teaching_unit.pk),
            data={
                'certificated': False,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['certificated'], False)

    def test_update_different_field(self):
        self.client.force_authenticate(self.admin)

        response = self.client.put(
            self._make_uri(self.teaching_unit.pk),
            data={
                'name': 'New name',
            },
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

