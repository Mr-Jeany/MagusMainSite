from django.urls import path

from match import views

urlpatterns = [
    path("<int:match_id>", views.main_match_page, name="main_match_page"),
]