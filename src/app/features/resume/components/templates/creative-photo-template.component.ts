import { Component, input, computed, inject } from '@angular/core';
import { Resume } from '../../../../core/models/resume.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-creative-photo-template',
  imports: [TranslateModule],
  template: `
    <div [class]="'cv-creative cv-spacing-' + (resolvedResume().spacingMode || 'normal')" id="cv-creative" spellcheck="false" [style.--cv-primary]="resolvedResume().colorTheme || '#e11d48'" [style.font-family]="resolvedResume().fontFamily || 'Outfit, sans-serif'">
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
            <h3 class="sidebar-title">{{ 'BUILDER.CV.SKILLS' | translate }}</h3>
            <div class="skills-list">
              @for (skill of resolvedResume().skills; track skill.id) {
                <div class="skill-item">
                  <div class="skill-info">
                    <span class="skill-name">{{ skill.name }}</span>
                    <span class="skill-level-text">{{ getLevelLabel(skill.level) }}</span>
                  </div>
                  <div class="skill-dots">
                    @for (dot of [1,2,3,4,5]; track dot) {
                      <div class="dot" [class.active]="skill.level >= dot"></div>
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
            <div class="languages-list">
              @for (lang of resolvedResume().languages; track lang.id) {
                <div class="lang-item">
                  <span class="lang-name">{{ lang.name }}</span>
                  <span class="lang-level">{{ lang.level }}</span>
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
      display: grid;
      grid-template-columns: 1fr 260px;
      background: white;
      color: #334155;
      width: 100%;
      min-height: 100%;
      box-sizing: border-box;
    }

    .cv-main {
      padding: 36px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .cv-header {
      margin-bottom: 8px;
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
      width: 60px;
      background: var(--cv-primary);
      border-radius: 2px;
    }

    .cv-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 6px;
      margin-bottom: 4px;
    }

    .bio-text {
      font-size: 13px;
      color: #475569;
      line-height: 1.7;
    }

    .experience-list, .education-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .exp-item, .edu-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .exp-header, .edu-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }

    .exp-role, .edu-degree {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
    }

    .exp-period, .edu-period {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 500;
      white-space: nowrap;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .exp-company, .edu-institution {
      font-size: 13px;
      font-weight: 600;
      color: var(--cv-primary);
    }

    .exp-desc {
      font-size: 12px;
      color: #475569;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
      margin-top: 4px;
    }

    /* Sidebar Styles */
    .cv-sidebar {
      background: #f8fafc;
      border-left: 1px solid #f1f5f9;
      padding: 36px 24px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .photo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 8px;
    }

    .cv-photo {
      width: 130px;
      height: 130px;
      border-radius: 14px;
      object-fit: cover;
      border: 4px solid white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .cv-photo-placeholder {
      width: 130px;
      height: 130px;
      border-radius: 14px;
      background: var(--cv-primary);
      color: white;
      font-size: 36px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .sidebar-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sidebar-title {
      font-size: 12px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }

    .contact-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .contact-icon {
      font-size: 13px;
      color: var(--cv-primary);
      width: 16px;
      text-align: center;
    }

    .contact-text {
      font-size: 11px;
      color: #475569;
      word-break: break-all;
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
      align-items: center;
    }

    .skill-name {
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
    }

    .skill-level-text {
      font-size: 10px;
      color: #94a3b8;
    }

    .skill-dots {
      display: flex;
      gap: 4px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #e2e8f0;
    }

    .dot.active {
      background: var(--cv-primary);
    }

    .languages-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .lang-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .lang-name {
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
    }

    .lang-level {
      font-size: 10px;
      color: white;
      background: var(--cv-primary);
      padding: 1px 6px;
      border-radius: 100px;
      font-weight: 600;
    }

    /* Spacing Modifiers */
    .cv-spacing-compact .cv-main { padding: 24px; gap: 16px; }
    .cv-spacing-compact .cv-sidebar { padding: 24px 16px; gap: 16px; }
    .cv-spacing-compact .photo-container { margin-bottom: 12px; }
    .cv-spacing-compact .cv-photo,
    .cv-spacing-compact .cv-photo-placeholder { width: 70px; height: 70px; font-size: 20px; }
    .cv-spacing-compact .sidebar-section { gap: 8px; }
    .cv-spacing-compact .contact-list { gap: 6px; }
    .cv-spacing-compact .skills-list { gap: 8px; }
    .cv-spacing-compact .exp-item, .cv-spacing-compact .edu-item { gap: 2px; }

    .cv-spacing-spacious .cv-main { padding: 48px; gap: 36px; }
    .cv-spacing-spacious .cv-sidebar { padding: 48px 32px; gap: 36px; }
    .cv-spacing-spacious .photo-container { margin-bottom: 32px; }
    .cv-spacing-spacious .cv-photo,
    .cv-spacing-spacious .cv-photo-placeholder { width: 110px; height: 110px; }
    .cv-spacing-spacious .sidebar-section { gap: 16px; }
    .cv-spacing-spacious .contact-list { gap: 12px; }
    .cv-spacing-spacious .skills-list { gap: 16px; }
  `]
})
export class CreativePhotoTemplateComponent {
  resume = input.required<Resume>();
  private translate = inject(TranslateService);

