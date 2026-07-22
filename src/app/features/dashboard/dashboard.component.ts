import { Component, inject, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map, BehaviorSubject, Subscription, finalize, catchError, of } from 'rxjs';
import { ResumeService } from '../../core/services/resume';
import { AuthService } from '../../core/services/auth';
import { Resume, DashboardStats, TEMPLATE_OPTIONS } from '../../core/models/resume.model';
import { JobMatcherModalComponent } from '../../shared/components/job-matcher-modal/job-matcher-modal.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AiService } from '../../core/services/ai';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    AsyncPipe,
    JobMatcherModalComponent,
    ConfirmModalComponent,
    TranslateModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  resumeService = inject(ResumeService);
  auth = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);
  private aiService = inject(AiService);

  @ViewChild('carouselContainer') carouselContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedResumeId: string | null = null;
  deleteTargetId: string | null = null;
  templateOptions = TEMPLATE_OPTIONS;

  private loadingSubject = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingSubject.asObservable();

  stats: DashboardStats = { totalResumes: 0, plan: 'FREE', aiActive: false };

  resumes$ = this.resumeService.resumes$;
  hasResumes$ = this.resumes$.pipe(map(r => r.length > 0));
  firstName$ = this.auth.user$.pipe(
    map(u => u?.name?.split(' ')[0] || 'Usuário')
  );

  isImportingLinkedIn = false;

  dashboard$ = combineLatest([
    this.resumeService.resumes$,
    this.resumeService.getDashboardStats(),
  ]).pipe(
    map(([resumes, stats]) => {
      this.loadingSubject.next(false);
      return { resumes, stats };
    }),
    catchError(() => {
      this.loadingSubject.next(false);
      return of({ resumes: [], stats: this.stats });
    })
  );

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.resumeService.loadResumes(true).subscribe(resumes => {
      this.loadingSubject.next(false);
    });
    const sub = this.resumeService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  getTemplateName(template: string): string {
    const opt = this.templateOptions.find(t => t.id === template);
    return opt?.ptName ?? template;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    return date.toLocaleDateString('pt-BR');
  }

  duplicate(resume: Resume): void {
    this.resumeService.duplicate(resume.id).subscribe({
      next: () => {
        this.toastr.success('Currículo duplicado com sucesso!', 'Duplicado');
      },
      error: () => {
        this.toastr.error('Erro ao duplicar currículo.', 'Erro');
      }
    });
  }

  requestDelete(id: string): void {
    this.deleteTargetId = id;
  }

  confirmDelete(): void {
    if (!this.deleteTargetId) return;
    const id = this.deleteTargetId;
    this.deleteTargetId = null;

    this.resumeService.delete(id).subscribe({
      next: () => {
        this.toastr.success('Currículo excluído com sucesso!', 'Excluído');
      },
      error: () => {
        this.toastr.error('Erro ao excluir currículo. Tente novamente.', 'Erro');
      }
    });
  }

  cancelDelete(): void {
    this.deleteTargetId = null;
  }

  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/--+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '');
  }

  createWithTemplate(tmpl: { id: string, name?: string, ptName?: string, customColor?: string, customFont?: string }): void {
    const isEn = this.translate.currentLang === 'en';
    const titulo = isEn && tmpl.name ? tmpl.name : tmpl.ptName;

    this.resumeService.create({
      template: tmpl.id as any,
      colorTheme: tmpl.customColor || '#1e293b',
      fontFamily: tmpl.customFont || "'Inter', sans-serif",
      title: titulo
    }).subscribe({
      next: (created) => {
        this.router.navigate(['/resume', this.slugify(created.title), 'edit']);
      }
    });
  }

  openJobMatcher(resumeId: string): void {
    this.selectedResumeId = resumeId;
  }

  closeJobMatcher(): void {
    this.selectedResumeId = null;
  }

  editResume(resume: Resume): void {
    this.router.navigate(['/resume', this.slugify(resume.title), 'edit']);
  }

  scrollCarousel(offset: number): void {
    if (this.carouselContainer) {
      this.carouselContainer.nativeElement.scrollBy({
        left: offset,
        behavior: 'smooth'
      });
    }
  }

  triggerLinkedInImport(): void {
    this.fileInput.nativeElement.click();
  }

  onLinkedInFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      this.toastr.error('Por favor, envie um arquivo PDF do LinkedIn.', 'Erro');
      return;
    }

    this.isImportingLinkedIn = true;
    const lang = this.translate.currentLang;

    this.aiService.importLinkedIn(file, lang).pipe(
      finalize(() => {
        this.isImportingLinkedIn = false;
        input.value = '';
      })
    ).subscribe({
      next: (parsedResume) => {
        const isEn = lang === 'en';
        const now = new Date();
        const monthFormatter = new Intl.DateTimeFormat(isEn ? 'en-US' : 'pt-BR', { month: 'short' });
        const mes = monthFormatter.format(now).replace('.', '');
        const ano = now.getFullYear();
        const prefix = isEn ? 'Resume' : 'Currículo';

        parsedResume.title = `${prefix} LinkedIn - ${mes.charAt(0).toUpperCase() + mes.slice(1)} ${ano}`;
        parsedResume.template = 'elegance'; // Template padrão

        this.resumeService.create(parsedResume).subscribe({
          next: (created) => {
            this.toastr.success(isEn ? 'Resume created successfully!' : 'Currículo criado com sucesso!');
            this.router.navigate(['/resume', this.slugify(created.title), 'edit']);
          },
          error: () => this.toastr.error(isEn ? 'Error saving the resume.' : 'Erro ao salvar o currículo.')
        });
      },
      error: () => {
        this.toastr.error(lang === 'en' ? 'Failed to process LinkedIn PDF.' : 'Falha ao processar o PDF do LinkedIn.', 'Erro');
      }
    });
  }
}
