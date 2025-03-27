from django.urls import path

from player import views

urlpatterns = [
    path("<int:player_id>", views.main_player_page, name="main_player_page"),
    path("<int:player_id>/charts", views.charts_page, name="charts_player_page")
]