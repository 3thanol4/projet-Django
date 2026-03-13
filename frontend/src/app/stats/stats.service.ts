import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getUserStats(period: string = 'trimestriel'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/?period=${period}`);
  }
}
