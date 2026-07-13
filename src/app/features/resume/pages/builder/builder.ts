import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, switchMap, finalize, tap, distinctUntilChanged, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { UpperCasePipe } from '@angular/common';
import { ResumeService } from '../../../../core/services/resume';
import { AiService } from '../../../../core/services/ai';
import { Resume, Experience, Education, Skill, TemplateType, Step, SaveState, EMPTY_RESUME, TEMPLATE_OPTIONS } from '../../../../core/models/resume.model';
import { EleganceTemplateComponent } from '../../components/templates/elegance-template.component';
import { MinimalTemplateComponent } from '../../components/templates/minimal-template.component';
import { ModernTemplateComponent } from '../../components/templates/modern-template.component';
import { CreativeTemplateComponent } from '../../components/templates/creative-template.component';
import { CompactTemplateComponent } from '../../components/templates/compact-template.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-builder',
  imports: [
    FormsModule,
    CdkDropList, CdkDrag, CdkDragHandle,
    EleganceTemplateComponent,
    ModernTemplateComponent,
    MinimalTemplateComponent,
    CreativeTemplateComponent,
    CompactTemplateComponent,
    TranslateModule,
    UpperCasePipe
  ],
  templateUrl: './builder.html',
  styleUrl: './builder.scss',
})
export class BuilderComponent implements OnInit, OnDestroy {
  private resumeService = inject(ResumeService);
  private aiService = inject(AiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  draft = signal<Resume>({
    ...EMPTY_RESUME,
    id: '',
    createdAt: '',
    updatedAt: '',
  });

  resumeTitle: string = '';
  currentStep = signal<Step>('template');
  expandedItem = signal<string | null>(null);
  saveState = signal<SaveState>('idle');
  exporting = signal(false);
  previewScale = signal(0.75);
  activeTab = signal<'edit' | 'preview'>('edit');
  newSkillName = '';
  newSkillLevel: 1 | 2 | 3 | 4 | 5 = 3;
  newLanguageName = '';
  newLanguageLevel: 'Básico' | 'Intermediário' | 'Avançado' | 'Fluente' | 'Nativo' = 'Básico';
  isAILoading = signal<string | null>(null);
  showValidation = signal(false);

  // Cover Letter states
  showCoverLetterModal = signal(false);
  jobDescription = '';
  generatedCoverLetter = signal('');
  isGeneratingCoverLetter = signal(false);

  private saveSubject = new Subject<Resume>();
  private saveSub!: Subscription;
  private savedIndicatorTimeout: any;

  locationSearch$ = new Subject<string>();
  locationSuggestions: any[] = [];
  isLocationLoading = false;
  showLocationDropdown = false;
  private locationSub!: Subscription;

  languageSearch$ = new Subject<string>();
  languageSuggestions: string[] = [];
  isLanguageLoading = false;
  showLanguageDropdown = false;
  private languageSub!: Subscription;

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

    if (d.skills.length >= 5) score += 10;
    else if (d.skills.length > 0) score += 5;

    if (d.languages && d.languages.length >= 2) score += 5;
    else if (d.languages && d.languages.length === 1) score += 2;

    return Math.min(score, 100);
  });

  steps: { id: Step; label: string }[] = [
    { id: 'template', label: 'Template' },
    { id: 'personal', label: 'Pessoal' },
    { id: 'experience', label: 'Experiência' },
    { id: 'education', label: 'Educação' },
    { id: 'skills', label: 'Skills' },
    { id: 'languages', label: 'Idiomas' },
  ];

  skillSuggestions = [
    'JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js',
    'Python', 'SQL', 'Git', 'Docker', 'Figma',
    'Comunicação', 'Liderança', 'Trabalho em equipe',
  ];

  templateOptions = TEMPLATE_OPTIONS;

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

  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/--+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '');
  }

  ngOnInit() {
    this.locationSub = this.locationSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.isLocationLoading = true;
        this.showLocationDropdown = true;
      }),
      switchMap(query => {
        if (!query || query.length < 2) {
          this.isLocationLoading = false;
          this.showLocationDropdown = false;
          return of([]);
        }
        return this.http.get<any[]>(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&addressdetails=1&limit=5`, {
          headers: { 'Accept-Language': 'pt-BR' }
        }).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(results => {
      this.locationSuggestions = results;
      this.isLocationLoading = false;
    });

    this.languageSub = this.languageSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.isLanguageLoading = true;
        this.showLanguageDropdown = true;
      }),
      switchMap(query => {
        if (!query) {
          return this.resumeService.getLanguages('').pipe(catchError(() => of([])));
        }
        return this.resumeService.getLanguages(query).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(results => {
      this.languageSuggestions = results;
      this.isLanguageLoading = false;
    });

    this.saveSub = this.saveSubject.pipe(
      tap(() => this.saveState.set('saving')),
      debounceTime(800),
      switchMap(current =>
        this.resumeService.update(current.id, { ...current, title: this.resumeTitle }).pipe(
          finalize(() => {
            this.saveState.set('saved');
            clearTimeout(this.savedIndicatorTimeout);
            this.savedIndicatorTimeout = setTimeout(() => this.saveState.set('idle'), 2500);
          })
        )
      )
    ).subscribe({
      error: () => {
        this.saveState.set('idle');
        this.toastr.error('Erro ao salvar. Verifique sua conexão.', 'Erro');
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.resumeService.getById(id).subscribe({
        next: (existing) => {
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
              languages: existing.languages || [],
            });
            this.resumeTitle = existing.title;
            this.scrollToSelectedTemplate();

            const slug = this.slugify(existing.title);
            if (id !== slug) {
              this.router.navigate(['/resume', slug, 'edit'], { replaceUrl: true });
            }
          }
        }
      });
      return;
    }

    this.resumeService.create().subscribe({
      next: (created) => {
        this.draft.set({ ...created });
        this.resumeTitle = created.title;
        this.router.navigate(['/resume', this.slugify(created.title), 'edit'], { replaceUrl: true });
      }
    });
  }

  ngOnDestroy() {
    this.saveSub?.unsubscribe();
    this.locationSub?.unsubscribe();
    this.languageSub?.unsubscribe();
    clearTimeout(this.savedIndicatorTimeout);
  }

  onLocationInput(event: any) {
    const value = event.target.value;
    this.draft.update(d => ({
      ...d,
      personalInfo: { ...d.personalInfo, location: value }
    }));
    this.onFieldChange();
    this.locationSearch$.next(value);
  }

  selectLocation(location: any) {
    let formattedName = location.display_name;
    if (location.address) {
      const city = location.address.city || location.address.town || location.address.village;
      const state = location.address.state;
      if (city && state) {
        formattedName = `${city}, ${state}`;
      } else if (location.name) {
        formattedName = location.name;
      }
    }

    this.draft.update(d => ({
      ...d,
      personalInfo: { ...d.personalInfo, location: formattedName }
    }));
    this.showLocationDropdown = false;
    this.onFieldChange();
  }

  hideLocationDropdown() {
    setTimeout(() => this.showLocationDropdown = false, 200);
  }

  onLanguageInput(event: any) {
    const value = event.target.value;
    this.newLanguageName = value;
    this.languageSearch$.next(value);
  }

  selectLanguage(lang: string) {
    this.newLanguageName = lang;
    this.showLanguageDropdown = false;
  }

  hideLanguageDropdown() {
    setTimeout(() => this.showLanguageDropdown = false, 200);
  }

  onFieldChange() {
    this.draft.update(d => ({ ...d }));
    const current = this.draft();
    if (!current.id) return;
    this.saveSubject.next(current);
  }

  saveTitle() {
    this.draft.update(d => ({ ...d, title: this.resumeTitle }));
    this.onFieldChange();
    if (this.resumeTitle.trim()) {
      this.router.navigate(['/resume', this.slugify(this.resumeTitle), 'edit'], { replaceUrl: true });
    }
  }

  goToStep(step: Step) {
    this.currentStep.set(step);
    this.showValidation.set(false);
    if (step === 'template') {
      this.scrollToSelectedTemplate();
    }
  }

  scrollToSelectedTemplate() {
    setTimeout(() => {
      const selectedEl = document.querySelector('.template-option.selected');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 200);
  }

  nextStep() {
    if (this.currentStep() === 'personal') {
      const d = this.draft();
      if (!d.personalInfo.name.trim() || !d.personalInfo.email.trim()) {
        this.showValidation.set(true);
        this.toastr.warning('Preencha os campos obrigatórios antes de avançar.', 'Atenção');
        return;
      }
    }

    this.showValidation.set(false);
    const idx = this.steps.findIndex(s => s.id === this.currentStep());
    if (idx < this.steps.length - 1) {
      this.currentStep.set(this.steps[idx + 1].id);
    }
  }

  prevStep() {
    this.showValidation.set(false);
    const idx = this.steps.findIndex(s => s.id === this.currentStep());
    if (idx > 0) {
      this.currentStep.set(this.steps[idx - 1].id);
    }
  }

  isStepDone(step: Step): boolean {
    const order: Step[] = ['template', 'personal', 'experience', 'education', 'skills', 'languages'];
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

  addLanguage() {
    if (!this.newLanguageName.trim()) return;
    if (this.languageExists(this.newLanguageName)) return;
    const lang = {
      id: crypto.randomUUID(),
      name: this.newLanguageName.trim(),
      level: this.newLanguageLevel,
    };
    this.draft.update(d => ({ ...d, languages: [...(d.languages || []), lang] }));
    this.newLanguageName = '';
    this.onFieldChange();
  }

  removeLanguage(index: number) {
    this.draft.update(d => ({ ...d, languages: d.languages.filter((_, i) => i !== index) }));
    this.onFieldChange();
  }

  setLanguageLevel(index: number, level: 'Básico' | 'Intermediário' | 'Avançado' | 'Fluente' | 'Nativo') {
    this.draft.update(d => {
      const languages = [...d.languages];
      languages[index] = { ...languages[index], level };
      return { ...d, languages };
    });
    this.onFieldChange();
  }

  languageExists(name: string): boolean {
    const langs = this.draft().languages || [];
    return langs.some(l => l.name.toLowerCase() === name.toLowerCase());
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

  selectTemplate(tmpl: any) {
    this.draft.update(d => ({
      ...d,
      template: tmpl.id,
      colorTheme: tmpl.customColor || d.colorTheme,
      fontFamily: tmpl.customFont || d.fontFamily
    }));
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

  dropSkill(event: CdkDragDrop<Skill[]>) {
    this.draft.update(d => {
      const newSkills = [...d.skills];
      moveItemInArray(newSkills, event.previousIndex, event.currentIndex);
      return { ...d, skills: newSkills };
    });
    this.onFieldChange();
  }

  dropLanguage(event: CdkDragDrop<any[]>) {
    this.draft.update(d => {
      const newLanguages = [...(d.languages || [])];
      moveItemInArray(newLanguages, event.previousIndex, event.currentIndex);
      return { ...d, languages: newLanguages };
    });
    this.onFieldChange();
  }

  improveWithAI(type: 'bio' | 'experience', index: number | null, field: string) {
    const key = `${type}-${index !== null ? index : 'all'}-${field}`;
    this.isAILoading.set(key);

    const d = this.draft();

    if (type === 'bio') {
      const bioText = d.personalInfo.bio;
      this.aiService.improveBio(bioText).subscribe({
        next: (improved) => {
          this.draft.update(current => ({
            ...current,
            personalInfo: { ...current.personalInfo, bio: improved }
          }));
          this.isAILoading.set(null);
          this.onFieldChange();
          this.toastr.success('Resumo melhorado com IA!', '✨ IA');
        },
        error: () => {
          this.toastr.error('Erro ao melhorar resumo com IA. Tente novamente.', 'Erro IA');
          this.isAILoading.set(null);
        }
      });
    } else if (type === 'experience' && index !== null) {
      const expItem = d.experience[index];
      const descText = expItem.description;
      this.aiService.improveExperience(descText, expItem.role).subscribe({
        next: (improved) => {
          this.draft.update(current => {
            const exp = [...current.experience];
            exp[index] = { ...exp[index], description: improved };
            return { ...current, experience: exp };
          });
          this.isAILoading.set(null);
          this.onFieldChange();
          this.toastr.success('Experiência melhorada com IA!', '✨ IA');
        },
        error: () => {
          this.toastr.error('Erro ao melhorar experiência com IA. Tente novamente.', 'Erro IA');
          this.isAILoading.set(null);
        }
      });
    }
  }

  importMockData() {
    this.draft.set({
      id: this.draft().id,
      title: 'Currículo Importado',
      createdAt: this.draft().createdAt,
      updatedAt: this.draft().updatedAt,
      template: this.draft().template,
      colorTheme: this.draft().colorTheme,
      fontFamily: this.draft().fontFamily,
      spacingMode: this.draft().spacingMode,
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
      ],
      languages: [
        { id: crypto.randomUUID(), name: 'Português', level: 'Nativo' },
        { id: crypto.randomUUID(), name: 'Inglês', level: 'Avançado' },
        { id: crypto.randomUUID(), name: 'Espanhol', level: 'Intermediário' }
      ]
    });
    this.resumeTitle = 'Currículo Importado';
    this.onFieldChange();
  }

  goBack() {
    const current = this.draft();
    if (current.id) {
      this.resumeService.update(current.id, { ...current, title: this.resumeTitle }).subscribe();
    }
    this.router.navigate(['/dashboard']);
  }

  toggleMobileView() {
    this.activeTab.update(t => {
      const next = t === 'edit' ? 'preview' : 'edit';
      if (next === 'preview') {
        const width = window.innerWidth;
        if (width < 500) {
          this.previewScale.set(0.4);
        } else if (width < 768) {
          this.previewScale.set(0.55);
        } else if (width < 1024) {
          this.previewScale.set(0.7);
        }
      }
      return next;
    });
  }

  async exportPdf() {
    this.exporting.set(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const templateIds = ['cv-elegance', 'cv-modern', 'cv-minimal', 'cv-creative', 'cv-compact'];
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
      this.toastr.success('PDF exportado com sucesso!', 'Download');
    } catch (e) {
      console.error('PDF export error:', e);
      this.toastr.error('Erro ao exportar PDF. Tente novamente.', 'Erro');
    }
    this.exporting.set(false);
  }

  // Roast states
  showRoastModal = signal(false);
  isRoasting = signal(false);
  roastResult = signal<any>(null);

  generateCoverLetter() {
    if (!this.jobDescription || this.jobDescription.length < 20) {
      this.toastr.warning('Por favor, cole uma descrição de vaga com pelo menos 20 caracteres.', 'Atenção');
      return;
    }

    const current = this.draft();
    if (!current.id) return;

    const lang = this.translate.currentLang || 'pt';
    this.aiService.generateCoverLetter(current.id, this.jobDescription, lang).subscribe({
      next: (res) => {
        this.generatedCoverLetter.set(res.result.coverLetter);
        this.isGeneratingCoverLetter.set(false);
      },
      error: () => {
        this.toastr.error('Erro ao gerar carta. O limite gratuito pode ter sido atingido.', 'Erro IA');
        this.isGeneratingCoverLetter.set(false);
      }
    });
  }

  roastResume() {
    const current = this.draft();
    if (!current.id) return;

    this.isRoasting.set(true);
    this.showRoastModal.set(true);
    
    const lang = this.translate.currentLang || 'pt';
    this.aiService.roastResume(current.id, lang).subscribe({
      next: (res) => {
        this.roastResult.set(res);
        this.isRoasting.set(false);
      },
      error: () => {
        this.toastr.error('O recrutador foi tomar um café, tente novamente.', 'Erro IA');
        this.isRoasting.set(false);
        this.showRoastModal.set(false);
      }
    });
  }

  closeRoastModal() {
    this.showRoastModal.set(false);
  }

  copyCoverLetter() {
    navigator.clipboard.writeText(this.generatedCoverLetter());
    this.toastr.success('Carta copiada para a área de transferência!', 'Sucesso');
  }

  closeCoverLetterModal() {
    this.showCoverLetterModal.set(false);
  }
}
