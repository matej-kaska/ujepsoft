from django.contrib import admin
from api.models import File, Keyword, Offer

admin.site.register(Keyword)
admin.site.register(File)
admin.site.register(Offer)