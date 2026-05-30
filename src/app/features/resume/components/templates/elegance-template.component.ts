import { Component, input, computed } from '@angular/core';
import { Resume } from '../../../../core/models/resume.model';

@Component({
  selector: 'app-elegance-template',
  template: `
    <div [class]="'cv-elegance cv-spacing-' + (resolvedResume().spacingMode || 'normal')" id="cv-elegance" [style.--cv-primary]="resolvedResume().colorTheme || '#1e293b'" [style.font-family]="resolvedResume().fontFamily || 'Georgia, serif'">
      <!-- Header -->
      <div class="cv-header">
        <div class="header-left">
          @if (resolvedResume().personalInfo.photo) {
            <img [src]="resolvedResume().personalInfo.photo" class="cv-photo" alt="Foto" />
          }
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
            </div>
          </div>
        </div>
      </div>

      <div class="cv-body">
        <!-- Bio -->
        @if (resolvedResume().personalInfo.bio) {
          <div class="cv-section">
            <h2 class="section-title">Sobre mim</h2>
            <div class="section-line"></div>
            <p class="bio-text">{{ resolvedResume().personalInfo.bio }}</p>
          </div>
        }

        <!-- Experience -->
        @if (resolvedResume().experience.length > 0) {
          <div class="cv-section">
            <h2 class="section-title">Experiência</h2>
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
                      {{ exp.startDate }} – {{ exp.current ? 'Atual' : exp.endDate }}
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
            <h2 class="section-title">Educação</h2>
            <div class="section-line"></div>
            <div class="items-list">
              @for (edu of resolvedResume().education; track edu.id) {
                <div class="cv-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">{{ edu.degree }} em {{ edu.field }}</div>
                      <div class="item-subtitle">{{ edu.institution }}</div>
                    </div>
                    <div class="item-period">
                      {{ edu.startDate }} – {{ edu.current ? 'Atual' : edu.endDate }}
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
            <h2 class="section-title">Habilidades</h2>
            <div class="section-line"></div>
            <div class="skills-grid">
              @for (skill of resolvedResume().skills; track skill.id) {
                <div class="skill-item">
                  <div class="skill-name-row">
                    <span class="skill-name">{{ skill.name }}</span>
                    <span class="skill-level-text">{{ getLevelLabel(skill.level) }}</span>
                  </div>
                  <div class="skill-bar">
                    <div class="skill-fill" [style.width.%]="skill.level * 20"></div>
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
    .item-desc { font-size: 12px; color: #475569; line-height: 1.6; }

    .skills-grid { display: flex; flex-direction: column; gap: 10px; }
    .skill-item { display: flex; flex-direction: column; gap: 4px; }
    .skill-name-row { display: flex; justify-content: space-between; }
    .skill-name { font-size: 13px; font-weight: 600; color: #1e293b; font-family: 'Inter', sans-serif; }
    .skill-level-text { font-size: 11px; color: #94a3b8; font-family: 'Inter', sans-serif; }
    .skill-bar { height: 4px; background: #e2e8f0; border-radius: 2px; }
    .skill-fill { height: 100%; background: var(--cv-primary); border-radius: 2px; transition: width 0.5s ease; }

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
          description: 'Desenvolvimento e manutenção de interfaces ricas com foco em performance e acessibilidade. Integração contínua com serviços de nuvem e cobertura abrangente de testes unitários.'
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

  getLevelLabel(level: number): string {
    return ['', 'Básico', 'Básico-Int.', 'Intermediário', 'Avançado', 'Expert'][level];
  }
}
