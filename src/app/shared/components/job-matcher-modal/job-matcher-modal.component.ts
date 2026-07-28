import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiService } from '../../../core/services/ai';
import { ResumeService } from '../../../core/services/resume';
import { MatchResult } from '../../../core/models/ai.model';
import { Resume, Experience } from '../../../core/models/resume.model';

@Component({
  selector: 'app-job-matcher-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-matcher-modal.component.html',
  styleUrl: './job-matcher-modal.component.scss',
})
export class JobMatcherModalComponent {
  private aiService = inject(AiService);
  private resumeService = inject(ResumeService);
  private router = inject(Router);

  @Input() resumeId!: string;
  @Output() close = new EventEmitter<void>();

  jobDescription: string = '';
  loading = signal(false);
  result = signal<MatchResult | null>(null);
  error = signal('');
  applying = signal(false);

  onSubmit(): void {
    if (!this.jobDescription.trim()) return;

    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    this.aiService.matchJobDescription(this.resumeId, this.jobDescription).subscribe({
      next: (res: MatchResult) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: (err: any) => {
        const backendMsg = err?.error?.error || err?.error?.message || err?.message;
        this.error.set(backendMsg || 'Falha ao analisar a vaga. Verifique a conexão ou tente novamente.');
        this.loading.set(false);
      }
    });
  }

  applyOptimization(): void {
    const res = this.result();
    if (!res) return;

    this.applying.set(true);

    this.resumeService.getById(this.resumeId).subscribe({
      next: (currentResume: Resume) => {
        if (!currentResume) {
          this.error.set('Erro ao carregar o currículo atual');
          this.applying.set(false);
          return;
        }

        const updatedExperiences = currentResume.experience.map((exp: Experience) => {
          const matchedSug = res.suggestedExperiences.find((sug: { id: string, description: string }) => sug.id === exp.id);
          return matchedSug ? { ...exp, description: matchedSug.description } : exp;
        });

        const changes = {
          personalInfo: {
            ...currentResume.personalInfo,
            bio: res.suggestedBio
          },
          experience: updatedExperiences
        };

        // Update the database
        this.resumeService.update(this.resumeId, changes).subscribe({
          next: () => {
            this.applying.set(false);
            this.close.emit();
            this.router.navigate(['/resume', this.resumeId, 'edit']);
          },
          error: () => {
            this.error.set('Erro ao aplicar as otimizações no currículo');
            this.applying.set(false);
          }
        });
      },
      error: () => {
        this.error.set('Erro ao buscar currículo.');
        this.applying.set(false);
      }
    });
  }
}
