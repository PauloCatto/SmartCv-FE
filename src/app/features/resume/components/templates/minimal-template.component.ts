import { Component, input, computed } from '@angular/core';
import { Resume } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-minimal-template',
  template: `
    <div [class]="'cv-minimal cv-spacing-' + (resolvedResume().spacingMode || 'normal')" id="cv-minimal" [style.--cv-primary]="resolvedResume().colorTheme || '#111827'" [style.font-family]="resolvedResume().fontFamily || 'Inter, sans-serif'">
      <!-- Header -->
      <div class="cv-header">
        @if (resolvedResume().personalInfo.photo) {
          <img [src]="resolvedResume().personalInfo.photo" class="cv-photo" alt="Foto" />
        }
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
            <h2 class="section-title">EXPERIÊNCIA</h2>
          </div>
          <div class="col-content">
            @for (exp of resolvedResume().experience; track exp.id; let last = $last) {
              <div class="cv-item" [class.last]="last">
                <div class="item-top">
                  <div>
                    <div class="item-role">{{ exp.role }}</div>
                    <div class="item-company">{{ exp.company }}</div>
                  </div>
                  <div class="item-period">{{ exp.startDate }} – {{ exp.current ? 'Atual' : exp.endDate }}</div>
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
            <h2 class="section-title">EDUCAÇÃO</h2>
          </div>
          <div class="col-content">
            @for (edu of resolvedResume().education; track edu.id; let last = $last) {
              <div class="cv-item" [class.last]="last">
                <div class="item-top">
                  <div>
                    <div class="item-role">{{ edu.degree }} em {{ edu.field }}</div>
                    <div class="item-company">{{ edu.institution }}</div>
                  </div>
                  <div class="item-period">{{ edu.startDate }} – {{ edu.current ? 'Atual' : edu.endDate }}</div>
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

    .bio-text { font-size: 13px; color: #374151; line-height: 1.7; }

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
    .item-desc { font-size: 12px; color: #4b5563; line-height: 1.6; }

    /* SKILLS */
    .skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag {
      font-size: 11px;
      padding: 4px 10px;
      background: color-mix(in srgb, var(--cv-primary) 8%, transparent);
      color: var(--cv-primary);
      border-radius: 100px;
      font-weight: 600;
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
        bio: res.personalInfo.bio || 'Profissional experiente em desenvolvimento de software com foco em Angular, Node.js e arquiteturas de sistemas escaláveis. Apaixonado por solucionar problemas complexos e criar soluções eficientes que geram valor de negócio.',
      },
      experience: (res.experience && res.experience.length > 0) ? res.experience : [
        {
          id: 'mock-exp-1',
          company: 'Google Brasil',
          role: 'Desenvolvedor Full Stack Senior',
          startDate: 'Jan 2022',
          endDate: 'Atual',
          current: true,
          description: 'Responsável pela liderança técnica de projetos em Angular e Node.js. Otimizei o tempo de carregamento de aplicações críticas em 40% e guiei uma equipe de 4 desenvolvedores no design de APIs resilientes.'
        },
        {
          id: 'mock-exp-2',
          company: 'Tech Solutions Inc.',
          role: 'Desenvolvedor Front-end',
          startDate: 'Mar 2020',
          endDate: 'Dez 2021',
          current: false,
          description: 'Desenvolvimento e manutenção de interfaces ricas com foco em performance and acessibilidade. Integração contínua com serviços de nuvem e cobertura abrangente de testes unitários.'
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
}
