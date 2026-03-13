from django.conf import settings
from django.db import models

from projects.models import Project


class Task(models.Model):
    STATUS_CHOICES = (
        ('à faire', 'A faire'),
        ('en cours', 'En cours'),
        ('terminé', 'Terminé')
    )

    title = models.CharField(max_length=250)
    description = models.TextField(blank=True)
    deadline = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='à faire')
    completed_at = models.DateTimeField(null=True, blank=True)

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title