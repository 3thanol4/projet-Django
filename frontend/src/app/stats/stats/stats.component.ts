import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../stats.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
})
export class StatsComponent implements OnInit {
  stats: any = null;
  isLoading = true;
  selectedPeriod: string = 'trimestriel';

  constructor(
    private statsService: StatsService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.statsService.getUserStats(this.selectedPeriod).subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("ERREUR CHARGEMENT STATS", err);
        this.isLoading = false;
        this.stats = null;
        this.cdr.detectChanges();
      }
    });
  }

  onPeriodChange(event: any) {
    this.selectedPeriod = event.target.value;
    this.loadStats();
  }

  get isProfesseur(): boolean {
    return this.authService.currentUser()?.role?.toUpperCase() === 'PROFESSEUR';
  }
}
