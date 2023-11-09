from rest_framework.test import APITestCase
from rest_framework import status

from users.models import User
from eduklub.models import (FavoriteList,
                            Subject,
                            GradeType,
                            Grade,
                            Language,
                            TeachingUnit,
                            Rating)

class UsersTest(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin",
            password="admin",
            is_staff=True)
        self.user = User.objects.create_user(
            email="user",
            password="user")
        self.other_user = User.objects.create_user(
            email="other",
            password="other")
        
    def test_user_delete_self(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(f"/api/users/{self.user.pk}/delete", 
                                      data={"password": "user"},
                                      format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(User.objects.filter(is_active=True).count(), 2)

    def test_user_delete_self_wrong_password(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(f"/api/users/{self.user.pk}/delete", 
                                      data={"password": "wrong"},
                                      format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(User.objects.count(), 3)

    def test_user_delete_other(self):
        # Try to delete other user as user
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(f"/api/users/{self.other_user.pk}/delete", 
                                      data={"password": "other"},
                                      format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(User.objects.count(), 3)

    def test_user_delete_admin(self):
        # Try to delete other user as admin
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(f"/api/users/{self.other_user.pk}/delete")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(User.objects.filter(is_active=True).count(), 2)



class AuthorStatsTest(APITestCase):

    def _make_uri(self, author_id: int):
        return f'/api/authors/{author_id}/stats'

    def setUp(self):
        self.author = User.objects.create_user(
            email='test@eduklub.cz',
            password='test',
        )
        self.author2 = User.objects.create_user(
            email='test2@eduklub.cz',
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

        Rating.objects.create(
            rating=1,
            author=self.author,
            teaching_unit=self.teaching_unit,
        )
        Rating.objects.create(
            rating=3,
            author=self.author,
            teaching_unit=self.teaching_unit,
        )
        Rating.objects.create(
            rating=5,
            author=self.author,
            teaching_unit=self.teaching_unit2,
        )

    def test_get_author_stats(self):
        response = self.client.get(self._make_uri(self.author.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['published_count'], 2)
        self.assertEqual(response.data['download_count'], 3)
        self.assertEqual(response.data['average_rating'], 3)

    def test_get_author_stats_non_existent_author(self):
        response = self.client.get(self._make_uri(999))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_author_stats_without_published_teaching_units(self):
        response = self.client.get(self._make_uri(self.author2.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['published_count'], 0)
        self.assertEqual(response.data['download_count'], None)
        self.assertEqual(response.data['average_rating'], None)
