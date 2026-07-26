import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { ResumeService } from '../../../../core/services/resume';
import { AiService } from '../../../../core/services/ai';
import { Resume } from '../../../../core/models/resume.model';
import { RoastResultPayload } from '../../../../core/models/ai.model';

@Component({
  selector: 'app-roast-resume',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="ai-page-container fade-in">
      <div class="glow-bg"></div>
      <div class="page-header">
        <div class="header-icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
        </div>
        <div>
          <h1 class="page-title">{{ 'BUILDER.ROAST.TITLE' | translate }}</h1>
          <p class="page-desc">{{ 'BUILDER.ROAST.DESC' | translate }}</p>
        </div>
      </div>

      <div class="page-content">
        @if (isLoadingResumes()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>{{ 'BUILDER.ROAST.LOADING_RESUMES' | translate }}</p>
          </div>
        } @else if (resumes().length === 0) {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <h3>{{ 'BUILDER.ROAST.NO_RESUME' | translate }}</h3>
            <p>{{ 'BUILDER.ROAST.NO_RESUME_DESC' | translate }}</p>
            <a href="/resume/new" class="btn btn-primary" style="margin-top: 16px;">{{ 'BUILDER.ROAST.CREATE_RESUME' | translate }}</a>
          </div>
        } @else {
          <div class="workspace-grid">
            <div class="card form-card">
              <div class="form-group">
                <label class="form-label">{{ 'BUILDER.ROAST.SELECT_RESUME' | translate }}</label>
                <select class="form-control" [(ngModel)]="selectedResumeId">
                  <option value="" disabled selected>{{ 'BUILDER.ROAST.CHOOSE_RESUME' | translate }}</option>
                  @for (resume of resumes(); track resume.id) {
                    <option [value]="resume.id">{{ getResumeTitle(resume.title) }}</option>
                  }
                </select>
              </div>

              <button class="btn btn-primary btn-full roast-btn" (click)="roastResume()" 
                      [disabled]="isRoasting() || !selectedResumeId">
                @if (isRoasting()) {
                  <div class="spinner"></div>
                  {{ 'BUILDER.ROAST.LOADING' | translate }}
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                  </svg>
                  {{ 'BUILDER.ROAST.BTN' | translate }}
                }
              </button>
            </div>

            <div class="workspace-preview">
              @if (isRoasting()) {
                <div class="workspace-placeholder loading">
                  <div class="spinner" style="border-color: #ef4444; border-top-color: transparent;"></div>
                  <p>{{ 'BUILDER.ROAST.LOADING' | translate }}</p>
                  <div class="skeleton-lines">
                    <div class="skeleton-line" style="width: 90%"></div>
                    <div class="skeleton-line" style="width: 75%"></div>
                    <div class="skeleton-line" style="width: 85%"></div>
                  </div>
                </div>
              } @else if (roastResult()) {
                <div class="workspace-header-tabs">
                  <div class="tabs-buttons">
                    <button class="tab-btn" [class.active]="activeTab() === 'summary'" (click)="activeTab.set('summary')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      {{ 'BUILDER.ROAST.TABS.SUMMARY' | translate }}
                    </button>
                    <button class="tab-btn" [class.active]="activeTab() === 'ats'" (click)="activeTab.set('ats')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      {{ 'BUILDER.ROAST.TABS.ATS' | translate }}
                    </button>
                    <button class="tab-btn" [class.active]="activeTab() === 'actionable'" (click)="activeTab.set('actionable')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                      </svg>
                      {{ 'BUILDER.ROAST.TABS.ACTIONABLE' | translate }}
                    </button>
                  </div>
                </div>

                <div class="roast-results animate-fade-in-up">
                  @if (activeTab() === 'summary') {
                    <div class="score-card">
                      <div class="score-info">
                        <span class="score-label">{{ 'BUILDER.ROAST.SCORE' | translate }}</span>
                        <span class="score-desc">{{ 'BUILDER.ROAST.SCORE_DESC' | translate }}</span>
                      </div>
                      <div class="score-circle-wrapper">
                        <div class="score-circle">
                          {{ roastResult()?.score || 0 }}
                        </div>
                      </div>
                    </div>

                    <div class="roast-section strengths animate-fade-in">
                      <h4>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        {{ 'BUILDER.ROAST.STRENGTHS' | translate }}
                      </h4>
                      <ul>
                        @for (s of (roastResult()?.strengths || []); track s) { <li>{{ s }}</li> }
                      </ul>
                    </div>
                  }

                  @if (activeTab() === 'ats') {
                    <div class="roast-section weaknesses animate-fade-in">
                      <h4>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        {{ 'BUILDER.ROAST.WEAKNESSES' | translate }}
                      </h4>
                      <ul>
                        @for (w of (roastResult()?.weaknesses || []); track w) { <li>{{ w }}</li> }
                      </ul>
                    </div>
                  }

                  @if (activeTab() === 'actionable') {
                    <div class="roast-section actionable animate-fade-in">
                      <h4>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        {{ 'BUILDER.ROAST.ACTIONABLE' | translate }}
                      </h4>
                      <ul>
                        @for (a of (roastResult()?.actionableFeedback || []); track a) { <li>{{ a }}</li> }
                      </ul>
                    </div>
                  }
                </div>

                <div class="next-steps-card animate-fade-in-up" style="margin-top: 24px; padding: 24px; background: var(--color-surface-2); border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center;">
                  <h3 style="margin-bottom: 8px; font-size: 16px; font-weight: 600;">{{ 'BUILDER.ROAST.NEXT_STEPS_TITLE' | translate }}</h3>
                  <p style="color: var(--color-text-muted); margin-bottom: 20px; font-size: 14px;">{{ 'BUILDER.ROAST.NEXT_STEPS_DESC' | translate }}</p>
                  <div style="display: flex; gap: 16px; justify-content: center;">
                     <button class="btn btn-primary" (click)="goToBuilder()">{{ 'BUILDER.ROAST.IMPROVE_BTN' | translate }}</button>
                     <button class="btn btn-secondary" (click)="roastResume()">{{ 'BUILDER.ROAST.REEVALUATE_BTN' | translate }}</button>
                  </div>
                </div>
              } @else {
                <div class="workspace-placeholder-example">
                  <div class="example-badge">{{ 'BUILDER.ROAST.EXAMPLE_BADGE' | translate }}</div>
                  
                  <div class="workspace-header-tabs" style="margin-top: 12px;">
                    <div class="tabs-buttons">
                      <button class="tab-btn" [class.active]="activeExampleTab() === 'summary'" (click)="activeExampleTab.set('summary')">{{ 'BUILDER.ROAST.TABS.SUMMARY' | translate }}</button>
                      <button class="tab-btn" [class.active]="activeExampleTab() === 'ats'" (click)="activeExampleTab.set('ats')">{{ 'BUILDER.ROAST.TABS.ATS' | translate }}</button>
                      <button class="tab-btn" [class.active]="activeExampleTab() === 'actionable'" (click)="activeExampleTab.set('actionable')">{{ 'BUILDER.ROAST.TABS.ACTIONABLE' | translate }}</button>
                    </div>
                  </div>

                  <div class="roast-results" style="text-align: left;">
                    @if (activeExampleTab() === 'summary') {
                      <div class="score-card animate-fade-in" style="opacity: 0.55;">
                        <div class="score-info">
                          <span class="score-label">{{ 'BUILDER.ROAST.SCORE' | translate }}</span>
                          <span class="score-desc">{{ 'BUILDER.ROAST.SCORE_DESC' | translate }}</span>
                        </div>
                        <div class="score-circle-wrapper">
                          <div class="score-circle" style="animation: none;">
                            82
                          </div>
                        </div>
                      </div>

                      <div class="roast-section strengths animate-fade-in" style="opacity: 0.55; margin-top: 16px;">
                        <h4>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          {{ 'BUILDER.ROAST.STRENGTHS' | translate }}
                        </h4>
                        <ul>
                          <li>{{ 'BUILDER.ROAST.EXAMPLE_STRENGTH_1' | translate }}</li>
                          <li>{{ 'BUILDER.ROAST.EXAMPLE_STRENGTH_2' | translate }}</li>
                        </ul>
                      </div>
                    }

                    @if (activeExampleTab() === 'ats') {
                      <div class="roast-section weaknesses animate-fade-in" style="opacity: 0.55;">
                        <h4>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          {{ 'BUILDER.ROAST.WEAKNESSES' | translate }}
                        </h4>
                        <ul>
                          <li>{{ 'BUILDER.ROAST.EXAMPLE_WEAKNESS_1' | translate }}</li>
                          <li>{{ 'BUILDER.ROAST.EXAMPLE_WEAKNESS_2' | translate }}</li>
                        </ul>
                      </div>
                    }

                    @if (activeExampleTab() === 'actionable') {
                      <div class="roast-section actionable animate-fade-in" style="opacity: 0.55;">
                        <h4>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                          {{ 'BUILDER.ROAST.ACTIONABLE' | translate }}
                        </h4>
                        <ul>
                          <li>{{ 'BUILDER.ROAST.EXAMPLE_ACTIONABLE_1' | translate }}</li>
                          <li>{{ 'BUILDER.ROAST.EXAMPLE_ACTIONABLE_2' | translate }}</li>
                        </ul>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['../cover-letter/cover-letter.scss', './roast-resume.scss']
})
export class RoastResumePageComponent implements OnInit {
  private resumeService = inject(ResumeService);
  private aiService = inject(AiService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);
  private router = inject(Router);

  resumes = signal<Resume[]>([]);
  isLoadingResumes = signal<boolean>(true);

  selectedResumeId: string = '';
  isRoasting = signal<boolean>(false);
  roastResult = signal<RoastResultPayload | null>(null);
  activeTab = signal<'summary' | 'ats' | 'actionable'>('summary');
  activeExampleTab = signal<'summary' | 'ats' | 'actionable'>('summary');

  getResumeTitle(title: string): string {
    return this.resumeService.getTranslatedTitle(title, this.translate.currentLang || 'pt');
  }

  ngOnInit(): void {
    this.resumeService.loadResumes().subscribe({
      next: (data: Resume[]) => {
        this.resumes.set(data);
        if (data.length > 0) {
          this.selectedResumeId = data[0].id;
        }
        this.isLoadingResumes.set(false);
      },
      error: () => {
        this.notification.error({ pt: 'Erro ao carregar currículos', en: 'Error loading resumes' });
        this.isLoadingResumes.set(false);
      }
    });
  }

  roastResume(): void {
    if (!this.selectedResumeId) {
      this.notification.warning(
        { pt: 'Selecione um currículo primeiro.', en: 'Please select a resume first.' },
        { pt: 'Atenção', en: 'Attention' }
      );
      return;
    }

    this.isRoasting.set(true);

    const lang: string = this.translate.currentLang || 'pt';
    this.aiService.roastResume(this.selectedResumeId, lang).subscribe({
      next: (res: RoastResultPayload) => {
        this.roastResult.set(res);
        this.isRoasting.set(false);
        this.notification.success(
          { pt: 'Avaliação concluída!', en: 'Evaluation completed!' },
          { pt: 'Sucesso', en: 'Success' }
        );
      },
      error: () => {
        this.notification.error(
          { pt: 'Erro ao gerar avaliação. Tente novamente mais tarde.', en: 'Error generating evaluation. Please try again later.' },
          { pt: 'Erro IA', en: 'AI Error' }
        );
        this.isRoasting.set(false);
      }
    });
  }

  goToBuilder(): void {
    if (this.selectedResumeId) {
      this.router.navigate(['/resume', this.selectedResumeId, 'edit']);
    }
  }
}
