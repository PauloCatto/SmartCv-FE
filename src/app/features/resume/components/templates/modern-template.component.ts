import { Component, input, computed, inject } from '@angular/core';
import { Resume } from '../../../../core/models/resume.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modern-template',
  imports: [TranslateModule],
  template: `
    <div [class]="'cv-modern cv-spacing-' + (resolvedResume().spacingMode || 'normal')" id="cv-modern" [style.--cv-primary]="resolvedResume().colorTheme || '#4f46e5'" [style.font-family]="resolvedResume().fontFamily || 'Inter, sans-serif'">
      <!-- Sidebar -->
      <div class="cv-sidebar">
        <!-- Photo & name -->
        <div class="sidebar-top">
          @if (resolvedResume().personalInfo.photo) {
            <img [src]="resolvedResume().personalInfo.photo" class="cv-photo" alt="Foto" />
          } @else {
            <div class="cv-photo-placeholder">
              {{ getInitials() }}
            </div>
          }
          <h1 class="cv-name">{{ resolvedResume().personalInfo.name }}</h1>
          <p class="cv-job">{{ resolvedResume().personalInfo.jobTitle }}</p>
        </div>

        <!-- Contacts -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">{{ 'BUILDER.CV.CONTACT' | translate }}</h3>
          <div class="contact-list">
            @if (resolvedResume().personalInfo.email) {
              <div class="contact-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>{{ resolvedResume().personalInfo.email }}</span>
              </div>
            }
            @if (resolvedResume().personalInfo.phone) {
              <div class="contact-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.88a2 2 0 012-2.18H8a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L9.91 14.9a16 16 0 006.29 6.29l1.25-1.25a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 22v3z"/></svg>
                <span>{{ resolvedResume().personalInfo.phone }}</span>
              </div>
            }
            @if (resolvedResume().personalInfo.location) {
              <div class="contact-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{{ resolvedResume().personalInfo.location }}</span>
              </div>
            }
            @if (resolvedResume().personalInfo.linkedin) {
              <div class="contact-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                <span>{{ resolvedResume().personalInfo.linkedin }}</span>
              </div>
            }
            @if (resolvedResume().personalInfo.github) {
              <div class="contact-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                <span>{{ resolvedResume().personalInfo.github }}</span>
              </div>
            }
            @if (resolvedResume().personalInfo.website) {
              <div class="contact-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span>{{ resolvedResume().personalInfo.website }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Skills -->
        @if (resolvedResume().skills.length > 0) {
          <div class="sidebar-section">
            <h3 class="sidebar-title">{{ 'BUILDER.CV.SKILLS' | translate }}</h3>
            <div class="skills-list">
              @for (skill of resolvedResume().skills; track skill.id) {
                <div class="skill-item">
                  <div class="skill-name">{{ skill.name }}</div>
                  <div class="skill-dots">
                    @for (d of [1,2,3,4,5]; track d) {
                      <div class="skill-dot" [class.filled]="skill.level >= d"></div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Languages -->
        @if (resolvedResume().languages && resolvedResume().languages.length > 0) {
          <div class="sidebar-section">
            <h3 class="sidebar-title">{{ 'BUILDER.CV.LANGUAGES' | translate }}</h3>
            <div class="skills-list">
              @for (lang of resolvedResume().languages; track lang.id) {
                <div class="skill-item">
                  <div class="skill-name">{{ lang.name }}</div>
                  <div style="font-size:10px;color:rgba(255,255,255,0.6);margin-top:2px;">{{ lang.level }}</div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Main Content -->
      <div class="cv-main">
        <!-- Bio -->
        @if (resolvedResume().personalInfo.bio) {
          <div class="main-section">
            <h2 class="main-title">
              <span class="title-accent"></span>
              {{ 'BUILDER.CV.ABOUT' | translate }}
            </h2>
            <p class="bio-text">{{ resolvedResume().personalInfo.bio }}</p>
          </div>
        }

        <!-- Experience -->
        @if (resolvedResume().experience.length > 0) {
          <div class="main-section">
            <h2 class="main-title">
              <span class="title-accent"></span>
              {{ 'BUILDER.CV.EXPERIENCE' | translate }}
            </h2>
            <div class="timeline">
              @for (exp of resolvedResume().experience; track exp.id) {
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <div class="timeline-role">{{ exp.role }}</div>
                      <div class="timeline-period">{{ exp.startDate }} – {{ exp.current ? ('BUILDER.CV.CURRENT' | translate) : exp.endDate }}</div>
                    </div>
                    <div class="timeline-company">{{ exp.company }}</div>
                    @if (exp.description) {
                      <p class="timeline-desc">{{ exp.description }}</p>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Education -->
        @if (resolvedResume().education.length > 0) {
          <div class="main-section">
            <h2 class="main-title">
              <span class="title-accent"></span>
              {{ 'BUILDER.CV.EDUCATION' | translate }}
            </h2>
            <div class="timeline">
              @for (edu of resolvedResume().education; track edu.id) {
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <div class="timeline-role">{{ edu.degree }} {{ 'BUILDER.CV.IN' | translate }} {{ edu.field }}</div>
                      <div class="timeline-period">{{ edu.startDate }} – {{ edu.current ? ('BUILDER.CV.CURRENT' | translate) : edu.endDate }}</div>
                    </div>
                    <div class="timeline-company">{{ edu.institution }}</div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cv-modern {
      background: white;
      color: #1e293b;
      width: 100%;
      min-height: 100%;
      display: flex;
    }

    /* SIDEBAR */
    .cv-sidebar {
      width: 220px;
      flex-shrink: 0;
      background: var(--cv-primary);
      color: white;
      padding: 28px 20px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .sidebar-top {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 10px;
    }

    .cv-photo {
      width: 72px; height: 72px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255,255,255,0.3);
    }

    .cv-photo-placeholder {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      border: 3px solid rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      color: white;
    }

    .cv-name { font-size: 16px; font-weight: 800; color: white; }
    .cv-job { font-size: 11px; color: rgba(255,255,255,0.7); }

    .sidebar-section { display: flex; flex-direction: column; gap: 10px; }

    .sidebar-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 700;
      color: rgba(255,255,255,0.6);
      border-bottom: 1px solid rgba(255,255,255,0.15);
      padding-bottom: 6px;
    }

    .contact-list { display: flex; flex-direction: column; gap: 8px; }
    .contact-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 11px;
      color: rgba(255,255,255,0.85);
      word-break: break-word;
    }

    .skills-list { display: flex; flex-direction: column; gap: 10px; }
    .skill-item { display: flex; flex-direction: column; gap: 4px; }
    .skill-name { font-size: 12px; color: rgba(255,255,255,0.9); }
    .skill-dots { display: flex; gap: 4px; }
    .skill-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.2); transition: background 0.3s; }
    .skill-dot.filled { background: white; }

    /* MAIN */
    .cv-main { flex: 1; padding: 28px 28px; display: flex; flex-direction: column; gap: 22px; overflow: hidden; }

    .main-section { display: flex; flex-direction: column; gap: 14px; }

    .main-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 800;
      color: #1e293b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .title-accent { display: block; width: 4px; height: 16px; background: var(--cv-primary); border-radius: 2px; }

    .bio-text { font-size: 12px; color: #475569; line-height: 1.7; }

    /* TIMELINE */
    .timeline { display: flex; flex-direction: column; gap: 16px; }

    .timeline-item { display: flex; gap: 12px; }

    .timeline-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: var(--cv-primary);
      flex-shrink: 0;
      margin-top: 4px;
    }

    .timeline-content { display: flex; flex-direction: column; gap: 4px; flex: 1; }

    .timeline-header { display: flex; justify-content: space-between; gap: 8px; }
    .timeline-role { font-size: 13px; font-weight: 700; color: #1e293b; }
    .timeline-period { font-size: 10px; color: #94a3b8; white-space: nowrap; }
    .timeline-company { font-size: 12px; color: var(--cv-primary); font-weight: 600; }
    .timeline-desc { font-size: 11px; color: #64748b; line-height: 1.5; margin-top: 4px; }

    /* =======================================
       DENSITY MODIFIERS (SPACING CONTROLS)
       ======================================= */
    .cv-spacing-compact .cv-sidebar { width: 190px; padding: 18px 12px; gap: 16px; }
    .cv-spacing-compact .cv-main { padding: 18px 20px; gap: 14px; }
    .cv-spacing-compact .sidebar-top { gap: 6px; }
    .cv-spacing-compact .cv-photo, .cv-spacing-compact .cv-photo-placeholder { width: 56px; height: 56px; font-size: 16px; }
    .cv-spacing-compact .sidebar-section { gap: 6px; }
    .cv-spacing-compact .contact-list { gap: 4px; }
    .cv-spacing-compact .skills-list { gap: 6px; }
    .cv-spacing-compact .skill-item { gap: 2px; }
    .cv-spacing-compact .skill-dot { width: 8px; height: 8px; }
    .cv-spacing-compact .main-section { gap: 8px; }
    .cv-spacing-compact .timeline { gap: 10px; }
    .cv-spacing-compact .timeline-item { gap: 8px; }
    .cv-spacing-compact .timeline-content { gap: 2px; }
    .cv-spacing-compact .bio-text { line-height: 1.5; }

    .cv-spacing-spacious .cv-sidebar { width: 250px; padding: 36px 28px; gap: 36px; }
    .cv-spacing-spacious .cv-main { padding: 36px 36px; gap: 32px; }
    .cv-spacing-spacious .sidebar-top { gap: 16px; }
    .cv-spacing-spacious .cv-photo, .cv-spacing-spacious .cv-photo-placeholder { width: 90px; height: 90px; }
    .cv-spacing-spacious .sidebar-section { gap: 16px; }
    .cv-spacing-spacious .contact-list { gap: 12px; }
    .cv-spacing-spacious .skills-list { gap: 16px; }
    .cv-spacing-spacious .skill-item { gap: 6px; }
    .cv-spacing-spacious .main-section { gap: 18px; }
    .cv-spacing-spacious .timeline { gap: 24px; }
    .cv-spacing-spacious .timeline-item { gap: 16px; }
    .cv-spacing-spacious .bio-text { line-height: 1.8; }
  `]
})
export class ModernTemplateComponent {
  resume = input.required<Resume>();
  private translate = inject(TranslateService);

