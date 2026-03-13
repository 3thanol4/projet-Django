from rest_framework import serializers

from tasks.models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = (
            'id',
            'title',
            'description',
            'deadline',
            'status',
            'project',
            'assigned_to',
            'created_at',
        )

        read_only_fields = ('created_at',)