  resolvedResume = computed(() => {
    const res = this.resume();
    const isEn = this.translate.currentLang === 'en';

    let photoUrl = res.personalInfo.photo || '';
    if (photoUrl && !photoUrl.startsWith('data:') && !photoUrl.startsWith('http')) {
      photoUrl = environment.uploadUrl + photoUrl;
    }

    return {
      ...res,
      personalInfo: {
        ...res.personalInfo,
        name: res.personalInfo.name || 'João da Silva',
        jobTitle: res.personalInfo.jobTitle || (isEn ? 'Senior Full Stack Developer' : 'Desenvolvedor Full Stack Senior'),
        email: res.personalInfo.email || 'joao@email.com',
        phone: res.personalInfo.phone || (isEn ? '+55 (11) 99999-0000' : '(11) 99999-0000'),
        location: res.personalInfo.location || (isEn ? 'São Paulo, SP - Brazil' : 'São Paulo, SP'),
        bio: res.personalInfo.bio || this.translate.instant('BUILDER.CV.MOCK_BIO'),
        photo: photoUrl,
      },
      experience: (res.experience && res.experience.length > 0) ? res.experience : [
        {
          id: 'mock-exp-1',
          company: isEn ? 'Google Brazil' : 'Google Brasil',
          role: isEn ? 'Senior Full Stack Developer' : 'Desenvolvedor Full Stack Senior',
          startDate: isEn ? 'Jan 2022' : 'Jan 2022',
          endDate: '',
          current: true,
          description: this.translate.instant('BUILDER.CV.MOCK_EXP1_DESC')
        },
        {
          id: 'mock-exp-2',
          company: 'Tech Solutions Inc.',
          role: isEn ? 'Front-end Developer' : 'Desenvolvedor Front-end',
          startDate: isEn ? 'Mar 2020' : 'Mar 2020',
          endDate: isEn ? 'Dec 2021' : 'Dez 2021',
          current: false,
          description: this.translate.instant('BUILDER.CV.MOCK_EXP2_DESC')
        }
      ],
      education: (res.education && res.education.length > 0) ? res.education : [
        {
          id: 'mock-edu-1',
          institution: isEn ? 'University of São Paulo (USP)' : 'Universidade de São Paulo (USP)',
          degree: isEn ? 'Bachelor\'s Degree' : 'Bacharelado',
          field: isEn ? 'Computer Science' : 'Ciência da Computação',
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
        { id: 'mock-skill-5', name: isEn ? 'Databases' : 'Bancos de Dados', level: 4 }
      ]
    };
  });

  getInitials(): string {
    const name = this.resolvedResume().personalInfo.name || '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getLevelLabel(level: number): string {
    const keys = ['', 'BUILDER.CV.LEVEL_1', 'BUILDER.CV.LEVEL_2', 'BUILDER.CV.LEVEL_3', 'BUILDER.CV.LEVEL_4', 'BUILDER.CV.LEVEL_5'];
    return this.translate.instant(keys[level] || '');
  }
}
