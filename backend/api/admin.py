from django.contrib import admin
from api.models import OfferFile, Keyword, Offer, Repo, Issue, Comment, Label, IssueFile, CommentFile

admin.site.register(Keyword)
admin.site.register(OfferFile)
admin.site.register(Offer)
admin.site.register(Repo)
admin.site.register(Issue)
admin.site.register(Label)
admin.site.register(Comment)
admin.site.register(IssueFile)
admin.site.register(CommentFile)