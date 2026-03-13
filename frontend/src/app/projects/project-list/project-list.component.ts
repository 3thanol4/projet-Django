import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../project.service';
import { AuthService } from '../../auth/auth.service';
import { RouterLink } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent implements OnInit {
  projects: any[] = [];
  isLoading = false;
  isCreateModalOpen = false;
  isCreating = false;
  newProject = { name: '', description: '' };

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadProjects();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  loadProjects() {
    this.isLoading = true;
    this.projectService.getProjects().subscribe({
      next: (data) => {
        console.log("PROJETS RECUS :", data);
        this.projects = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("ERREUR API :", err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
    this.newProject = { name: '', description: '' };
  }

  createProject() {
    if (!this.newProject.name.trim()) return;
    
    this.isCreating = true;
    this.projectService.createProject(this.newProject).subscribe({
      next: (project) => {
        this.projects.unshift(project);
        this.closeCreateModal();
        this.isCreating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur lors de la création du projet :", err);
        this.isCreating = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteProject(event: Event, projectId: number) {
    event.stopPropagation(); // Empêcher la navigation vers les détails du projet
    
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) {
      this.projectService.deleteProject(projectId).subscribe({
        next: () => {
          this.projects = this.projects.filter(p => p.id !== projectId);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Erreur lors de la suppression du projet :", err);
          alert("Une erreur est survenue lors de la suppression du projet.");
        }
      });
    }
  }

  get isProfesseur(): boolean {
    return this.currentUser?.role?.toUpperCase() === 'PROFESSEUR';
  }
}
