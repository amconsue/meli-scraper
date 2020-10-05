# (?P<auction_id>[\w\-]+)
from django.conf.urls import url

from .views import PostItemsView

urlpatterns = [
    url(r'^v1/status/(?P<execution_id>[\w\-]+)/$', PostItemsView.as_view())
]
