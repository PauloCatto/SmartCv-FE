import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../../core/services/ai';
import { ResumeService } from '../../../../core/services/resume';
import { MatchResult } from '../../../../core/models/ai.model';

@Component({
  selector: 'app-job-matcher-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-matcher-modal.html',
  styleUrl: './job-matcher-modal.scss',
})
export class JobMatcherModalComponent {
  private aiService = inject(AiService);
  private resumeService = inject(ResumeService);

  @Input() resumeId!: string;
  @Output() close = new EventEmitter<void>();

  jobDescription = '';
  loading = signal(false);
  result = signal<MatchResult | null>(null);
  error = signal('');
  applying = signal(false);

  onSubmit() {
    if (!this.jobDescription.trim()) return;

    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    this.aiService.matchJobDescription(this.resumeId, this.jobDescription).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Falha ao analisar a vaga. Verifique a chave de API da IA.');
        this.loading.set(false);
      }
    });
  }

  applyOptimization() {
    const res = this.result();
    if (!res) return;

    this.applying.set(true);

    // Fetch the current resume state first
    this.resumeService.getById(this.resumeId).subscribe({
      next: (currentResume) => {
        if (!currentResume) {
          this.error.set('Erro ao carregar o currículo atual');
          this.applying.set(false);
          return;
        }

        // Deep copy experience to apply the updates
        const updatedExperiences = currentResume.experience.map(exp => {
          const matchedSug = res.suggestedExperiences.find(sug => sug.id === exp.id);
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
