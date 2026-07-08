import { Component, inject, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map, BehaviorSubject, Subscription, finalize, catchError, of } from 'rxjs';
import { ResumeService } from '../../core/services/resume';
import { AuthService } from '../../core/services/auth';
import { Resume, DashboardStats, TEMPLATE_OPTIONS } from '../../core/models/resume.model';
import { JobMatcherModalComponent } from './components/job-matcher-modal/job-matcher-modal';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

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

  @ViewChild('carouselContainer') carouselContainer!: ElementRef;

  selectedResumeId: string | null = null;
  deleteTargetId: string | null = null;
  templateOptions = TEMPLATE_OPTIONS;

  private loadingSubject = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingSubject.asObservable();

  stats: DashboardStats = { totalResumes: 0, plan: 'FREE', aiActive: false };

  resumes$ = this.resumeService.resumes$;

  firstName$ = this.auth.user$.pipe(
    map(user => {
      const name = user?.name ?? '';
      return name.split(' ')[0];
    })
  );

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

  ngOnInit() {
    const sub = this.resumeService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });
    this.subs.push(sub);
  }

  ngOnDestroy() {
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

  duplicate(resume: Resume) {
    this.resumeService.duplicate(resume.id).subscribe({
      next: () => {
        this.toastr.success('Currículo duplicado com sucesso!', 'Duplicado');
      },
      error: () => {
        this.toastr.error('Erro ao duplicar currículo.', 'Erro');
      }
    });
  }

  requestDelete(id: string) {
    this.deleteTargetId = id;
  }

  confirmDelete() {
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

  cancelDelete() {
    this.deleteTargetId = null;
  }

  createWithTemplate(tmpl: any) {
    const now = new Date();
    const mes = now.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    const ano = now.getFullYear();
    const titulo = `Currículo ${tmpl.ptName} - ${mes.charAt(0).toUpperCase() + mes.slice(1)} ${ano}`;

    this.resumeService.create({
      template: tmpl.id,
      colorTheme: tmpl.customColor || '#1e293b',
      fontFamily: tmpl.customFont || "'Inter', sans-serif",
      title: titulo
    }).subscribe({
      next: (created) => {
        this.router.navigate(['/resume', created.id, 'edit']);
      }
    });
  }

  openJobMatcher(resumeId: string) {
    this.selectedResumeId = resumeId;
  }

  closeJobMatcher() {
    this.selectedResumeId = null;
  }

  editResume(id: string) {
    this.router.navigate(['/resume', id, 'edit']);
  }

  scrollCarousel(offset: number) {
    if (this.carouselContainer) {
      this.carouselContainer.nativeElement.scrollBy({
        left: offset,
        behavior: 'smooth'
      });
    }
  }
}
