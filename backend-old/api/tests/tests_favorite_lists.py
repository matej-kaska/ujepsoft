from rest_framework.test import APITestCase

from users.models import User
from eduklub.models import (FavoriteList,
                            TeachingUnit,
                            Subject,
                            GradeType,
                            Grade,
                            Language)

class FavoriteListDeleteTeachingUnitTests(APITestCase):

    def _make_uri(self, favorite_list_id, teaching_unit_id):
        return f'/api/lists/{favorite_list_id}/teaching-units/{teaching_unit_id}'

    def setUp(self):
        self.author = User.objects.create_user(
            email='test@eduklub.cz',
            password='test',
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

        self.favorite_list = FavoriteList.objects.create(
            name='Test list',
            author=self.author,
            is_main=False,
        )
        self.favorite_list.teaching_units.add(self.teaching_unit)
        self.favorite_list.teaching_units.add(self.teaching_unit2)

    def test_delete_teaching_unit(self):
        self.client.force_authenticate(user=self.author)

        response = self.client.delete(self._make_uri(self.favorite_list.id, self.teaching_unit.id))
        self.assertEqual(response.status_code, 204)

        self.favorite_list.refresh_from_db()
        self.assertEqual(self.favorite_list.teaching_units.count(), 1)
        self.assertEqual(self.favorite_list.teaching_units.first().id, self.teaching_unit2.id)

    def test_delete_unauthorized(self):
        response = self.client.delete(self._make_uri(self.favorite_list.id, self.teaching_unit.id))
        self.assertEqual(response.status_code, 401)

    def test_delete_already_deleted(self):
        self.client.force_authenticate(user=self.author)

        response = self.client.delete(self._make_uri(self.favorite_list.id, self.teaching_unit.id))
        self.assertEqual(response.status_code, 204)

        response = self.client.delete(self._make_uri(self.favorite_list.id, self.teaching_unit.id))
        self.assertEqual(response.status_code, 404)

    def test_delete_non_existent(self):
        self.client.force_authenticate(user=self.author)

        response = self.client.delete(self._make_uri(self.favorite_list.id, 999))
        self.assertEqual(response.status_code, 404)