  resolvedResume = computed(() => {
    const res = this.resume();
    return {
      ...res,
      personalInfo: {
        ...res.personalInfo,
        name: res.personalInfo.name || 'João da Silva',
        jobTitle: res.personalInfo.jobTitle || 'Desenvolvedor Full Stack Senior',
        email: res.personalInfo.email || 'joao@email.com',
        phone: res.personalInfo.phone || '(11) 99999-0000',
        location: res.personalInfo.location || 'São Paulo, SP',
        bio: res.personalInfo.bio || this.translate.instant('BUILDER.CV.MOCK_BIO'),
      },
      experience: (res.experience && res.experience.length > 0) ? res.experience : [
        {
          id: 'mock-exp-1',
          company: 'Google Brasil',
          role: 'Desenvolvedor Full Stack Senior',
          startDate: 'Jan 2022',
          endDate: '',
          current: true,
          description: this.translate.instant('BUILDER.CV.MOCK_EXP1_DESC')
        },
        {
          id: 'mock-exp-2',
          company: 'Tech Solutions Inc.',
          role: 'Desenvolvedor Front-end',
          startDate: 'Mar 2020',
          endDate: 'Dez 2021',
          current: false,
          description: this.translate.instant('BUILDER.CV.MOCK_EXP2_DESC')
        }
      ],
      education: (res.education && res.education.length > 0) ? res.education : [
        {
          id: 'mock-edu-1',
          institution: 'Universidade de São Paulo (USP)',
          degree: 'Bacharelado',
          field: 'Ciência da Computação',
          startDate: '2016',
          endDate: '2020',
          current: false
        }
      ],
      skills: (res.skills && res.skills.length > 0) ? res.skills : [
        { id: 'mock-skill-1', name: 'Angular', level: 5 },
        { id: 'mock-skill-2', name: 'TypeScript', level: 4 },
        { id: 'mock-skill-3', name: 'Node.js', level: 4 },
        { id: 'mock-skill-4', name: 'SASS / CSS', level: 5 },
        { id: 'mock-skill-5', name: 'Bancos de Dados', level: 4 }
      ]
    };
  });

  getInitials(): string {
    return (this.resolvedResume().personalInfo.name || 'SC')
      .split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
