from django.contrib import admin
from api.models import File, Keyword, Offer, Repo, Issue, Comment, Label, ReactionsComment, ReactionsIssue

admin.site.register(Keyword)
admin.site.register(File)
admin.site.register(Offer)
admin.site.register(Repo)
admin.site.register(Issue)
admin.site.register(Label)
admin.site.register(Comment)
admin.site.register(ReactionsComment)
admin.site.register(ReactionsIssue)