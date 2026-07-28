import { Component, input, computed, inject } from '@angular/core';
import { Resume } from '../../../../core/models/resume.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-minimal-template',
  imports: [TranslateModule, UpperCasePipe],
  template: `
    <div [class]="'cv-minimal cv-spacing-' + (resolvedResume().spacingMode || 'normal')" id="cv-minimal" spellcheck="false" [style.--cv-primary]="resolvedResume().colorTheme || '#111827'" [style.font-family]="resolvedResume().fontFamily || 'Inter, sans-serif'">
      <!-- Header -->
      <div class="cv-header">
        <div class="header-text">
          <h1 class="cv-name">{{ resolvedResume().personalInfo.name }}</h1>
          <p class="cv-job">{{ resolvedResume().personalInfo.jobTitle }}</p>
        </div>
        <div class="header-contacts">
          @if (resolvedResume().personalInfo.email) {
            <span>{{ resolvedResume().personalInfo.email }}</span>
          }
          @if (resolvedResume().personalInfo.phone) {
            <span>{{ resolvedResume().personalInfo.phone }}</span>
          }
          @if (resolvedResume().personalInfo.location) {
            <span>{{ resolvedResume().personalInfo.location }}</span>
          }
          @if (resolvedResume().personalInfo.linkedin) {
            <span>{{ resolvedResume().personalInfo.linkedin }}</span>
          }
          @if (resolvedResume().personalInfo.github) {
            <span>{{ resolvedResume().personalInfo.github }}</span>
          }
          @if (resolvedResume().personalInfo.website) {
            <span>{{ resolvedResume().personalInfo.website }}</span>
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

      <!-- Experience -->
      @if (resolvedResume().experience.length > 0) {
        <div class="cv-section two-col">
          <div class="col-label">
            <h2 class="section-title">{{ 'BUILDER.CV.EXPERIENCE' | translate | uppercase }}</h2>
          </div>
          <div class="col-content">
            @for (exp of resolvedResume().experience; track exp.id; let last = $last) {
              <div class="cv-item" [class.last]="last">
                <div class="item-top">
                  <div>
                    <div class="item-role">{{ exp.role }}</div>
                    <div class="item-company">{{ exp.company }}</div>
                  </div>
                  <div class="item-period">{{ exp.startDate }} – {{ exp.current ? ('BUILDER.CV.CURRENT' | translate) : exp.endDate }}</div>
                </div>
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
        <div class="cv-section two-col">
          <div class="col-label">
            <h2 class="section-title">{{ 'BUILDER.CV.EDUCATION' | translate | uppercase }}</h2>
          </div>
          <div class="col-content">
            @for (edu of resolvedResume().education; track edu.id; let last = $last) {
              <div class="cv-item" [class.last]="last">
                <div class="item-top">
                  <div>
                    <div class="item-role">{{ edu.degree }} {{ 'BUILDER.CV.IN' | translate }} {{ edu.field }}</div>
                    <div class="item-company">{{ edu.institution }}</div>
                  </div>
                  <div class="item-period">{{ edu.startDate }} – {{ edu.current ? ('BUILDER.CV.CURRENT' | translate) : edu.endDate }}</div>
                </div>
              </div>
            }
          </div>
        </div>
        <div class="cv-divider"></div>
      }

      <!-- Skills -->
      @if (resolvedResume().skills.length > 0) {
        <div class="cv-section two-col">
          <div class="col-label">
            <h2 class="section-title">SKILLS</h2>
          </div>
          <div class="col-content">
            <div class="skills-wrap">
              @for (skill of resolvedResume().skills; track skill.id) {
                <span class="skill-tag">{{ skill.name }}</span>
              }
            </div>
          </div>
        </div>
      }

      <!-- Languages -->
      @if (resolvedResume().languages && resolvedResume().languages.length > 0) {
        <div class="cv-section two-col">
          <div class="col-label">
            <h2 class="section-title">{{ 'BUILDER.CV.LANGUAGES' | translate }}</h2>
          </div>
          <div class="col-content">
            <div class="skills-wrap">
              @for (lang of resolvedResume().languages; track lang.id) {
                <span class="skill-tag lang-tag">{{ lang.name }}</span>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cv-minimal {
      background: white;
      color: #111827;
      width: 100%;
      min-height: 100%;
      padding: 40px;
      box-sizing: border-box;
    }

    /* HEADER */
    .cv-header {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 20px;
      align-items: center;
      margin-bottom: 28px;
    }

    .cv-photo {
      width: 68px; height: 68px;
      border-radius: 50%;
      object-fit: cover;
    }

    .header-text {}

    .cv-name {
      font-size: 26px;
      font-weight: 900;
      color: #111827;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }

    .cv-job {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
      font-weight: 400;
    }

    .header-contacts {
      display: flex;
      flex-direction: column;
      gap: 3px;
      align-items: flex-end;
      font-size: 11px;
      color: #6b7280;
    }

    .cv-divider { height: 1px; background: #f3f4f6; margin-bottom: 24px; }

    /* SECTIONS */
    .cv-section { margin-bottom: 24px; }

    .two-col {
      display: grid;
      grid-template-columns: 130px 1fr;
      gap: 20px;
    }

    .col-label {}

    .section-title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--cv-primary);
      margin-top: 2px;
    }

    .bio-text { font-size: 12px; color: #4b5563; line-height: 1.7; white-space: pre-wrap; word-break: break-word; }

    /* ITEMS */
    .cv-item { padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid #f9fafb; }
    .cv-item.last { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }

    .item-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 6px;
    }

    .item-role { font-size: 13px; font-weight: 700; color: #111827; }
    .item-company { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .item-period { font-size: 11px; color: #9ca3af; white-space: nowrap; flex-shrink: 0; }
    .item-desc { font-size: 12px; color: #4b5563; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }

    /* SKILLS */
    .skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag {
      font-size: 11px;
      padding: 4px 10px;
      color: var(--cv-primary);
      border-radius: 100px;
      font-weight: 600;
      position: relative;
      overflow: hidden;
      z-index: 1;
    }
    .skill-tag::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--cv-primary);
      opacity: 0.08;
      z-index: -1;
    }

    .cv-item, .skill-tag, .contact-item {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .section-title {
      break-after: avoid;
      page-break-after: avoid;
    }

    /* =======================================
       DENSITY MODIFIERS (SPACING CONTROLS)
       ======================================= */
    .cv-spacing-compact { padding: 24px; }
    .cv-spacing-compact .cv-header { margin-bottom: 16px; }
    .cv-spacing-compact .cv-divider { margin-bottom: 14px; }
    .cv-spacing-compact .cv-section { margin-bottom: 14px; }
    .cv-spacing-compact .cv-item { padding-bottom: 8px; margin-bottom: 8px; }
    .cv-spacing-compact .bio-text { line-height: 1.5; }

    .cv-spacing-spacious { padding: 56px; }
    .cv-spacing-spacious .cv-header { margin-bottom: 36px; }
    .cv-spacing-spacious .cv-divider { margin-bottom: 36px; }
    .cv-spacing-spacious .cv-section { margin-bottom: 36px; }
    .cv-spacing-spacious .cv-item { padding-bottom: 20px; margin-bottom: 20px; }
    .cv-spacing-spacious .bio-text { line-height: 1.8; }
  `]
})
export class MinimalTemplateComponent {
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
}

