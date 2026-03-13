from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import User
from tasks.models import Task
from django.utils import timezone
from datetime import timedelta
from users.serializers import UserSerializer, RegisterSerializer


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class StatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        period_param = request.query_params.get('period', 'trimestriel').lower()
        now = timezone.now()

        if period_param == 'annuel':
            start_date = now.date().replace(month=1, day=1)
            end_date = now.date().replace(month=12, day=31)
            period_str = 'Annuel'
        else: # 'trimestriel'
            quarter = (now.month - 1) // 3 + 1
            start_month = 3 * quarter - 2
            start_date = now.date().replace(month=start_month, day=1)
            if quarter == 4:
                end_date = now.date().replace(month=12, day=31)
            else:
                next_month = start_month + 3
                end_date = (now.date().replace(month=next_month, day=1) - timedelta(days=1))
            period_str = 'Trimestriel'

        tasks = Task.objects.filter(assigned_to=user, deadline__gte=start_date, deadline__lte=end_date)
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='terminé').count()

        on_time_tasks = 0
        for task in tasks.filter(status='terminé'):
            if task.completed_at and task.completed_at.date() <= task.deadline:
                on_time_tasks += 1
            elif not task.completed_at: # Fallback pour anciennes tâches
                on_time_tasks += 1

        completion_rate = 0
        if total_tasks > 0:
            completion_rate = round((on_time_tasks / total_tasks) * 100)

        bonus_eligible = False
        bonus_amount = '0'

        if user.role.upper() == 'PROFESSEUR':
            if completion_rate == 100:
                bonus_eligible = True
                bonus_amount = '100K'
            elif completion_rate >= 90:
                bonus_eligible = True
                bonus_amount = '30K'

        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'on_time_tasks': on_time_tasks,
            'completion_rate': completion_rate,
            'bonus_eligible': bonus_eligible,
            'bonus_amount': bonus_amount,
            'period': period_str,
        })