import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ResumeService } from '../../../../core/services/resume';
import { Resume, Experience, Education, Skill, TemplateType, EMPTY_RESUME } from '../../../../core/models/resume.model';
import { EleganceTemplateComponent } from '../../components/templates/elegance-template.component';
import { MinimalTemplateComponent } from '../../components/templates/minimal-template.component';
import { ModernTemplateComponent } from '../../components/templates/modern-template.component';
import { CreativeTemplateComponent } from '../../components/templates/creative-template.component';
import { CompactTemplateComponent } from '../../components/templates/compact-template.component';

type Step = 'personal' | 'experience' | 'education' | 'skills' | 'template';

@Component({
  selector: 'app-builder',
  imports: [
    FormsModule,
    CdkDropList, CdkDrag, CdkDragHandle,
    EleganceTemplateComponent,
    ModernTemplateComponent,
    MinimalTemplateComponent,
    CreativeTemplateComponent,
    CompactTemplateComponent
  ],
  templateUrl: './builder.html',
  styleUrl: './builder.scss',
})
export class BuilderComponent implements OnInit {
  private resumeService = inject(ResumeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  draft = signal<Resume>({
    ...EMPTY_RESUME,
    id: '',
    createdAt: '',
    updatedAt: '',
  });

  resumeTitle: string = '';
  currentStep = signal<Step>('template');
  expandedItem = signal<string | null>(null);
  lastSaved = signal(false);
  exporting = signal(false);
  previewScale = signal(0.75);
  newSkillName = '';
  newSkillLevel: 1 | 2 | 3 | 4 | 5 = 3;
  private saveTimeout: any;
  private savedIndicatorTimeout: any;
  isAILoading = signal<string | null>(null);

  atsScore = computed(() => {
    let score = 0;
    const d = this.draft();

    if (d.personalInfo.email && d.personalInfo.phone) score += 15;
    else if (d.personalInfo.email || d.personalInfo.phone) score += 5;
    if (d.personalInfo.linkedin) score += 5;

    if (d.personalInfo.bio && d.personalInfo.bio.length > 100) score += 20;
    else if (d.personalInfo.bio) score += 10;

    if (d.experience.length > 0) {
      score += 20;
      const hasDescriptions = d.experience.some(e => e.description && e.description.length > 50);
      if (hasDescriptions) score += 10;
    }

    if (d.education.length > 0) score += 15;

    if (d.skills.length >= 5) score += 15;
    else if (d.skills.length > 0) score += 5;

    return Math.min(score, 100);
  });

  steps: { id: Step; label: string }[] = [
    { id: 'template', label: 'Template' },
    { id: 'personal', label: 'Pessoal' },
    { id: 'experience', label: 'Experiência' },
    { id: 'education', label: 'Educação' },
    { id: 'skills', label: 'Skills' },
  ];

  skillSuggestions = [
    'JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js',
    'Python', 'SQL', 'Git', 'Docker', 'Figma',
    'Comunicação', 'Liderança', 'Trabalho em equipe',
  ];

  templateOptions = [
    {
      id: 'elegance' as TemplateType,
      name: 'Elegance',
      desc: 'Clássico e profissional',
      previewBg: 'linear-gradient(135deg, #1e293b, #0f172a)',
      preview: `<div style="background:white;width:50px;height:60px;border-radius:3px;overflow:hidden"><div style="background:#1e293b;height:18px;width:100%"></div><div style="padding:4px;display:flex;flex-direction:column;gap:3px"><div style="height:3px;background:#e2e8f0;border-radius:2px;width:90%"></div><div style="height:3px;background:#e2e8f0;border-radius:2px;width:70%"></div><div style="height:3px;background:#e2e8f0;border-radius:2px;width:80%"></div></div></div>`,
    },
    {
      id: 'modern' as TemplateType,
      name: 'Modern',
      desc: 'Criativo com sidebar',
      previewBg: 'linear-gradient(135deg, #4c1d95, #1e1b4b)',
      preview: `<div style="background:white;width:50px;height:60px;border-radius:3px;overflow:hidden;display:flex"><div style="width:16px;background:linear-gradient(180deg,#6366f1,#7c3aed);flex-shrink:0"></div><div style="flex:1;padding:4px;display:flex;flex-direction:column;gap:3px"><div style="height:3px;background:#e2e8f0;border-radius:2px;width:90%"></div><div style="height:3px;background:#e2e8f0;border-radius:2px;width:70%"></div></div></div>`,
    },
    {
      id: 'minimal' as TemplateType,
      name: 'Minimal',
      desc: 'Ultra limpo e elegante',
      previewBg: 'linear-gradient(135deg, #1f2937, #111827)',
      preview: `<div style="background:white;width:50px;height:60px;border-radius:3px;overflow:hidden;padding:6px;display:flex;flex-direction:column;gap:4px"><div style="height:5px;background:#111827;border-radius:2px;width:70%"></div><div style="height:3px;background:#9ca3af;border-radius:2px;width:50%"></div><div style="height:1px;background:#f3f4f6;margin:2px 0"></div><div style="height:3px;background:#e2e8f0;border-radius:2px;width:90%"></div><div style="height:3px;background:#e2e8f0;border-radius:2px;width:75%"></div></div>`,
    },
    {
      id: 'creative' as TemplateType,
      name: 'Creative',
      desc: 'Moderno e assimétrico',
      previewBg: 'linear-gradient(135deg, #f43f5e, #be123c)',
      preview: `<div style="background:white;width:50px;height:60px;border-radius:3px;overflow:hidden;display:flex;justify-content:space-between"><div style="flex:1;padding:4px;display:flex;flex-direction:column;gap:3px"><div style="height:4px;background:#e11d48;width:70%"></div><div style="height:2px;background:#cbd5e1;width:90%"></div><div style="height:2px;background:#cbd5e1;width:80%"></div></div><div style="width:14px;background:#f8fafc;border-left:1px solid #f1f5f9;display:flex;flex-direction:column;align-items:center;padding-top:4px"><div style="width:8px;height:8px;border-radius:50%;background:#e2e8f0"></div></div></div>`,
    },
    {
      id: 'compact' as TemplateType,
      name: 'Compact',
      desc: 'Preenchimento horizontal',
      previewBg: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
      preview: `<div style="background:white;width:50px;height:60px;border-radius:3px;overflow:hidden;padding:4px;display:flex;flex-direction:column;gap:3px"><div style="display:flex;justify-content:space-between;align-items:center"><div style="height:5px;background:#0f172a;width:50%"></div><div style="height:3px;background:#94a3b8;width:30%"></div></div><div style="height:1px;background:#f1f5f9"></div><div style="display:flex;gap:4px"><div style="flex:1;height:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:2px"></div><div style="flex:1;height:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:2px"></div></div></div>`,
    },
  ];

  colorThemes = [
    { name: 'Slate', value: '#1e293b' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Sky', value: '#0284c7' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Amber', value: '#d97706' },
  ];

  fontFamilies = [
    { name: 'Georgia (Serif)', value: "'Georgia', serif" },
    { name: 'Inter (Sans-serif)', value: "'Inter', sans-serif" },
    { name: 'Outfit (Tech Sans)', value: "'Outfit', sans-serif" },
    { name: 'Playfair Display (Elegant Serif)', value: "'Playfair Display', serif" },
    { name: 'Fira Code (Monospace)', value: "'Fira Code', monospace" },
  ];

  selectColorTheme(color: string) {
    this.draft.update(d => ({ ...d, colorTheme: color }));
    this.onFieldChange();
  }

  selectFontFamily(font: string) {
    this.draft.update(d => ({ ...d, fontFamily: font }));
    this.onFieldChange();
  }

  selectSpacingMode(mode: 'compact' | 'normal' | 'spacious') {
    this.draft.update(d => ({ ...d, spacingMode: mode }));
    this.onFieldChange();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.resumeService.getById(id);
      if (existing) {
        this.draft.set({
          ...EMPTY_RESUME,
          ...existing,
          personalInfo: {
            ...EMPTY_RESUME.personalInfo,
            ...(existing.personalInfo || {}),
          },
          template: existing.template || 'elegance',
          colorTheme: existing.colorTheme || '#1e293b',
          fontFamily: existing.fontFamily || "'Georgia', serif",
          spacingMode: existing.spacingMode || 'normal',
          experience: existing.experience || [],
          education: existing.education || [],
          skills: existing.skills || [],
        });
        this.resumeTitle = existing.title;
        return;
      }
    }
    const created = this.resumeService.create();
    this.draft.set({ ...created });
    this.resumeTitle = created.title;
  }

  onFieldChange() {
    this.draft.update(d => ({ ...d }));
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.autoSave(), 800);
  }

