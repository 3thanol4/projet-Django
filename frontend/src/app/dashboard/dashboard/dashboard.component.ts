import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../projects/project.service';
import { TaskService } from '../../tasks/task.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
})
export class Dashboard implements OnInit {
  projects: any[] = [];
  tasks: any[] = [];
  users: any[] = [];
  isLoading = true;

  // Filters
  selectedStatus: string = '';
  selectedUserId: number | string = '';

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    // Charger les projets
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });

    // Charger toutes les tâches
    this.taskService.getAllTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.isLoading = false;
    });

    // Charger les utilisateurs pour le filtre
    this.authService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  get filteredTasks() {
    return this.tasks.filter(task => {
      const matchStatus = this.selectedStatus ? task.status === this.selectedStatus : true;
      const matchUser = this.selectedUserId ? String(task.assigned_to) === String(this.selectedUserId) : true;
      return matchStatus && matchUser;
    });
  }

  getProjectName(projectId: number): string {
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : 'Projet inconnu';
  }

  getUserName(userId: number | null): string {
    if (!userId) return 'Non assigné';
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Inconnu';
  }
}
