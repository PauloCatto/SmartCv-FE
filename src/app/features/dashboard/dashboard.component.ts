import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs/operators';
import { ResumeService } from '../../core/services/resume';
import { AuthService } from '../../core/services/auth';
import { Resume, TEMPLATE_OPTIONS, TemplateType } from '../../core/models/resume.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  resumeService = inject(ResumeService);
  auth = inject(AuthService);
  private router = inject(Router);

  templateOptions = TEMPLATE_OPTIONS;

  firstName$ = this.auth.user$.pipe(
    map(user => {
      const name = user?.name ?? '';
      return name.split(' ')[0];
    })
  );

  getTemplateName(template: string): string {
    const names: Record<string, string> = { elegance: 'Elegance', modern: 'Modern', minimal: 'Minimal' };
    return names[template] ?? template;
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
    this.resumeService.duplicate(resume.id).subscribe();
  }

  deleteResume(id: string) {
    if (confirm('Tem certeza que deseja excluir este currículo?')) {
      this.resumeService.delete(id).subscribe();
    }
  }

  createWithTemplate(template: TemplateType) {
    this.resumeService.create({ template }).subscribe({
      next: (created) => {
        this.router.navigate(['/resume', created.id, 'edit']);
      }
    });
  }
}
