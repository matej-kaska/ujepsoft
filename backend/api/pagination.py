from rest_framework import pagination
from rest_framework.response import Response


class StandardPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page-size'
    max_page_size = 1000

    def get_paginated_response(self, data):
        next_url = self.get_next_link()
        previous_url = self.get_previous_link()

        if next_url is not None:
            next_url = "/%s" % "/".join(next_url.split("/")[3:])

        if previous_url is not None:
            previous_url = "/%s" % "/".join(previous_url.split("/")[3:])

        return Response({
            'next': next_url,
            'previous': previous_url,
            'total_pages': self.page.paginator.num_pages,  # Total number of pages
            'count': self.page.paginator.count,  # Total number of items
            'current_page': self.page.number,  # Current page number
            'results': data
        })
    
class IssuePagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page-size'
    max_page_size = 1000

    def get_paginated_response(self, data):
        next_url = self.get_next_link()
        previous_url = self.get_previous_link()

        if next_url is not None:
            next_url = "/%s" % "/".join(next_url.split("/")[3:])

        if previous_url is not None:
            previous_url = "/%s" % "/".join(previous_url.split("/")[3:])

        return Response({
            'next': next_url,
            'previous': previous_url,
            'total_pages': self.page.paginator.num_pages,  # Total number of pages
            'count': self.page.paginator.count,  # Total number of items
            'current_page': self.page.number,  # Current page number
            'results': data
        })