import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    passwordForm: FormGroup;
    isLoading = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        public authService: AuthService,
        private router: Router
    ) {
        this.profileForm = this.fb.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
        });

        this.passwordForm = this.fb.group({
            new_password: ['', [Validators.required, Validators.minLength(8)]],
        });
    }

    ngOnInit() {
        const user = this.authService.currentUser();
        if (user) {
            this.profileForm.patchValue({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            });
        }
    }

    updateProfile() {
        if (this.profileForm.valid) {
            this.isLoading = true;
            this.successMessage = '';
            this.errorMessage = '';
            this.authService.updateProfile(this.profileForm.value).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.successMessage = 'Profil mis à jour avec succès.';
                },
                error: () => {
                    this.isLoading = false;
                    this.errorMessage = 'Erreur lors de la mise à jour.';
                }
            });
        }
    }

    updatePassword() {
        if (this.passwordForm.valid) {
            this.isLoading = true;
            this.successMessage = '';
            this.authService.updatePassword(this.passwordForm.value).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.successMessage = 'Mot de passe mis à jour.';
                    this.passwordForm.reset();
                },
                error: () => {
                    this.isLoading = false;
                    this.errorMessage = 'Erreur lors de la modification.';
                }
            });
        }
    }

    logout() {
        this.authService.logout();
    }
}
