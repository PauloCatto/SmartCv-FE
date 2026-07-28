import { Component, input, computed, inject } from '@angular/core';
import { Resume } from '../../../../core/models/resume.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-elegance-template',
  imports: [TranslateModule],
  template: `
    <div [class]="'cv-elegance cv-spacing-' + (resolvedResume().spacingMode || 'normal')" id="cv-elegance" spellcheck="false" [style.--cv-primary]="resolvedResume().colorTheme || '#1e293b'" [style.font-family]="resolvedResume().fontFamily || 'Georgia, serif'">
      <!-- Header -->
      <div class="cv-header">
        <div class="header-left">
          <div class="header-info">
            <h1 class="cv-name">{{ resolvedResume().personalInfo.name }}</h1>
            <p class="cv-job">{{ resolvedResume().personalInfo.jobTitle }}</p>
            <div class="cv-contacts">
              @if (resolvedResume().personalInfo.email) {
                <span class="contact-item">✉ {{ resolvedResume().personalInfo.email }}</span>
              }
              @if (resolvedResume().personalInfo.phone) {
                <span class="contact-item">✆ {{ resolvedResume().personalInfo.phone }}</span>
              }
              @if (resolvedResume().personalInfo.location) {
                <span class="contact-item">⊙ {{ resolvedResume().personalInfo.location }}</span>
              }
              @if (resolvedResume().personalInfo.linkedin) {
                <span class="contact-item">in {{ resolvedResume().personalInfo.linkedin }}</span>
              }
              @if (resolvedResume().personalInfo.github) {
                <span class="contact-item">gh {{ resolvedResume().personalInfo.github }}</span>
              }
              @if (resolvedResume().personalInfo.website) {
                <span class="contact-item">www {{ resolvedResume().personalInfo.website }}</span>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="cv-body">
        <!-- Bio -->
        @if (resolvedResume().personalInfo.bio) {
          <div class="cv-section">
            <h2 class="section-title">{{ 'BUILDER.CV.ABOUT' | translate }}</h2>
            <div class="section-line"></div>
            <p class="bio-text">{{ resolvedResume().personalInfo.bio }}</p>
          </div>
        }

        <!-- Experience -->
        @if (resolvedResume().experience.length > 0) {
          <div class="cv-section">
            <h2 class="section-title">{{ 'BUILDER.CV.EXPERIENCE' | translate }}</h2>
            <div class="section-line"></div>
            <div class="items-list">
              @for (exp of resolvedResume().experience; track exp.id) {
                <div class="cv-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">{{ exp.role }}</div>
                      <div class="item-subtitle">{{ exp.company }}</div>
                    </div>
                    <div class="item-period">
                      {{ exp.startDate }} – {{ exp.current ? ('BUILDER.CV.CURRENT' | translate) : exp.endDate }}
                    </div>
                  </div>
                  @if (exp.description) {
                    <p class="item-desc">{{ exp.description }}</p>
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
            <div class="section-line"></div>
            <div class="items-list">
              @for (edu of resolvedResume().education; track edu.id) {
                <div class="cv-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">{{ edu.degree }} {{ 'BUILDER.CV.IN' | translate }} {{ edu.field }}</div>
                      <div class="item-subtitle">{{ edu.institution }}</div>
                    </div>
                    <div class="item-period">
                      {{ edu.startDate }} – {{ edu.current ? ('BUILDER.CV.CURRENT' | translate) : edu.endDate }}
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Skills -->
        @if (resolvedResume().skills.length > 0) {
          <div class="cv-section">
            <h2 class="section-title">{{ 'BUILDER.CV.SKILLS' | translate }}</h2>
            <div class="section-line"></div>
            <div class="skills-grid">
              @for (skill of resolvedResume().skills; track skill.id) {
                <div class="skill-item">
                  <div class="skill-name-row">
                    <span class="skill-name">{{ skill.name }}</span>
                  </div>
                  <div class="skill-bar">
                    <div class="skill-fill" [style.width.%]="skill.level * 20"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Languages -->
        @if (resolvedResume().languages && resolvedResume().languages.length > 0) {
          <div class="cv-section">
            <h2 class="section-title">{{ 'BUILDER.CV.LANGUAGES' | translate }}</h2>
            <div class="section-line"></div>
            <div class="languages-grid">
              @for (lang of resolvedResume().languages; track lang.id) {
                <div class="language-item">
                  <span class="language-name">{{ lang.name }}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cv-elegance {
      background: white;
      color: #1e293b;
      width: 100%;
      min-height: 100%;
      box-sizing: border-box;
    }

    .cv-header {
      background: var(--cv-primary);
      color: white;
      padding: 32px 36px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .cv-photo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255,255,255,0.2);
      flex-shrink: 0;
    }

    .cv-name {
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin-bottom: 4px;
    }

    .cv-job {
      font-size: 14px;
      color: rgba(255,255,255,0.7);
      font-family: 'Inter', sans-serif;
      font-weight: 400;
      margin-bottom: 12px;
    }

    .cv-contacts {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .contact-item {
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      font-family: 'Inter', sans-serif;
    }

    .cv-body { padding: 28px 36px; display: flex; flex-direction: column; gap: 24px; }

    .cv-section { display: flex; flex-direction: column; gap: 12px; }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--cv-primary);
      font-family: 'Inter', sans-serif;
    }

    .section-line {
      height: 2px;
      background: var(--cv-primary);
      width: 100%;
      margin-bottom: 4px;
    }

    .bio-text {
      font-size: 13px;
      color: #475569;
      line-height: 1.7;
    }

    .items-list { display: flex; flex-direction: column; gap: 16px; }

    .cv-item { display: flex; flex-direction: column; gap: 6px; }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }

    .item-title { font-size: 14px; font-weight: 700; color: #1e293b; font-family: 'Inter', sans-serif; }
    .item-subtitle { font-size: 13px; color: #64748b; font-family: 'Inter', sans-serif; }
    .item-period { font-size: 11px; color: #94a3b8; font-family: 'Inter', sans-serif; white-space: nowrap; flex-shrink: 0; }
    .item-desc { font-size: 12px; color: #475569; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }

    .skills-grid { display: flex; flex-direction: column; gap: 10px; }
    .skill-item { display: flex; flex-direction: column; gap: 4px; }
    .skill-name-row { display: flex; justify-content: space-between; }
    .skill-name { font-size: 13px; font-weight: 600; color: #1e293b; font-family: 'Inter', sans-serif; }
    .skill-level-text { font-size: 11px; color: #94a3b8; font-family: 'Inter', sans-serif; }
    .skill-bar { height: 4px; background: #e2e8f0; border-radius: 2px; }
    .skill-fill { height: 100%; background: var(--cv-primary); border-radius: 2px; transition: width 0.5s ease; }

    .languages-grid { display: flex; flex-direction: column; gap: 8px; }
    .language-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
    .language-item:last-child { border-bottom: none; }
    .language-name { font-size: 13px; font-weight: 600; color: #1e293b; font-family: 'Inter', sans-serif; }
    .language-level { font-size: 11px; color: white; background: var(--cv-primary); padding: 4px 10px; border-radius: 100px; font-family: 'Inter', sans-serif; font-weight: 600; display: inline-block; white-space: nowrap; text-align: center; }


    .cv-item, .skill-item, .language-item, .contact-item {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .cv-section {
      break-inside: auto;
    }

    .section-title, .section-line {
      break-after: avoid;
      page-break-after: avoid;
    }

    /* =======================================
       DENSITY MODIFIERS (SPACING CONTROLS)
       ======================================= */
    .cv-spacing-compact .cv-header { padding: 18px 24px; }
    .cv-spacing-compact .cv-body { padding: 16px 24px; gap: 14px; }
    .cv-spacing-compact .cv-section { gap: 8px; }
    .cv-spacing-compact .items-list { gap: 8px; }
    .cv-spacing-compact .cv-item { gap: 2px; }
    .cv-spacing-compact .skills-grid { gap: 6px; }
    .cv-spacing-compact .bio-text { line-height: 1.5; }

    .cv-spacing-spacious .cv-header { padding: 44px 44px; }
    .cv-spacing-spacious .cv-body { padding: 36px 44px; gap: 36px; }
    .cv-spacing-spacious .cv-section { gap: 16px; }
    .cv-spacing-spacious .items-list { gap: 24px; }
    .cv-spacing-spacious .cv-item { gap: 8px; }
    .cv-spacing-spacious .skills-grid { gap: 14px; }
    .cv-spacing-spacious .bio-text { line-height: 1.8; }
  `]
})
export class EleganceTemplateComponent {
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

