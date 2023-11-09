from rest_framework.test import APITestCase
from rest_framework import status

from users.models import (User)
from eduklub.models import (Curriculum)


class TeachingUnitsTest(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_superuser('admin', 'admin')
        self.user = User.objects.create_user('user', 'user')
        self.curriculum1 = Curriculum.objects.create(name="Curriculum 1")

    def test_get_curriculums(self):
        """
        Ensure we can get a list of curriculum objects.
        """
        url = '/api/curriculums/'

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Curriculum.objects.count(), 1)
        self.assertEqual(Curriculum.objects.get().name, 'Curriculum 1')

    def test_retrieve_curriculum(self):
        """
        Ensure we can retrieve a curriculum object.
        """
        url = f'/api/curriculums/{self.curriculum1.pk}'

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Curriculum.objects.count(), 1)
        self.assertEqual(Curriculum.objects.get().name, 'Curriculum 1')

    def test_update_curriculum(self):
        """
        Ensure we can update a curriculum object.
        """
        self.client.force_authenticate(self.admin)

        url = f'/api/curriculums/{self.curriculum1.pk}'
        data = {'name': 'Curriculum 2'}

        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Curriculum.objects.count(), 1)
        self.assertEqual(Curriculum.objects.get().name, 'Curriculum 2')

    def test_create_curriculum(self):
        """
        Ensure we can create a new curriculum object.
        """
        self.client.force_authenticate(self.admin)

        url = '/api/curriculums/'
        data = {'name': 'Curriculum 2'}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Curriculum.objects.count(), 2)
        self.assertEqual(Curriculum.objects.get(pk=2).name, 'Curriculum 2')

    def test_delete_curriculum(self):
        """
        Ensure we can delete a curriculum object.
        """
        self.client.force_authenticate(self.admin)

        url = f'/api/curriculums/{self.curriculum1.pk}'

        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Curriculum.objects.count(), 0)

    def test_create_curriculum_non_admin(self):
        """
        Ensure we can't create a new curriculum object as non admin.
        """
        self.client.force_authenticate(self.user)

        url = '/api/curriculums/'
        data = {'name': 'Curriculum 2'}

        response = self.client.post(url, data, format='json')
        self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Curriculum.objects.count(), 1)

    def test_create_curriculum_unauthenticated(self):
        """
        Ensure we can't create a new curriculum object as unauthenticated.
        """
        url = '/api/curriculums/'
        data = {'name': 'Curriculum 2'}

        response = self.client.post(url, data, format='json')
        self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Curriculum.objects.count(), 1)