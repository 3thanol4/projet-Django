from django.urls import path
from .views import ProfileView, UserListView, RegisterView, StatsView

urlpatterns = [
    path('profile/', ProfileView.as_view()),
    path('users/', UserListView.as_view()),
    path('register/', RegisterView.as_view()),
    path('stats/', StatsView.as_view()),
]