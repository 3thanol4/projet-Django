import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getTasks(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tasks/?project=${projectId}`);
  }

  getAllTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tasks/`);
  }

  createTask(projectId: number, task: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tasks/`, { ...task, project: projectId });
  }

  updateTask(taskId: number, task: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tasks/${taskId}/`, task);
  }

  updateTaskStatus(taskId: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/tasks/${taskId}/`, { status });
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tasks/${taskId}/`);
  }
}
