import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
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

  resumeTitle = '';
  currentStep = signal<Step>('personal');
  expandedItem = signal<string | null>(null);
  lastSaved = signal(false);
  exporting = signal(false);
  previewScale = signal(0.75);
  newSkillName = '';
  newSkillLevel: 1 | 2 | 3 | 4 | 5 = 3;
  private saveTimeout: any;
  private savedIndicatorTimeout: any;

  steps: { id: Step; label: string }[] = [
    { id: 'personal', label: 'Pessoal' },
    { id: 'experience', label: 'Experiência' },
    { id: 'education', label: 'Educação' },
    { id: 'skills', label: 'Skills' },
    { id: 'template', label: 'Template' },
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
    // New resume
    const created = this.resumeService.create();
    this.draft.set({ ...created });
    this.resumeTitle = created.title;
  }

  onFieldChange() {
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
    const order: Step[] = ['personal', 'experience', 'education', 'skills', 'template'];
    return order.indexOf(step) < order.indexOf(this.currentStep());
  }

  toggleExpand(type: string, index: number) {
    const key = `${type}-${index}`;
    this.expandedItem.update(v => v === key ? null : key);
  }

  // Experience
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

  // Education
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

  // Skills
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
