from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from tasks.models import Task
from tasks.serializers import TaskSerializer
from tasks.permissions import IsTaskOwnerOrAssigned


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        if project_id:
            return Task.objects.filter(project_id=project_id)
        return Task.objects.filter(project__members=self.request.user)

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        user = self.request.user
        
        if project.owner != user:
            raise PermissionDenied("Seul le créateur du projet peut ajouter des tâches.")
            
        assigned_to = serializer.validated_data.get('assigned_to')
        if assigned_to and user.role == 'ETUDIANT' and assigned_to.role == 'PROFESSEUR':
            raise PermissionDenied("Un étudiant ne peut pas assigner un professeur.")
            
        task = serializer.save()
        
        # Automatiquement ajouter l'utilisateur assigné aux membres du projet
        if task.assigned_to:
            task.project.members.add(task.assigned_to)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsTaskOwnerOrAssigned]
    queryset = Task.objects.all()

    def perform_update(self, serializer):
        task = self.get_object()
        user = self.request.user
        
        # If user is assignee but not owner, they can only change 'status'
        
        if user != task.project.owner and user == task.assigned_to:
            allowed_fields = {'status'}
            modified_fields = set(self.request.data.keys())
            if not modified_fields.issubset(allowed_fields):
                 raise PermissionDenied("Vous ne pouvez modifier que le statut de cette tâche car vous n'êtes pas le créateur du projet.")
                 
        assigned_to = serializer.validated_data.get('assigned_to', task.assigned_to)
        if assigned_to and user.role == 'ETUDIANT' and assigned_to.role == 'PROFESSEUR':
            raise PermissionDenied("Un étudiant ne peut pas assigner un professeur.")
            
        new_status = serializer.validated_data.get('status', task.status)
        if new_status == 'terminé' and task.status != 'terminé':
            task = serializer.save(completed_at=timezone.now())
        elif new_status != 'terminé' and task.completed_at is not None:
            task = serializer.save(completed_at=None)
        else:
            task = serializer.save()
        
        # Automatiquement ajouter le nouvel utilisateur assigné aux membres du projet
        if task.assigned_to:
            task.project.members.add(task.assigned_to)

    def perform_destroy(self, instance):
        if self.request.user != instance.project.owner:
            raise PermissionDenied("Seul le créateur du projet peut supprimer cette tâche.")
        instance.delete()

