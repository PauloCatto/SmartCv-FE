import { Component, inject, signal, OnInit } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { CanComponentDeactivate } from '../../../../core/guards/can-deactivate.guard';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../../core/services/notification.service';
import { ResumeService } from '../../../../core/services/resume';
import { AiService } from '../../../../core/services/ai';
import { Resume } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-cover-letter',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  template: `
    <div class="ai-page-container fade-in">
      <div class="glow-bg"></div>
      <div class="page-header">
        <div class="header-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div>
          <h1 class="page-title">{{ 'BUILDER.COVER_LETTER.TITLE' | translate }}</h1>
          <p class="page-desc">{{ 'BUILDER.COVER_LETTER.DESC' | translate }}</p>
        </div>
      </div>

      <div class="page-content">
        @if (isLoadingResumes()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>{{ 'BUILDER.COVER_LETTER.LOADING_RESUMES' | translate }}</p>
          </div>
        } @else if (resumes().length === 0) {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <h3>{{ 'BUILDER.COVER_LETTER.NO_RESUME' | translate }}</h3>
            <p>{{ 'BUILDER.COVER_LETTER.NO_RESUME_DESC' | translate }}</p>
            <a routerLink="/resume/new" class="btn btn-primary" style="margin-top: 16px;">{{ 'BUILDER.COVER_LETTER.CREATE_RESUME' | translate }}</a>
          </div>
        } @else {
          <div class="workspace-grid">
            <div class="card form-card">
              <div class="form-group">
                <label class="form-label">{{ 'BUILDER.COVER_LETTER.SELECT_RESUME' | translate }}</label>
                <select class="form-control" [(ngModel)]="selectedResumeId" (change)="onResumeSelect()">
                  <option value="" disabled selected>{{ 'BUILDER.COVER_LETTER.CHOOSE_RESUME' | translate }}</option>
                  @for (resume of resumes(); track resume.id) {
                    <option [value]="resume.id">{{ getResumeTitle(resume.title) }}</option>
                  }
                </select>
              </div>

              <div class="form-group" style="margin-top: 24px;">
                <label class="form-label">{{ 'BUILDER.COVER_LETTER.JOB_TITLE_LABEL' | translate }}</label>
                <input type="text" class="form-control" [(ngModel)]="jobTitle" [placeholder]="'BUILDER.COVER_LETTER.JOB_TITLE_PLACEHOLDER' | translate" />
              </div>

              <div class="form-group" style="margin-top: 24px;">
                <label class="form-label">{{ 'BUILDER.COVER_LETTER.JOB_DESC_LABEL' | translate }}</label>
                <textarea class="form-control" rows="8" [(ngModel)]="jobDescription" 
                  [placeholder]="'BUILDER.COVER_LETTER.JOB_DESC_PLACEHOLDER' | translate"></textarea>
              </div>

              <button type="button" class="btn btn-primary btn-full" style="margin-top: 24px;" (click)="generateCoverLetter()" 
                      [disabled]="isGenerating() || !selectedResumeId || !jobDescription || jobDescription.length < 20">
                @if (isGenerating()) {
                  <div class="spinner"></div>
                  {{ 'BUILDER.COVER_LETTER.GENERATING' | translate }}
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  {{ 'BUILDER.COVER_LETTER.GENERATE_BTN' | translate }}
                }
              </button>
            </div>

            <div class="workspace-preview">
              @if (isGenerating()) {
                <div class="workspace-placeholder loading">
                  <div class="spinner"></div>
                  <p>{{ 'BUILDER.COVER_LETTER.GENERATING' | translate }}</p>
                  <div class="skeleton-lines">
                    <div class="skeleton-line" style="width: 90%"></div>
                    <div class="skeleton-line" style="width: 80%"></div>
                    <div class="skeleton-line" style="width: 85%"></div>
                    <div class="skeleton-line" style="width: 60%"></div>
                  </div>
                </div>
              } @else if (generatedLetter()) {
                <div class="workspace-header-tabs">
                  <div class="tabs-buttons">
                    <button class="tab-btn" [class.active]="viewMode() === 'text'" (click)="viewMode.set('text')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      {{ 'BUILDER.COVER_LETTER.TABS.EDIT_TEXT' | translate }}
                    </button>
                    <button class="tab-btn" [class.active]="viewMode() === 'paper'" (click)="viewMode.set('paper')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      {{ 'BUILDER.COVER_LETTER.TABS.VIEW_PAPER' | translate }}
                    </button>
                  </div>

                  @if (matchScore() !== null) {
                    <div class="match-rate-badge" [style.border-color]="selectedResumeColor()">
                      <div class="match-score" [style.color]="selectedResumeColor()">{{ matchScore() }}%</div>
                      <div class="match-label">{{ 'BUILDER.COVER_LETTER.MATCH_RATE' | translate }}</div>
                    </div>
                  }
                </div>

                <div class="generated-content-box animate-fade-in-up">
                  <div class="box-header">
                    <h3 class="box-title">{{ 'BUILDER.COVER_LETTER.MODAL_TITLE' | translate }}</h3>
                    <div class="box-header-actions" style="display: flex; gap: 8px;">
                      <button class="btn btn-secondary btn-sm" (click)="copyLetter()">
                        {{ 'BUILDER.COVER_LETTER.COPY_BTN' | translate }}
                      </button>
                      <button class="btn btn-primary btn-sm" (click)="exportPdf()" [disabled]="exportingPdf()">
                        @if (exportingPdf()) {
                          <div class="spinner spinner-sm"></div>
                        } @else {
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        }
                        PDF
                      </button>
                    </div>
                  </div>
                  
                  @if (viewMode() === 'text') {
                    <div class="editor-body">
                      <textarea class="inline-editor-textarea" [(ngModel)]="generatedLetterEditable" rows="18"></textarea>
                    </div>
                  } @else {
                    <div id="cover-letter-paper" class="box-body paper-preview" [style.font-family]="selectedResumeFont()">
                      <!-- Elegant Letter Header -->
                      <div class="letter-sender-header" [style.border-left-color]="selectedResumeColor()">
                        <h4 class="sender-name" [style.color]="selectedResumeColor()">{{ selectedResumeName() }}</h4>
                        <div class="sender-meta">
                          @if (selectedResumeEmail()) { <span>{{ selectedResumeEmail() }}</span> }
                          @if (selectedResumePhone()) { <span> • {{ selectedResumePhone() }}</span> }
                          @if (selectedResumeLocation()) { <span> • {{ selectedResumeLocation() }}</span> }
                        </div>
                      </div>
                      
                      <div class="letter-content-text" style="white-space: pre-wrap; font-size: 15px; line-height: 1.8;">
                        {{ generatedLetterEditable }}
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="workspace-placeholder-example">
                  <div class="example-badge">{{ 'BUILDER.COVER_LETTER.EXAMPLE_BADGE' | translate }}</div>
                  
                  <div class="workspace-header-tabs" style="margin-top: 12px;">
                    <div class="tabs-buttons">
                      <button class="tab-btn" [class.active]="activeExampleTab() === 'text'" (click)="activeExampleTab.set('text')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        {{ 'BUILDER.COVER_LETTER.TABS.EDIT_TEXT' | translate }}
                      </button>
                      <button class="tab-btn" [class.active]="activeExampleTab() === 'paper'" (click)="activeExampleTab.set('paper')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        {{ 'BUILDER.COVER_LETTER.TABS.VIEW_PAPER' | translate }}
                      </button>
                    </div>
                    <div class="match-rate-badge" [style.border-color]="selectedResumeColor()">
                      <div class="match-score" [style.color]="selectedResumeColor()">94%</div>
                      <div class="match-label">{{ 'BUILDER.COVER_LETTER.MATCH_RATE' | translate }}</div>
                    </div>
                  </div>

                  <div class="generated-content-box animate-fade-in">
                    <div class="box-header">
                      <h3 class="box-title">{{ 'BUILDER.COVER_LETTER.MODAL_TITLE' | translate }}</h3>
                      <div class="box-header-actions" style="display: flex; gap: 8px; opacity: 0.7;">
                        <button class="btn btn-secondary btn-sm" disabled>{{ 'BUILDER.COVER_LETTER.COPY_BTN' | translate }}</button>
                        <button class="btn btn-primary btn-sm" disabled>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          PDF
                        </button>
                      </div>
                    </div>
                    
                    @if (activeExampleTab() === 'text') {
                      <div class="editor-body" style="opacity: 0.55;">
                        <textarea class="inline-editor-textarea" rows="12" readonly>{{ 'BUILDER.COVER_LETTER.EXAMPLE_TEXT' | translate }}</textarea>
                      </div>
                    } @else {
                      <div class="box-body paper-preview" [style.font-family]="selectedResumeFont()" style="opacity: 0.55;">
                        <div class="letter-sender-header" [style.border-left-color]="selectedResumeColor()">
                          <h4 class="sender-name" [style.color]="selectedResumeColor()">{{ selectedResumeName() }}</h4>
                          <div class="sender-meta">
                            <span>{{ selectedResumeEmail() || ('BUILDER.COVER_LETTER.DEFAULT_EMAIL' | translate) }}</span>
                            @if (selectedResumePhone()) { <span> • {{ selectedResumePhone() }}</span> }
                            @if (selectedResumeLocation()) { <span> • {{ selectedResumeLocation() }}</span> }
                          </div>
                        </div>
                        <div class="letter-content-text" style="text-align: left; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">{{ 'BUILDER.COVER_LETTER.EXAMPLE_PAPER_TEXT' | translate }}
{{ selectedResumeName() }}</div>
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

    @if (showLeaveModal()) {
    <div class="modal-overlay leave-modal-overlay" (click)="cancelLeave()">
      <div class="modal-content leave-modal" (click)="$event.stopPropagation()">

        <div class="leave-modal-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <div class="modal-header" style="text-align:center; border-bottom:none; padding-bottom:0;">
          <h2 class="modal-title" style="font-size:18px;">{{ 'BUILDER.COVER_LETTER_LEAVE.TITLE' | translate }}</h2>
          <p class="modal-desc">{{ 'BUILDER.COVER_LETTER_LEAVE.DESC' | translate }}</p>
        </div>

        <div class="leave-modal-actions">
          <button class="btn btn-secondary" (click)="cancelLeave()">
            {{ 'BUILDER.COVER_LETTER_LEAVE.STAY' | translate }}
          </button>
          <button class="btn btn-danger" (click)="confirmLeave()">
            {{ 'BUILDER.COVER_LETTER_LEAVE.LEAVE' | translate }}
          </button>
        </div>
      </div>
    </div>
    }
  `,
  styleUrls: ['./cover-letter.scss']
})
export class CoverLetterPageComponent implements OnInit, CanComponentDeactivate {
  private resumeService = inject(ResumeService);
  private aiService = inject(AiService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  resumes = signal<Resume[]>([]);
  isLoadingResumes = signal<boolean>(true);

  selectedResumeId: string = '';
  jobTitle: string = '';
  jobDescription: string = '';

  isGenerating = signal<boolean>(false);

  showLeaveModal = signal<boolean>(false);
  private leaveSubject = new Subject<boolean>();
  isSavedOrExported: boolean = false;

  defaultLetterText: string = '';

  generatedLetter = signal<string | null>(this.defaultLetterText);
  generatedLetterEditable: string = this.defaultLetterText;
  viewMode = signal<'text' | 'paper'>('text');
  matchScore = signal<number | null>(null);
  activeExampleTab = signal<'text' | 'paper'>('paper');
  exportingPdf = signal<boolean>(false);

  selectedResumeColor = signal<string>('#1e293b');
  selectedResumeFont = signal<string>("'Georgia', serif");
  selectedResumeName = signal<string>('');
  selectedResumeEmail = signal<string>('');
  selectedResumePhone = signal<string>('');
  selectedResumeLocation = signal<string>('');

  ngOnInit(): void {
    this.translate.stream('BUILDER.COVER_LETTER.DEFAULT_TEXT').subscribe((text: string) => {
      if (this.generatedLetterEditable === this.defaultLetterText) {
        this.generatedLetterEditable = text;
        this.generatedLetter.set(text);
      }
      this.defaultLetterText = text;
    });

    this.resumeService.loadResumes().subscribe({
      next: (data: Resume[]) => {
        this.resumes.set(data);
        if (data.length > 0) {
          this.selectedResumeId = data[0].id;
          this.onResumeSelect();
        }
        this.isLoadingResumes.set(false);
      },
      error: () => {
        this.notification.error({ pt: 'Erro ao carregar currículos', en: 'Error loading resumes' });
        this.isLoadingResumes.set(false);
      }
    });
  }

  onResumeSelect(): void {
    const selected: Resume | undefined = this.resumes().find((r: Resume) => r.id === this.selectedResumeId);
    if (selected) {
      this.selectedResumeColor.set(selected.colorTheme || '#1e293b');
      this.selectedResumeFont.set(selected.fontFamily || "'Georgia', serif");
      const personal = selected.personalInfo;
      const defaultCandidate = this.translate.instant('BUILDER.COVER_LETTER.CANDIDATE_NAME_FALLBACK') || (this.translate.currentLang === 'en' ? 'Candidate' : 'Candidato');
      this.selectedResumeName.set(personal?.name || defaultCandidate);
      this.selectedResumeEmail.set(personal?.email || '');
      this.selectedResumePhone.set(personal?.phone || '');
      this.selectedResumeLocation.set(personal?.location || '');
    }
  }

  getResumeTitle(title: string): string {
    return this.resumeService.getTranslatedTitle(title, this.translate.currentLang || 'pt');
  }

  generateCoverLetter(): void {
    if (this.isGenerating()) return;

    if (!this.selectedResumeId) {
      this.notification.warning(
        { pt: 'Selecione um currículo base primeiro.', en: 'Please select a base resume first.' },
        { pt: 'Atenção', en: 'Attention' }
      );
      return;
    }

    if (!this.jobDescription || this.jobDescription.length < 20) {
      this.notification.warning(
        { pt: 'Por favor, cole uma descrição de vaga com pelo menos 20 caracteres.', en: 'Please paste a job description with at least 20 characters.' },
        { pt: 'Atenção', en: 'Attention' }
      );
      return;
    }

    const isEn: boolean = this.translate.currentLang === 'en';
    const jobTitlePrefix = isEn ? 'Job Title: ' : 'Vaga: ';
    const jobDescPrefix = isEn ? '\n\nDescription: ' : '\n\nDescrição: ';
    const fullDescription: string = this.jobTitle
      ? `${jobTitlePrefix}${this.jobTitle}${jobDescPrefix}${this.jobDescription}`
      : this.jobDescription;

    const lang: string = this.translate.currentLang || 'pt';
    this.isGenerating.set(true);
    this.aiService.generateCoverLetter(this.selectedResumeId, fullDescription, lang).subscribe({
      next: (res: { result: { coverLetter: string; matchScore: number } }) => {
        const coverLetterText: string = res.result?.coverLetter || '';
        const score: number = res.result?.matchScore ?? 0;

        if (score === 0 || coverLetterText.includes('temporarily unavailable') || coverLetterText.includes('could not generate')) {
          const errorMsg = this.translate.currentLang === 'en'
            ? 'The AI service is temporarily unavailable. Please try again.'
            : 'O serviço de IA está temporariamente indisponível. Por favor, tente novamente.';

          this.notification.error(
            { pt: errorMsg, en: errorMsg },
            { pt: 'Erro IA', en: 'AI Error' }
          );
          this.isGenerating.set(false);
          return;
        }

        this.generatedLetter.set(coverLetterText);
        this.generatedLetterEditable = coverLetterText;
        this.matchScore.set(score);
        this.isGenerating.set(false);
        this.notification.success(
          { pt: 'Carta gerada com sucesso!', en: 'Cover letter generated successfully!' },
          { pt: 'Sucesso', en: 'Success' }
        );
      },
      error: (err: any) => {
        const backendMsg = err?.error?.error || err?.error?.message || err?.message;
        const errorMsg = backendMsg
          ? (this.translate.currentLang === 'en' ? `Error: ${backendMsg}` : `Erro: ${backendMsg}`)
          : (this.translate.currentLang === 'en' ? 'Error generating letter with AI. Please try again later.' : 'Erro ao gerar carta com inteligência artificial. Tente novamente mais tarde.');

        this.notification.error(
          { pt: errorMsg, en: errorMsg },
          { pt: 'Erro IA', en: 'AI Error' }
        );
        this.isGenerating.set(false);
      }
    });
  }

  copyLetter(): void {
    const letter: string = this.generatedLetterEditable;
    if (letter) {
      navigator.clipboard.writeText(letter);
      this.isSavedOrExported = true;
      this.notification.success(
        { pt: 'Carta copiada para a área de transferência!', en: 'Cover letter copied to clipboard!' },
        { pt: 'Sucesso', en: 'Success' }
      );
    }
  }

  slugify(text: string): string {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.generatedLetter() && this.generatedLetter() !== this.defaultLetterText && !this.isSavedOrExported) {
      this.showLeaveModal.set(true);
      return this.leaveSubject.asObservable();
    }
    return true;
  }

  confirmLeave(): void {
    this.showLeaveModal.set(false);
    this.leaveSubject.next(true);
  }

  cancelLeave(): void {
    this.showLeaveModal.set(false);
    this.leaveSubject.next(false);
  }

  async exportPdf(): Promise<void> {
    this.exportingPdf.set(true);
    const originalMode = this.viewMode();
    if (originalMode === 'text') {
      this.viewMode.set('paper');
      await new Promise<void>(resolve => setTimeout(resolve, 100));
    }

    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const el: HTMLElement | null = document.getElementById('cover-letter-paper');
      if (!el) {
        this.exportingPdf.set(false);
        return;
      }

      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData: string = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth: number = pdf.internal.pageSize.getWidth();
      const pdfHeight: number = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`cover_letter_${this.slugify(this.selectedResumeName())}.pdf`);

      this.isSavedOrExported = true;
      this.exportingPdf.set(false);
      this.notification.success(
        { pt: 'PDF baixado com sucesso!', en: 'PDF downloaded successfully!' },
        { pt: 'Download', en: 'Download' }
      );
    } catch (e: unknown) {
      console.error('PDF export error:', e);
      this.notification.error(
        { pt: 'Erro ao exportar PDF. Tente novamente.', en: 'Error exporting PDF. Please try again.' },
        { pt: 'Erro', en: 'Error' }
      );
    }

    if (originalMode === 'text') {
      this.viewMode.set('text');
    }
    this.exportingPdf.set(false);
  }
}