  private autoSave() {
    const current = this.draft();
    if (!current.id) return;
    this.resumeService.update(current.id, { ...current, title: this.resumeTitle });
    this.lastSaved.set(true);
    clearTimeout(this.savedIndicatorTimeout);
    this.savedIndicatorTimeout = setTimeout(() => this.lastSaved.set(false), 2500);
  }

  saveTitle() {
    this.draft.update(d => ({ ...d, title: this.resumeTitle }));
    this.onFieldChange();
  }

  goToStep(step: Step) { this.currentStep.set(step); }

  nextStep() {
    const idx = this.steps.findIndex(s => s.id === this.currentStep());
    if (idx < this.steps.length - 1) {
      this.currentStep.set(this.steps[idx + 1].id);
    }
  }

  prevStep() {
    const idx = this.steps.findIndex(s => s.id === this.currentStep());
    if (idx > 0) {
      this.currentStep.set(this.steps[idx - 1].id);
    }
  }

  isStepDone(step: Step): boolean {
    const order: Step[] = ['template', 'personal', 'experience', 'education', 'skills'];
    return order.indexOf(step) < order.indexOf(this.currentStep());
  }

  toggleExpand(type: string, index: number) {
    const key = `${type}-${index}`;
    this.expandedItem.update(v => v === key ? null : key);
  }

