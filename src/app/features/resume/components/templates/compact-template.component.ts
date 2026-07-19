import { Component, input, computed, inject } from '@angular/core';
import { Resume } from '../../../../core/models/resume.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-compact-template',
  imports: [TranslateModule],
  template: `
    <div [class]="'cv-compact cv-spacing-' + (resolvedResume().spacingMode || 'normal')" id="cv-compact" spellcheck="false" [style.--cv-primary]="resolvedResume().colorTheme || '#0284c7'" [style.font-family]="resolvedResume().fontFamily || 'Inter, sans-serif'">
      <!-- Top Header -->
      <div class="cv-header">
        <div class="header-left">
          <div class="header-info">
            <h1 class="cv-name">{{ resolvedResume().personalInfo.name }}</h1>
            <p class="cv-job">{{ resolvedResume().personalInfo.jobTitle }}</p>
          </div>
        </div>

        <div class="header-contacts">
          @if (resolvedResume().personalInfo.email) {
            <div class="contact-item">✉ {{ resolvedResume().personalInfo.email }}</div>
          }
          @if (resolvedResume().personalInfo.phone) {
            <div class="contact-item">✆ {{ resolvedResume().personalInfo.phone }}</div>
          }
          @if (resolvedResume().personalInfo.location) {
            <div class="contact-item">⊙ {{ resolvedResume().personalInfo.location }}</div>
          }
          @if (resolvedResume().personalInfo.linkedin) {
            <div class="contact-item">in {{ resolvedResume().personalInfo.linkedin }}</div>
          }
          @if (resolvedResume().personalInfo.github) {
            <div class="contact-item">gh {{ resolvedResume().personalInfo.github }}</div>
          }
          @if (resolvedResume().personalInfo.website) {
            <div class="contact-item">www {{ resolvedResume().personalInfo.website }}</div>
          }
        </div>
      </div>

      <div class="cv-divider"></div>

      <!-- Bio -->
      @if (resolvedResume().personalInfo.bio) {
        <div class="cv-section">
          <p class="bio-text">{{ resolvedResume().personalInfo.bio }}</p>
        </div>
        <div class="cv-divider"></div>
      }

      <!-- Grid Body -->
      <div class="cv-body-grid">
        <!-- Experience -->
        @if (resolvedResume().experience.length > 0) {
          <div class="cv-section">
            <h2 class="section-title">{{ 'BUILDER.CV.EXPERIENCE_FULL' | translate }}</h2>
            <div class="horizontal-list">
              @for (exp of resolvedResume().experience; track exp.id) {
                <div class="exp-item">
                  <div class="item-meta">
                    <span class="item-period">{{ exp.startDate }} – {{ exp.current ? ('BUILDER.CV.CURRENT' | translate) : exp.endDate }}</span>
                    <span class="item-dot"></span>
                    <span class="item-company">{{ exp.company }}</span>
                  </div>
                  <h3 class="item-role">{{ exp.role }}</h3>
                  @if (exp.description) {
                    <p class="item-desc">{{ exp.description }}</p>
                  }
                </div>
              }
            </div>
          </div>
          <div class="cv-divider"></div>
        }

        <!-- Education -->
        @if (resolvedResume().education.length > 0) {
          <div class="cv-section">
            <h2 class="section-title">{{ 'BUILDER.CV.EDUCATION_CERTS' | translate }}</h2>
            <div class="horizontal-list">
              @for (edu of resolvedResume().education; track edu.id) {
                <div class="edu-item">
                  <div class="item-meta">
                    <span class="item-period">{{ edu.startDate }} – {{ edu.current ? ('BUILDER.CV.CURRENT' | translate) : edu.endDate }}</span>
                    <span class="item-dot"></span>
                    <span class="item-company">{{ edu.institution }}</span>
                  </div>
                  <h3 class="item-role">{{ edu.degree }} {{ 'BUILDER.CV.IN' | translate }} {{ edu.field }}</h3>
                </div>
              }
            </div>
          </div>
          <div class="cv-divider"></div>
        }

        <!-- Skills -->
        @if (resolvedResume().skills.length > 0) {
          <div class="cv-section">
            <h2 class="section-title">{{ 'BUILDER.CV.SKILLS_KNOWLEDGE' | translate }}</h2>
            <div class="skills-tags-wrap">
              @for (skill of resolvedResume().skills; track skill.id) {
                <div class="skill-tag-card">
                  <span class="skill-tag-name">{{ skill.name }}</span>
                  <span class="skill-tag-level">{{ getLevelLabel(skill.level) }}</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Languages -->
        @if (resolvedResume().languages && resolvedResume().languages.length > 0) {
          <div class="cv-section">
            <h2 class="section-title">{{ 'BUILDER.CV.LANGUAGES' | translate }}</h2>
            <div class="skills-tags-wrap">
              @for (lang of resolvedResume().languages; track lang.id) {
                <div class="skill-tag-card">
                  <span class="skill-tag-name">{{ lang.name }}</span>
                  <span class="skill-tag-level">{{ lang.level }}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cv-compact {
      background: #ffffff;
      color: #334155;
      width: 100%;
      min-height: 100%;
      box-sizing: border-box;
      transition: all 0.2s ease;
    }

    /* HEADER */
    .cv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cv-photo {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--cv-primary);
    }

    .cv-name {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }

    .cv-job {
      font-size: 13px;
      color: var(--cv-primary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 2px;
    }

    .header-contacts {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      font-size: 11px;
      color: #64748b;
    }

    .contact-item {
      font-weight: 500;
    }

    .cv-divider {
      height: 1px;
      background: #f1f5f9;
    }

    /* BODY & SECTIONS */
    .cv-section {
      display: flex;
      flex-direction: column;
    }

    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--cv-primary);
      margin-bottom: 12px;
    }

    .bio-text {
      font-size: 11px;
      color: #334155;
      line-height: 1.6;
      white-space: pre-wrap; word-break: break-word;
    }

    /* HORIZONTAL GRID OR FLOW FOR ITEMS */
    .horizontal-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .exp-item, .edu-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .item-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }

    .item-dot {
      width: 4px;
      height: 4px;
      background: #cbd5e1;
      border-radius: 50%;
    }

    .item-company {
      font-weight: 600;
      color: #334155;
    }

    .item-role {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    .item-desc {
      font-size: 11px;
      color: #475569;
      line-height: 1.5;
      margin-top: 2px;
      white-space: pre-wrap; word-break: break-word;
    }

    /* SKILLS HORIZONTAL TAGS */
    .skills-tags-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .skill-tag-card {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 6px;
      padding: 6px 12px;
    }

    .skill-tag-name {
      font-size: 11px;
      font-weight: 700;
      color: #1e293b;
    }

    .skill-tag-level {
      font-size: 9px;
      background: color-mix(in srgb, var(--cv-primary) 10%, #fff);
      color: var(--cv-primary);
      padding: 2px 6px;
      border-radius: 100px;
      font-weight: 700;
    }

    /* =======================================
       DENSITY MODIFIERS (SPACING CONTROLS)
       ======================================= */

    /* COMPACT MODE */
    .cv-spacing-compact {
      padding: 24px;
    }
    .cv-spacing-compact .cv-header { margin-bottom: 12px; }
    .cv-spacing-compact .cv-divider { margin: 12px 0; }
    .cv-spacing-compact .section-title { margin-bottom: 8px; }
    .cv-spacing-compact .horizontal-list { gap: 8px; }
    .cv-spacing-compact .skills-tags-wrap { gap: 6px; }
    .cv-spacing-compact .skill-tag-card { padding: 4px 10px; }

    /* NORMAL MODE */
    .cv-spacing-normal {
      padding: 36px;
    }
    .cv-spacing-normal .cv-header { margin-bottom: 16px; }
    .cv-spacing-normal .cv-divider { margin: 18px 0; }
    .cv-spacing-normal .section-title { margin-bottom: 12px; }
    .cv-spacing-normal .horizontal-list { gap: 14px; }

    /* SPACIOUS MODE */
    .cv-spacing-spacious {
      padding: 52px;
    }
    .cv-spacing-spacious .cv-header { margin-bottom: 24px; }
    .cv-spacing-spacious .cv-name { font-size: 28px; }
    .cv-spacing-spacious .cv-job { font-size: 14px; }
    .cv-spacing-spacious .cv-divider { margin: 28px 0; }
    .cv-spacing-spacious .section-title { margin-bottom: 16px; font-size: 12px; }
    .cv-spacing-spacious .horizontal-list { gap: 24px; }
    .cv-spacing-spacious .exp-item, .cv-spacing-spacious .edu-item { gap: 4px; }
    .cv-spacing-spacious .item-desc { font-size: 12px; line-height: 1.6; }
    .cv-spacing-spacious .skills-tags-wrap { gap: 12px; }
    .cv-spacing-spacious .skill-tag-card { padding: 8px 16px; }
  `]
})
export class CompactTemplateComponent {
  resume = input.required<Resume>();
  private translate = inject(TranslateService);

  resolvedResume = computed(() => {
    const res = this.resume();
    const isEn = this.translate.currentLang === 'en';
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

  getLevelLabel(level: number): string {
    const keys = ['', 'BUILDER.CV.LEVEL_1', 'BUILDER.CV.LEVEL_2', 'BUILDER.CV.LEVEL_3', 'BUILDER.CV.LEVEL_4', 'BUILDER.CV.LEVEL_5'];
    return this.translate.instant(keys[level] || '');
  }
}

