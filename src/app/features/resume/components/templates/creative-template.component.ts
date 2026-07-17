import { Component, input, computed, inject } from '@angular/core';
import { Resume } from '../../../../core/models/resume.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-creative-template',
  imports: [TranslateModule],
  template: `
    <div [class]="'cv-creative cv-spacing-' + (resolvedResume().spacingMode || 'normal')" id="cv-creative" [style.--cv-primary]="resolvedResume().colorTheme || '#e11d48'" [style.font-family]="resolvedResume().fontFamily || 'Outfit, sans-serif'">
      <!-- Main Content (Left) -->
      <div class="cv-main">
        <!-- Header -->
        <div class="cv-header">
          <h1 class="cv-name">{{ resolvedResume().personalInfo.name }}</h1>
          <p class="cv-job">{{ resolvedResume().personalInfo.jobTitle }}</p>
          <div class="job-bar"></div>
        </div>

        <!-- Bio -->
        @if (resolvedResume().personalInfo.bio) {
          <div class="cv-section">
            <h2 class="section-title">{{ 'BUILDER.CV.ABOUT' | translate }}</h2>
            <p class="bio-text">{{ resolvedResume().personalInfo.bio }}</p>
          </div>
        }

        <!-- Experience -->
        @if (resolvedResume().experience.length > 0) {
          <div class="cv-section">
            <h2 class="section-title">{{ 'BUILDER.CV.TRAJECTORY' | translate }}</h2>
            <div class="experience-list">
              @for (exp of resolvedResume().experience; track exp.id) {
                <div class="exp-item">
                  <div class="exp-header">
                    <span class="exp-role">{{ exp.role }}</span>
                    <span class="exp-period">{{ exp.startDate }} – {{ exp.current ? ('BUILDER.CV.CURRENT' | translate) : exp.endDate }}</span>
                  </div>
                  <div class="exp-company">{{ exp.company }}</div>
                  @if (exp.description) {
                    <p class="exp-desc">{{ exp.description }}</p>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Education -->
        @if (resolvedResume().education.length > 0) {
          <div class="cv-section">
            <h2 class="section-title">{{ 'BUILDER.CV.EDUCATION' | translate }}</h2>
            <div class="education-list">
              @for (edu of resolvedResume().education; track edu.id) {
                <div class="edu-item">
                  <div class="edu-header">
                    <span class="edu-degree">{{ edu.degree }} {{ 'BUILDER.CV.IN' | translate }} {{ edu.field }}</span>
                    <span class="edu-period">{{ edu.startDate }} – {{ edu.current ? ('BUILDER.CV.CURRENT' | translate) : edu.endDate }}</span>
                  </div>
                  <div class="edu-institution">{{ edu.institution }}</div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Sidebar (Right) -->
      <div class="cv-sidebar">
        <!-- Photo -->
        <div class="photo-container">
          @if (resolvedResume().personalInfo.photo) {
            <img [src]="resolvedResume().personalInfo.photo" class="cv-photo" alt="Foto de perfil" />
          } @else {
            <div class="cv-photo-placeholder">
              {{ getInitials() }}
            </div>
          }
        </div>

        <!-- Contact Info -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">{{ 'BUILDER.CV.CONTACT' | translate }}</h3>
          <div class="contact-list">
            @if (resolvedResume().personalInfo.email) {
              <div class="contact-item">
                <span class="contact-icon">✉</span>
                <span class="contact-text">{{ resolvedResume().personalInfo.email }}</span>
              </div>
            }
            @if (resolvedResume().personalInfo.phone) {
              <div class="contact-item">
                <span class="contact-icon">✆</span>
                <span class="contact-text">{{ resolvedResume().personalInfo.phone }}</span>
              </div>
            }
            @if (resolvedResume().personalInfo.location) {
              <div class="contact-item">
                <span class="contact-icon">⊙</span>
                <span class="contact-text">{{ resolvedResume().personalInfo.location }}</span>
              </div>
            }
            @if (resolvedResume().personalInfo.linkedin) {
              <div class="contact-item">
                <span class="contact-icon">in</span>
                <span class="contact-text">{{ resolvedResume().personalInfo.linkedin }}</span>
              </div>
            }
            @if (resolvedResume().personalInfo.github) {
              <div class="contact-item">
                <span class="contact-icon">gh</span>
                <span class="contact-text">{{ resolvedResume().personalInfo.github }}</span>
              </div>
            }
            @if (resolvedResume().personalInfo.website) {
              <div class="contact-item">
                <span class="contact-icon">www</span>
                <span class="contact-text">{{ resolvedResume().personalInfo.website }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Skills -->
        @if (resolvedResume().skills.length > 0) {
          <div class="sidebar-section">
            <h3 class="sidebar-title">{{ 'BUILDER.CV.COMPETENCIES' | translate }}</h3>
            <div class="skills-list">
              @for (skill of resolvedResume().skills; track skill.id) {
                <div class="skill-item">
                  <div class="skill-info">
                    <span class="skill-name">{{ skill.name }}</span>
                    <span class="skill-percent">{{ skill.level * 20 }}%</span>
                  </div>
                  <div class="skill-progress-bar">
                    <div class="skill-progress-fill" [style.width.%]="skill.level * 20"></div>
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
                  <div class="skill-info">
                    <span class="skill-name">{{ lang.name }}</span>
                    <span class="skill-percent">{{ lang.level }}</span>
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
    .cv-creative {
      background: #ffffff;
      color: #334155;
      width: 100%;
      min-height: 100%;
      display: flex;
      box-sizing: border-box;
      transition: all 0.2s ease;
    }

    /* MAIN LEFT */
    .cv-main {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .cv-header {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
    }

    .cv-name {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      margin-bottom: 6px;
    }

    .cv-job {
      font-size: 15px;
      font-weight: 600;
      color: var(--cv-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }

    .job-bar {
      height: 4px;
      background: var(--cv-primary);
      width: 60px;
      border-radius: 2px;
    }

    .cv-section {
      display: flex;
      flex-direction: column;
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f172a;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }

    .bio-text {
      font-size: 13px;
      color: #475569;
      line-height: 1.7;
      white-space: pre-wrap; word-break: break-word;
    }

    /* EXPERIENCE & EDUCATION */
    .experience-list, .education-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .exp-item, .edu-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .exp-header, .edu-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
    }

    .exp-role, .edu-degree {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
    }

    .exp-period, .edu-period {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      white-space: nowrap;
    }

    .exp-company, .edu-institution {
      font-size: 12px;
      font-weight: 600;
      color: var(--cv-primary);
    }

    .exp-desc {
      font-size: 12px;
      color: #475569;
      line-height: 1.6;
      margin-top: 2px;
      white-space: pre-wrap; word-break: break-word;
    }

    /* SIDEBAR RIGHT */
    .cv-sidebar {
      width: 230px;
      flex-shrink: 0;
      background: #f8fafc;
      border-left: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .photo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .cv-photo {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }

    .cv-photo-placeholder {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: var(--cv-primary);
      color: white;
      font-size: 28px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }

    .sidebar-section {
      display: flex;
      flex-direction: column;
      margin-bottom: 24px;
    }

    .sidebar-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }

    .contact-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .contact-icon {
      font-size: 14px;
      color: var(--cv-primary);
      width: 16px;
      text-align: center;
      font-weight: 700;
    }

    .contact-text {
      font-size: 11px;
      color: #475569;
      word-break: break-all;
      line-height: 1.4;
    }

    .skills-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skill-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .skill-info {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
      color: #334155;
    }

    .skill-progress-bar {
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .skill-progress-fill {
      height: 100%;
      background: var(--cv-primary);
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    /* =======================================
       DENSITY MODIFIERS (SPACING CONTROLS)
       ======================================= */
    
    /* COMPACT MODE */
    .cv-spacing-compact {
      padding: 20px;
    }
    .cv-spacing-compact .cv-main {
      padding-right: 20px;
    }
    .cv-spacing-compact .cv-sidebar {
      padding: 16px;
      gap: 16px;
    }
    .cv-spacing-compact .cv-name { font-size: 26px; }
    .cv-spacing-compact .cv-section, 
    .cv-spacing-compact .sidebar-section { margin-bottom: 14px; }
    .cv-spacing-compact .section-title,
    .cv-spacing-compact .sidebar-title { margin-bottom: 8px; padding-bottom: 4px; }
    .cv-spacing-compact .experience-list,
    .cv-spacing-compact .education-list,
    .cv-spacing-compact .skills-list { gap: 8px; }
    .cv-spacing-compact .photo-container { margin-bottom: 12px; }
    .cv-spacing-compact .cv-photo,
    .cv-spacing-compact .cv-photo-placeholder { width: 70px; height: 70px; font-size: 20px; }

    /* NORMAL MODE */
    .cv-spacing-normal {
      padding: 32px;
    }
    .cv-spacing-normal .cv-main {
      padding-right: 32px;
    }
    .cv-spacing-normal .cv-sidebar {
      padding: 24px;
      gap: 24px;
    }

    /* SPACIOUS MODE */
    .cv-spacing-spacious {
      padding: 48px;
    }
    .cv-spacing-spacious .cv-main {
      padding-right: 40px;
      gap: 8px;
    }
    .cv-spacing-spacious .cv-sidebar {
      padding: 32px;
      gap: 32px;
    }
    .cv-spacing-spacious .cv-name { font-size: 36px; }
    .cv-spacing-spacious .cv-section, 
    .cv-spacing-spacious .sidebar-section { margin-bottom: 36px; }
    .cv-spacing-spacious .section-title,
    .cv-spacing-spacious .sidebar-title { margin-bottom: 18px; padding-bottom: 8px; }
    .cv-spacing-spacious .experience-list,
    .cv-spacing-spacious .education-list,
    .cv-spacing-spacious .skills-list { gap: 24px; }
    .cv-spacing-spacious .photo-container { margin-bottom: 32px; }
    .cv-spacing-spacious .cv-photo,
    .cv-spacing-spacious .cv-photo-placeholder { width: 110px; height: 110px; }
  `]
})
export class CreativeTemplateComponent {
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