  addExperience() {
    const exp: Experience = {
      id: crypto.randomUUID(), company: '', role: '',
      startDate: '', endDate: '', current: false, description: '',
    };
    this.draft.update(d => ({ ...d, experience: [...d.experience, exp] }));
    this.expandedItem.set(`exp-${this.draft().experience.length - 1}`);
    this.onFieldChange();
  }

  removeExperience(index: number) {
    this.draft.update(d => ({ ...d, experience: d.experience.filter((_, i) => i !== index) }));
    this.onFieldChange();
  }

  addEducation() {
    const edu: Education = {
      id: crypto.randomUUID(), institution: '', degree: '',
      field: '', startDate: '', endDate: '', current: false,
    };
    this.draft.update(d => ({ ...d, education: [...d.education, edu] }));
    this.expandedItem.set(`edu-${this.draft().education.length - 1}`);
    this.onFieldChange();
  }

  removeEducation(index: number) {
    this.draft.update(d => ({ ...d, education: d.education.filter((_, i) => i !== index) }));
    this.onFieldChange();
  }

  addSkill() {
    if (!this.newSkillName.trim()) return;
    if (this.skillExists(this.newSkillName)) return;
    const skill: Skill = {
      id: crypto.randomUUID(),
      name: this.newSkillName.trim(),
      level: this.newSkillLevel,
    };
    this.draft.update(d => ({ ...d, skills: [...d.skills, skill] }));
    this.newSkillName = '';
    this.onFieldChange();
  }

  removeSkill(index: number) {
    this.draft.update(d => ({ ...d, skills: d.skills.filter((_, i) => i !== index) }));
    this.onFieldChange();
  }

  setSkillLevel(index: number, level: number) {
    this.draft.update(d => {
      const skills = [...d.skills];
      skills[index] = { ...skills[index], level: level as 1 | 2 | 3 | 4 | 5 };
      return { ...d, skills };
    });
    this.onFieldChange();
  }

  addSuggestion(name: string) {
    this.newSkillName = name;
    this.addSkill();
  }

  skillExists(name: string): boolean {
    return this.draft().skills.some(s => s.name.toLowerCase() === name.toLowerCase());
  }

  selectTemplate(id: TemplateType) {
    this.draft.update(d => ({ ...d, template: id }));
    this.onFieldChange();
  }

  dropExperience(event: CdkDragDrop<Experience[]>) {
    this.draft.update(d => {
      const newExp = [...d.experience];
      moveItemInArray(newExp, event.previousIndex, event.currentIndex);
      return { ...d, experience: newExp };
    });
    this.onFieldChange();
  }

  dropEducation(event: CdkDragDrop<Education[]>) {
    this.draft.update(d => {
      const newEdu = [...d.education];
      moveItemInArray(newEdu, event.previousIndex, event.currentIndex);
      return { ...d, education: newEdu };
    });
    this.onFieldChange();
  }

