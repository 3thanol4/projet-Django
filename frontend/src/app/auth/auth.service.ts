import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    private apiUrl = 'http://localhost:8000/api';
    public currentUser = signal<any>(null);

    constructor(private http: HttpClient, private router: Router) {
        this.checkAuth();
    }

    //LOGIN (JWT STANDARD)
    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/token/`, credentials).pipe(
            switchMap((res: any) => {
                if (res.access) {
                    localStorage.setItem('token', res.access);
                    return this.http.get(`${this.apiUrl}/profile/`).pipe(
                        tap(user => {
                            this.currentUser.set(user);
                        })
                    );
                }
                throw new Error("Invalid token response");
            })
        );
    }

    // Récupérer l'utilisateur connecté
    fetchProfile() {
        this.http.get(`${this.apiUrl}/profile/`).subscribe({
            next: (user) => this.currentUser.set(user),
            error: () => this.logout()
        });
    }

    //Logout
    logout() {
        localStorage.removeItem('token');
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

    //Vérification au chargement
    checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            this.fetchProfile();
        }
    }

    // Inscription
    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register/`, userData);
    }

    // Mettre à jour le profil (nom, prenom, email)
    updateProfile(userData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/profile/`, userData).pipe(
            tap((user) => this.currentUser.set(user))
        );
    }

    // Mettre à jour le mot de passe
    // Obtenir la liste des utilisateurs pour les assignations
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users/`);
    }

    // Mettre à jour le mot de passe
    updatePassword(passwordData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/profile/password/`, passwordData);
    }
}