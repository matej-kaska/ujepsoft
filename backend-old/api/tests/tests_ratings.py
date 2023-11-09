from rest_framework.test import APITestCase

from .utils import create_basic_data
from eduklub.models import Rating, RatingComment
from users.models import User

class RatingTestCase2(APITestCase):

    def setUp(self):
        (self.author, self.grade_type, self.grade,
          self.subject, self.language, self.teaching_unit,
            self.teaching_unit2, self.favorite_list) = create_basic_data()

        self.admin = User.objects.create_user(
            email='admin',
            password='admin',
            is_staff=True,
        )
        self.other_user = User.objects.create_user(
            email='other_user',
            password='other_user',
        )

        self.rating = Rating.objects.create(
            rating=5,
            teaching_unit=self.teaching_unit,
            author=self.author,
        )

        self.comment_positive = RatingComment.objects.create(
            rating=self.rating,
            text="Test positive comment",
            is_positive=True,
        )
        self.comment_negative = RatingComment.objects.create(
            rating=self.rating,
            text="Test negative comment",
            is_positive=False,
        )

    def test_delete_rating_author(self):
        self.client.force_authenticate(user=self.author)

        response = self.client.delete(f"/api/ratings/{self.rating.pk}/delete")
        self.assertEqual(response.status_code, 204)

        self.assertEqual(Rating.objects.count(), 0)

    def test_delete_rating_admin(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(f"/api/ratings/{self.rating.pk}/delete")
        self.assertEqual(response.status_code, 204)

        self.assertEqual(Rating.objects.count(), 0)

    def test_delete_rating_other_user(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.delete(f"/api/ratings/{self.rating.pk}/delete")
        self.assertEqual(response.status_code, 403)

        self.assertEqual(Rating.objects.count(), 1)

    def test_update_rating_author(self):
        self.client.force_authenticate(user=self.author)

        data = {
            "rating": 2,
            "positive_comments": [
                "Test positive comment 2",
            ],
            "negative_comments": [
                "Test negative comment 2",
            ]
        }
        response = self.client.put(f"/api/ratings/{self.rating.pk}/update", data=data, format="json")
        self.assertEqual(response.status_code, 200)

        self.assertEqual(Rating.objects.count(), 1)
        self.assertEqual(Rating.objects.first().rating, 2)
        self.assertEqual(RatingComment.objects.count(), 2)
        self.assertEqual(RatingComment.objects.filter(is_positive=True).count(), 1)
        self.assertEqual(RatingComment.objects.filter(is_positive=False).count(), 1)
        self.assertEqual(RatingComment.objects.filter(is_positive=True).first().text, "Test positive comment 2")
        self.assertEqual(RatingComment.objects.filter(is_positive=False).first().text, "Test negative comment 2")

    def test_update_rating_admin(self):
        self.client.force_authenticate(user=self.admin)

        data = {
            "rating": 2,
            "positive_comments": [
                "Test positive comment 2",
            ],
            "negative_comments": [
                "Test negative comment 2",
            ]
        }
        response = self.client.put(f"/api/ratings/{self.rating.pk}/update", data=data, format="json")
        self.assertEqual(response.status_code, 200)

        self.assertEqual(Rating.objects.count(), 1)
        self.assertEqual(Rating.objects.first().rating, 2)
        self.assertEqual(RatingComment.objects.count(), 2)
        self.assertEqual(RatingComment.objects.filter(is_positive=True).count(), 1)
        self.assertEqual(RatingComment.objects.filter(is_positive=False).count(), 1)
        self.assertEqual(RatingComment.objects.filter(is_positive=True).first().text, "Test positive comment 2")
        self.assertEqual(RatingComment.objects.filter(is_positive=False).first().text, "Test negative comment 2")

    def test_update_rating_other_user(self):
        self.client.force_authenticate(user=self.other_user)

        data = {
            "rating": 2,
            "positive_comments": [
                "Test positive comment 2",
            ],
            "negative_comments": [
                "Test negative comment 2",
            ]
        }
        response = self.client.put(f"/api/ratings/{self.rating.pk}/update", data=data, format="json")
        self.assertEqual(response.status_code, 403)

        self.assertEqual(Rating.objects.count(), 1)
        self.assertEqual(Rating.objects.first().rating, 5)
        self.assertEqual(RatingComment.objects.count(), 2)
        self.assertEqual(RatingComment.objects.filter(is_positive=True).count(), 1)
        self.assertEqual(RatingComment.objects.filter(is_positive=False).count(), 1)
        self.assertEqual(RatingComment.objects.filter(is_positive=True).first().text, "Test positive comment")
        self.assertEqual(RatingComment.objects.filter(is_positive=False).first().text, "Test negative comment")

    def test_update_no_comments(self):
        self.client.force_authenticate(user=self.author)

        data = {
            "rating": 2,
        }
        response = self.client.put(f"/api/ratings/{self.rating.pk}/update", data=data, format="json")
        self.assertEqual(response.status_code, 200)

        self.assertEqual(Rating.objects.count(), 1)
        self.assertEqual(Rating.objects.first().rating, 2)
        self.assertEqual(RatingComment.objects.filter(rating=self.rating).count(), 0)



class RatingTestCase(APITestCase):

    def _make_uri(self, teaching_unit_id: int) -> str:
        return f'/api/teaching-units/{teaching_unit_id}/ratings'

    def setUp(self):
        (self.author, self.grade_type, self.grade,
          self.subject, self.language, self.teaching_unit,
            self.teaching_unit2, self.favorite_list) = create_basic_data()

    def test_add_rating(self):
        self.client.force_authenticate(user=self.author)

        data = {
            'rating': 5,
            "positive_comments": [
                "Test positive comment",
                "Test positive comment 2"
            ],
            "negative_comments": [
                "Test negative comment",
                "Test negative comment 2"
            ]
        }

        response = self.client.post(self._make_uri(self.teaching_unit.pk), data=data, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['rating'], 5)
        self.assertEqual(response.data['author'], self.author.pk)
        self.assertEqual(response.data['teaching_unit'], self.teaching_unit.pk)
        self.assertEqual(len(response.data['_comments']), 4)
        self.assertEqual(response.data['_comments'][0]['text'], "Test positive comment")
        self.assertEqual(response.data['_comments'][0]['is_positive'], True)
        self.assertEqual(response.data['_comments'][1]['text'], "Test positive comment 2")
        self.assertEqual(response.data['_comments'][1]['is_positive'], True)
        self.assertEqual(response.data['_comments'][2]['text'], "Test negative comment")
        self.assertEqual(response.data['_comments'][2]['is_positive'], False)
        self.assertEqual(response.data['_comments'][3]['text'], "Test negative comment 2")
        self.assertEqual(response.data['_comments'][3]['is_positive'], False)