  improveWithAI(type: 'bio' | 'experience', index: number | null, field: string) {
    const key = `${type}-${index !== null ? index : 'all'}-${field}`;
    this.isAILoading.set(key);

    setTimeout(() => {
      this.draft.update(d => {
        if (type === 'bio') {
          return {
            ...d,
            personalInfo: {
              ...d.personalInfo,
              bio: d.personalInfo.bio ? d.personalInfo.bio + ' Além disso, foco em gerar impacto real nos negócios através de soluções inovadoras e colaboração em equipes multidisciplinares.' : 'Sou um profissional dedicado, com foco em resultados e capacidade de rápida adaptação. Busco gerar valor através de soluções eficientes e trabalho em equipe.'
            }
          };
        } else if (type === 'experience' && index !== null) {
          const exp = [...d.experience];
          exp[index] = {
            ...exp[index],
            description: exp[index].description ? exp[index].description + '\n• Liderou iniciativas que aumentaram a eficiência em 30%.\n• Mentorou membros juniores da equipe.' : '• Responsável por entregas de alto impacto na área.\n• Otimização de processos que geraram redução de custos e aumento de produtividade.'
          };
          return { ...d, experience: exp };
        }
        return d;
      });
      this.isAILoading.set(null);
      this.onFieldChange();
    }, 1500);
  }

  importMockData() {
    this.draft.set({
      id: this.draft().id,
      title: 'Currículo Importado',
      createdAt: this.draft().createdAt,
      updatedAt: this.draft().updatedAt,
      template: 'modern',
      colorTheme: '#4f46e5',
      fontFamily: "'Inter', sans-serif",
      spacingMode: 'normal',
      personalInfo: {
        name: 'Alexandre Magno',
        jobTitle: 'Engenheiro de Software Senior',
        email: 'alex.magno@email.com',
        phone: '+55 11 98765-4321',
        location: 'São Paulo, SP - Híbrido',
        linkedin: 'linkedin.com/in/alexmagno',
        bio: 'Engenheiro de software apaixonado por criar arquiteturas escaláveis e produtos com excelente experiência de usuário. Com mais de 8 anos na área de tecnologia, possuo sólida experiência na liderança técnica de esquadrões ágeis e na transição de sistemas monolíticos para microsserviços na nuvem.'
      },
      experience: [
        {
          id: crypto.randomUUID(),
          role: 'Tech Lead / Staff Engineer',
          company: 'Fintech Solutions S.A.',
          startDate: 'Jan 2021',
          endDate: '',
          current: true,
          description: '• Liderança de uma tribo com 4 squads e mais de 20 desenvolvedores, focada no core bancário.\n• Arquitetura e migração do monolito legado para microsserviços Node.js e Go, melhorando o tempo de resposta em 45%.\n• Implementação de cultura DevOps e CI/CD com GitHub Actions, reduzindo o time-to-market.'
        },
        {
          id: crypto.randomUUID(),
          role: 'Desenvolvedor Full Stack Sênior',
          company: 'E-commerce Varejo Global',
          startDate: 'Fev 2018',
          endDate: 'Dez 2020',
          current: false,
          description: '• Desenvolvimento do novo checkout da plataforma utilizando React e Node.js.\n• Otimização de performance no frontend que aumentou a conversão de vendas em 12%.\n• Mentoria de desenvolvedores juniores e plenos.'
        }
      ],
      education: [
        {
          id: crypto.randomUUID(),
          degree: 'Pós-graduação em Arquitetura de Software',
          field: 'Tecnologia da Informação',
          institution: 'Universidade Tecnológica',
          startDate: '2019',
          endDate: '2020',
          current: false
        },
        {
          id: crypto.randomUUID(),
          degree: 'Bacharelado em Ciência da Computação',
          field: 'Computação',
          institution: 'Universidade Federal',
          startDate: '2013',
          endDate: '2017',
          current: false
        }
      ],
      skills: [
        { id: crypto.randomUUID(), name: 'TypeScript', level: 5 },
        { id: crypto.randomUUID(), name: 'Node.js', level: 5 },
        { id: crypto.randomUUID(), name: 'Angular', level: 4 },
        { id: crypto.randomUUID(), name: 'AWS Cloud', level: 4 },
        { id: crypto.randomUUID(), name: 'Liderança', level: 5 }
      ]
    });
    this.resumeTitle = 'Currículo Importado';
    this.onFieldChange();
  }

  goBack() {
    this.autoSave();
    this.router.navigate(['/dashboard']);
  }

  async exportPdf() {
    this.exporting.set(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const templateIds = ['cv-elegance', 'cv-modern', 'cv-minimal'];
      let el: HTMLElement | null = null;
      for (const id of templateIds) {
        el = document.getElementById(id);
        if (el) break;
      }

      if (!el) { this.exporting.set(false); return; }

      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${this.resumeTitle || 'curriculo'}.pdf`);
    } catch (e) {
      console.error('PDF export error:', e);
    }
    this.exporting.set(false);
  }
}
