import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ProjectService } from '../project.service';
import { TaskService } from '../../tasks/task.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './project-detail.component.html',
})
export class ProjectDetailComponent implements OnInit {
  projectId: number = 0;
  project: any = null;
  tasks: any[] = [];
  isLoading = true;
  taskForm: FormGroup;
  showTaskForm = false;
  editingTaskId: number | null = null;
  allUsers: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    public authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      deadline: ['', Validators.required],
      status: ['à faire', Validators.required],
      assigned_to: [null]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.projectId = Number(params.get('id'));
      if (this.projectId) {
        this.loadProjectDetails();
      }
    });
    this.loadUsers();
  }

  loadUsers() {
    this.authService.getUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur chargement utilisateurs", err)
    });
  }

  get filteredUsers() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];

    // Si l'utilisateur est étudiant, il ne peut voir/assigner QUE les étudiants.
    if (currentUser.role?.toUpperCase() === 'ETUDIANT') {
      return this.allUsers.filter(u => u.role?.toUpperCase() === 'ETUDIANT');
    }

    // Si professeur, il voit tout le monde
    return this.allUsers;
  }

  loadProjectDetails() {
    this.isLoading = true;
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        console.log("PROJET RECU :", project);
        this.project = project;
        this.loadTasks();
      },
      error: (err) => {
        console.error("ERREUR API PROJET :", err);
        this.project = { name: 'Erreur de chargement', description: 'Le projet n\'a pas pu être chargé.' };
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTasks() {
    this.taskService.getTasks(this.projectId).subscribe({
      next: (tasks) => {
        console.log("TACHES RECUES :", tasks);
        this.tasks = tasks;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("ERREUR API TACHES :", err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }



  toggleTaskForm(task?: any) {
    if (task) {
      this.editingTaskId = task.id;
      this.taskForm.patchValue({
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        status: task.status,
        assigned_to: task.assigned_to
      });
      this.showTaskForm = true;
    } else {
      this.editingTaskId = null;
      this.taskForm.reset({ status: 'à faire' });
      this.showTaskForm = !this.showTaskForm;
    }
  }

  submitTask() {
    if (this.taskForm.valid) {
      // Prepare payload to ensure correct types for Django foreign keys
      const payload = {
        ...this.taskForm.value,
        project: this.projectId,
        assigned_to: this.taskForm.value.assigned_to ? Number(this.taskForm.value.assigned_to) : null
      };

      if (this.editingTaskId) {
        // UPDATE
        this.taskService.updateTask(this.editingTaskId, payload).subscribe({
          next: (updatedTask) => {
            const index = this.tasks.findIndex(t => t.id === this.editingTaskId);
            if (index !== -1) {
              this.tasks[index] = updatedTask;
            }
            this.showTaskForm = false;
            this.editingTaskId = null;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("ERREUR MISE A JOUR TACHE :", err);
            alert("Erreur lors de la mise à jour : " + (err.error?.detail || err.message || JSON.stringify(err.error)));
          }
        });
      } else {
        // CREATE
        this.taskService.createTask(this.projectId, payload).subscribe({
          next: (newTask) => {
            this.tasks.push(newTask);
            this.showTaskForm = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("ERREUR CREATION TACHE :", err);
            alert("Erreur lors de la création : " + (err.error?.detail || err.message || JSON.stringify(err.error)));
          }
        });
      }
    }
  }

  deleteTask(taskId: number) {
    if (confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== taskId);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("ERREUR SUPPRESSION TACHE :", err);
        }
      });
    }
  }

  updateTaskStatus(task: any, newStatus: string) {
    const oldStatus = task.status;
    task.status = newStatus;
    this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
      error: () => {
        // Mock fallback handles errors silently 
      }
    });
  }

  getTasksByStatus(status: string) {
    return this.tasks.filter(t => t.status === status);
  }

  isProjectCreator(): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser && this.project?.owner && currentUser.username === this.project.owner;
  }

  canDeleteProject(): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.role?.toUpperCase() === 'PROFESSEUR';
  }

  canEditTaskStatus(task: any): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;
    // Authorized if creator OR assigned to the task
    return this.isProjectCreator() || currentUser.id === task.assigned_to;
  }

  deleteProject() {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible et supprimera toutes les tâches associées.")) {
      this.projectService.deleteProject(this.projectId).subscribe({
        next: () => {
          this.router.navigate(['/projects']);
        },
        error: (err) => {
          console.error("Erreur lors de la suppression du projet :", err);
          alert("Une erreur est survenue lors de la suppression du projet.");
        }
      });
    }
  }

  getUserName(userId: number | null): string {
    if (!userId) return 'Non assigné';
    const user = this.allUsers.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Inconnu';
  }
}
