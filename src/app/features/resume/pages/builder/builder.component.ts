import { Component, inject, signal, computed, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Subject, Subscription, Observable, of } from 'rxjs';
import { debounceTime, switchMap, finalize, tap, distinctUntilChanged, catchError } from 'rxjs/operators';
import { CanComponentDeactivate } from '../../../../core/guards/can-deactivate.guard';
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
import { ElegancePhotoTemplateComponent } from '../../components/templates/elegance-photo-template.component';
import { CreativePhotoTemplateComponent } from '../../components/templates/creative-photo-template.component';
import { environment } from '../../../../../environments/environment';
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
    ElegancePhotoTemplateComponent,
    CreativePhotoTemplateComponent,
    TranslateModule,
    UpperCasePipe
  ],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderComponent implements OnInit, OnDestroy, CanComponentDeactivate {
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
  newSkillName: string = '';
  newSkillLevel: 1 | 2 | 3 | 4 | 5 = 3;
  newLanguageName: string = '';
  newLanguageLevel: 'Básico' | 'Intermediário' | 'Avançado' | 'Fluente' | 'Nativo' = 'Básico';
  isAILoading = signal<string | null>(null);
  showValidation = signal(false);
  showAtsInfoModal = signal(false);
  isSaving = signal(false);

  environment = environment;
  showLeaveModal = signal(false);
  private leaveSubject = new Subject<boolean>();
  isPublishedLocally: boolean = false;
  isNavigatingInternally: boolean = false;

  get currentLang(): string {
    return this.translate.currentLang || 'pt';
  }

  showCoverLetterModal = signal(false);
  jobDescription: string = '';
  generatedCoverLetter = signal('');
  isGeneratingCoverLetter = signal(false);

  private saveSubject = new Subject<Resume>();
  private saveSub!: Subscription;
  private savedIndicatorTimeout: any;

  locationSearch$ = new Subject<string>();
  locationSuggestions: { display_name: string; name?: string; place_id?: string; address?: any }[] = [];
  isLocationLoading: boolean = false;
  showLocationDropdown: boolean = false;
  private locationSub!: Subscription;

  languageSearch$ = new Subject<string>();
  languageSuggestions: string[] = [];
  isLanguageLoading: boolean = false;
  showLanguageDropdown: boolean = false;
  private languageSub!: Subscription;

  layoutDensity = signal<'compact' | 'normal' | 'spacious'>('normal');

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
    { id: 'finish', label: 'Finalizar' },
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

  selectColorTheme(color: string): void {
    this.draft.update(d => ({ ...d, colorTheme: color }));
    this.onFieldChange();
  }

  selectFontFamily(font: string): void {
    this.draft.update(d => ({ ...d, fontFamily: font }));
    this.onFieldChange();
  }

  selectSpacingMode(mode: 'compact' | 'normal' | 'spacious'): void {
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

  ngOnInit(): void {
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
        this.toastr.error(this.currentLang === 'en' ? 'Error saving. Check your connection.' : 'Erro ao salvar. Verifique sua conexão.', this.currentLang === 'en' ? 'Error' : 'Erro');
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const cached = this.resumeService.getCurrent() || this.resumeService.getAll().find(r => r.id === id || this.slugify(r.title) === id);
      if (cached) {
        this.draft.set({
          ...EMPTY_RESUME,
          ...cached,
          personalInfo: {
            ...EMPTY_RESUME.personalInfo,
            ...(cached.personalInfo || {}),
          },
          template: cached.template || 'elegance',
          colorTheme: cached.colorTheme || '#1e293b',
          fontFamily: cached.fontFamily || "'Georgia', serif",
          spacingMode: cached.spacingMode || 'normal',
          experience: cached.experience || [],
          education: cached.education || [],
          skills: cached.skills || [],
          languages: cached.languages || [],
        });
        this.resumeTitle = cached.title;
      }

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
              this.isNavigatingInternally = true;
              this.router.navigate(['/resume', slug, 'edit'], { replaceUrl: true }).then(() => {
                this.isNavigatingInternally = false;
              });
            }
          }
        }
      });
      return;
    }

    const tplParam = this.route.snapshot.queryParamMap.get('template') as TemplateType;
    const translatedTitle = this.translate.instant('BUILDER.DEFAULT_RESUME_TITLE');

    this.resumeService.create({ title: translatedTitle }).subscribe({
      next: (created) => {
        if (tplParam && ['elegance', 'modern', 'minimal', 'creative', 'compact'].includes(tplParam)) {
          created.template = tplParam;
        }
        this.draft.set({ ...created });
        if (tplParam) {
          this.onFieldChange();
        }
        this.resumeTitle = created.title;
        this.isNavigatingInternally = true;
        this.router.navigate(['/resume', this.slugify(created.title), 'edit'], { replaceUrl: true }).then(() => {
          this.isNavigatingInternally = false;
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.saveSub?.unsubscribe();
    this.locationSub?.unsubscribe();
    this.languageSub?.unsubscribe();
    clearTimeout(this.savedIndicatorTimeout);
  }

  onLocationInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.draft.update(d => ({
      ...d,
      personalInfo: { ...d.personalInfo, location: value }
    }));
    this.onFieldChange();
    this.locationSearch$.next(value);
  }

  selectLocation(location: { display_name: string; name?: string; address?: { city?: string; town?: string; village?: string; state?: string } }): void {
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

  hideLocationDropdown(): void {
    setTimeout(() => this.showLocationDropdown = false, 200);
  }

  onLanguageInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.newLanguageName = value;
    this.languageSearch$.next(value);
  }

  selectLanguage(lang: string): void {
    this.newLanguageName = lang;
    this.showLanguageDropdown = false;
  }

  hideLanguageDropdown(): void {
    setTimeout(() => this.showLanguageDropdown = false, 200);
  }

  onFieldChange(): void {
    this.draft.update(d => ({ ...d }));
    const current = this.draft();
    if (!current.id) return;
    this.saveSubject.next(current);
  }

  saveTitle(): void {
    this.draft.update(d => ({ ...d, title: this.resumeTitle }));
    const current = this.draft();
    if (current.id && this.resumeTitle.trim()) {
      this.saveState.set('saving');
      this.resumeService.update(current.id, { ...current, title: this.resumeTitle }).subscribe({
        next: () => {
          this.saveState.set('saved');
          clearTimeout(this.savedIndicatorTimeout);
          this.savedIndicatorTimeout = setTimeout(() => this.saveState.set('idle'), 2500);
          this.isNavigatingInternally = true;
          this.router.navigate(['/resume', this.slugify(this.resumeTitle), 'edit'], { replaceUrl: true }).then(() => {
            this.isNavigatingInternally = false;
          });
        },
        error: () => {
          this.saveState.set('idle');
          this.toastr.error(this.currentLang === 'en' ? 'Error saving title' : 'Erro ao salvar título', this.currentLang === 'en' ? 'Error' : 'Erro');
        }
      });
    }
  }

  cleanupEmptyEntries(): void {
    this.draft.update(d => {
      const experience = d.experience.filter(e => e.role.trim() || e.company.trim() || e.description.trim());
      const education = d.education.filter(e => e.institution.trim() || e.degree.trim());
      return { ...d, experience, education };
    });
  }

  private hasIncompleteExperience(): boolean {
    return this.draft().experience.some(e => !e.role.trim() || !e.company.trim());
  }

  private hasIncompleteEducation(): boolean {
    return this.draft().education.some(e => !e.institution.trim() || !e.degree.trim());
  }

  private scrollToFirstIncompleteExp(): void {
    const idx = this.draft().experience.findIndex(e => !e.role.trim() || !e.company.trim());
    if (idx >= 0) {
      this.expandedItem.set(`exp-${idx}`);
      setTimeout(() => {
        const el = document.querySelector(`[data-exp-index="${idx}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  private scrollToFirstIncompleteEdu(): void {
    const idx = this.draft().education.findIndex(e => !e.institution.trim() || !e.degree.trim());
    if (idx >= 0) {
      this.expandedItem.set(`edu-${idx}`);
      setTimeout(() => {
        const el = document.querySelector(`[data-edu-index="${idx}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  goToStep(step: Step): void {
    const cur = this.currentStep();
    if (cur === 'experience' && this.hasIncompleteExperience()) {
      this.toastr.warning(
        this.currentLang === 'en' ? 'Please fill in or remove incomplete experiences before continuing.' : 'Preencha ou remova as experiências incompletas antes de continuar.',
        this.currentLang === 'en' ? 'Attention' : 'Atenção'
      );
      this.scrollToFirstIncompleteExp();
      return;
    }
    if (cur === 'education' && this.hasIncompleteEducation()) {
      this.toastr.warning(
        this.currentLang === 'en' ? 'Please fill in or remove incomplete education entries before continuing.' : 'Preencha ou remova as educações incompletas antes de continuar.',
        this.currentLang === 'en' ? 'Attention' : 'Atenção'
      );
      this.scrollToFirstIncompleteEdu();
      return;
    }
    this.cleanupEmptyEntries();
    this.currentStep.set(step);
    this.showValidation.set(false);
    if (step === 'template') {
      this.scrollToSelectedTemplate();
    }
  }

  scrollToSelectedTemplate(): void {
    setTimeout(() => {
      const selectedEl = document.querySelector('.template-option.selected');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 200);
  }

  nextStep(): void {
    const cur = this.currentStep();

    if (cur === 'experience' && this.hasIncompleteExperience()) {
      this.toastr.warning(
        this.currentLang === 'en' ? 'Please fill in or remove incomplete experiences before continuing.' : 'Preencha ou remova as experiências incompletas antes de continuar.',
        this.currentLang === 'en' ? 'Attention' : 'Atenção'
      );
      this.scrollToFirstIncompleteExp();
      return;
    }
    if (cur === 'education' && this.hasIncompleteEducation()) {
      this.toastr.warning(
        this.currentLang === 'en' ? 'Please fill in or remove incomplete education entries before continuing.' : 'Preencha ou remova as educações incompletas antes de continuar.',
        this.currentLang === 'en' ? 'Attention' : 'Atenção'
      );
      this.scrollToFirstIncompleteEdu();
      return;
    }

    this.cleanupEmptyEntries();
    if (cur === 'personal') {
      const d = this.draft();
      if (!d.personalInfo.name.trim() || !d.personalInfo.email.trim()) {
        this.showValidation.set(true);
        this.toastr.warning(this.currentLang === 'en' ? 'Please fill out all required fields before proceeding.' : 'Preencha os campos obrigatórios antes de avançar.', this.currentLang === 'en' ? 'Attention' : 'Atenção');
        return;
      }
    }

    this.showValidation.set(false);
    const idx = this.steps.findIndex(s => s.id === this.currentStep());
    if (idx < this.steps.length - 1) {
      this.currentStep.set(this.steps[idx + 1].id);
    }
  }

  prevStep(): void {
    this.cleanupEmptyEntries();
    this.showValidation.set(false);
    const idx = this.steps.findIndex(s => s.id === this.currentStep());
    if (idx > 0) {
      this.currentStep.set(this.steps[idx - 1].id);
    }
  }

  isStepDone(step: Step): boolean {
    const order: Step[] = ['template', 'personal', 'experience', 'education', 'skills', 'languages', 'finish'];
    return order.indexOf(step) < order.indexOf(this.currentStep());
  }

  toggleExpand(type: string, index: number): void {
    const key = `${type}-${index}`;
    this.expandedItem.update(v => v === key ? null : key);
  }

  addExperience(): void {
    // Block if there's already an incomplete experience open
    if (this.hasIncompleteExperience()) {
      this.toastr.warning(
        this.currentLang === 'en'
          ? 'Please fill in the current experience (Role and Company are required) or remove it before adding another.'
          : 'Preencha a experiência atual (Cargo e Empresa são obrigatórios) ou remova-a antes de adicionar outra.',
        this.currentLang === 'en' ? 'Incomplete Entry' : 'Entrada Incompleta'
      );
      this.scrollToFirstIncompleteExp();
      return;
    }
    const exp: Experience = {
      id: crypto.randomUUID(), company: '', role: '',
      startDate: '', endDate: '', current: false, description: '',
    };
    this.draft.update(d => ({ ...d, experience: [...d.experience, exp] }));
    this.expandedItem.set(`exp-${this.draft().experience.length - 1}`);
    this.onFieldChange();
  }

  removeExperience(index: number): void {
    this.draft.update(d => ({ ...d, experience: d.experience.filter((_, i) => i !== index) }));
    this.onFieldChange();
  }

  addEducation(): void {
    // Block if there's already an incomplete education entry open
    if (this.hasIncompleteEducation()) {
      this.toastr.warning(
        this.currentLang === 'en'
          ? 'Please fill in the current education (Degree and Institution are required) or remove it before adding another.'
          : 'Preencha a educação atual (Curso e Instituição são obrigatórios) ou remova-a antes de adicionar outra.',
        this.currentLang === 'en' ? 'Incomplete Entry' : 'Entrada Incompleta'
      );
      this.scrollToFirstIncompleteEdu();
      return;
    }
    const edu: Education = {
      id: crypto.randomUUID(), institution: '', degree: '',
      field: '', startDate: '', endDate: '', current: false,
    };
    this.draft.update(d => ({ ...d, education: [...d.education, edu] }));
    this.expandedItem.set(`edu-${this.draft().education.length - 1}`);
    this.onFieldChange();
  }

  removeEducation(index: number): void {
    this.draft.update(d => ({ ...d, education: d.education.filter((_, i) => i !== index) }));
    this.onFieldChange();
  }

  addSkill(): void {
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

  removeSkill(index: number): void {
    this.draft.update(d => ({ ...d, skills: d.skills.filter((_, i) => i !== index) }));
    this.onFieldChange();
  }

  addLanguage(): void {
    const name = this.newLanguageName.trim();
    if (!name) return;
    if (this.languageExists(name)) {
      this.toastr.warning(this.currentLang === 'en' ? 'This language has already been added.' : 'Este idioma já foi adicionado.', this.currentLang === 'en' ? 'Warning' : 'Aviso');
      return;
    }
    const lang = {
      id: crypto.randomUUID(),
      name: name,
      level: this.newLanguageLevel,
    };
    this.draft.update(d => ({ ...d, languages: [...(d.languages || []), lang] }));
    this.newLanguageName = '';
    this.onFieldChange();
  }

  removeLanguage(index: number): void {
    this.draft.update(d => ({ ...d, languages: d.languages.filter((_, i) => i !== index) }));
    this.onFieldChange();
  }

  setLanguageLevel(index: number, level: 'Básico' | 'Intermediário' | 'Avançado' | 'Fluente' | 'Nativo'): void {
    this.draft.update(d => {
      const languages = [...d.languages];
      languages[index] = { ...languages[index], level };
      return { ...d, languages };
    });
    this.onFieldChange();
  }

  languageExists(name: string): boolean {
    const normalize = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedTarget = normalize(name);
    const langs = this.draft().languages || [];
    return langs.some(l => normalize(l.name) === normalizedTarget);
  }

  getTranslatedLanguageLevel(level: string): string {
    const map: Record<string, string> = {
      'Básico': 'BUILDER.LANGUAGES.LEVELS.BASIC',
      'Intermediário': 'BUILDER.LANGUAGES.LEVELS.INTERMEDIATE',
      'Avançado': 'BUILDER.LANGUAGES.LEVELS.ADVANCED',
      'Fluente': 'BUILDER.LANGUAGES.LEVELS.FLUENT',
      'Nativo': 'BUILDER.LANGUAGES.LEVELS.NATIVE'
    };
    return this.translate.instant(map[level] || map['Básico']);
  }

  setSkillLevel(index: number, level: number): void {
    this.draft.update(d => {
      const skills = [...d.skills];
      skills[index] = { ...skills[index], level: level as 1 | 2 | 3 | 4 | 5 };
      return { ...d, skills };
    });
    this.onFieldChange();
  }

  addSuggestion(name: string): void {
    this.newSkillName = name;
    this.addSkill();
  }

  skillExists(name: string): boolean {
    return this.draft().skills.some(s => s.name.toLowerCase() === name.toLowerCase());
  }

  isDefaultTitle(title: string): boolean {
    if (!title || !title.trim()) return true;

    const defaults = [
      'Meu Currículo', 'My Resume',
      'Currículo Importado', 'Imported Resume',
    ];

    if (title.startsWith('Currículo LinkedIn') || title.startsWith('Resume LinkedIn')) {
      return true;
    }

    for (const opt of this.templateOptions) {
      defaults.push(opt.name);
      defaults.push(opt.ptName);
    }

    return defaults.some(d => title.toLowerCase().trim() === d.toLowerCase().trim());
  }

  selectTemplate(tmpl: { id: string, name?: string, ptName?: string, customColor?: string, customFont?: string }): void {
    this.draft.update(d => ({
      ...d,
      template: tmpl.id as TemplateType,
      colorTheme: tmpl.customColor || d.colorTheme || '#1e293b',
      fontFamily: tmpl.customFont || d.fontFamily || "'Inter', sans-serif"
    }));

    const isEn = this.translate.currentLang === 'en';

    if (this.isDefaultTitle(this.resumeTitle)) {
      const newTitle = isEn && tmpl.name ? tmpl.name : tmpl.ptName;
      this.resumeTitle = newTitle || '';
      this.draft.update(d => ({ ...d, title: newTitle || '' }));
      this.saveTitle();
    } else {
      this.onFieldChange();
    }
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
    if (this.isAILoading()) return;
    this.isAILoading.set(key);

    const d = this.draft();

    if (type === 'bio') {
      const bioText = d.personalInfo.bio;
      this.aiService.improveBio(bioText, this.translate.currentLang).subscribe({
        next: (improved) => {
          const cleanedText = (improved || '').trim();
          this.draft.update(current => ({
            ...current,
            personalInfo: { ...current.personalInfo, bio: cleanedText }
          }));
          this.isAILoading.set(null);
          this.onFieldChange();
          this.toastr.success(this.currentLang === 'en' ? 'Summary improved with AI!' : 'Resumo melhorado com IA!', '✨ AI');
        },
        error: (err: any) => {
          const backendMsg = err?.error?.error || err?.error?.message || err?.message;
          const errorMsg = backendMsg ? `Erro: ${backendMsg}` : (this.currentLang === 'en' ? 'Error improving summary with AI. Try again.' : 'Erro ao melhorar resumo com IA. Tente novamente.');
          this.toastr.error(errorMsg, this.currentLang === 'en' ? 'AI Error' : 'Erro IA');
          this.isAILoading.set(null);
        }
      });
    } else if (type === 'experience' && index !== null) {
      const expItem = d.experience[index];
      const descText = expItem.description;
      this.aiService.improveExperience(descText, expItem.role, this.translate.currentLang).subscribe({
        next: (improved) => {
          const cleanedText = (improved || '').trim();
          this.draft.update(current => {
            const exp = [...current.experience];
            exp[index] = { ...exp[index], description: cleanedText };
            return { ...current, experience: exp };
          });
          this.isAILoading.set(null);
          this.onFieldChange();
          this.toastr.success(this.currentLang === 'en' ? 'Experience improved with AI!' : 'Experiência melhorada com IA!', '✨ AI');
        },
        error: (err: any) => {
          const backendMsg = err?.error?.error || err?.error?.message || err?.message;
          const errorMsg = backendMsg ? `Erro: ${backendMsg}` : (this.currentLang === 'en' ? 'Error improving experience with AI. Try again.' : 'Erro ao melhorar experiência com IA. Tente novamente.');
          this.toastr.error(errorMsg, this.currentLang === 'en' ? 'AI Error' : 'Erro IA');
          this.isAILoading.set(null);
        }
      });
    }
  }

  importMockData() {
    const isEn = this.translate.currentLang === 'en';
    const title = this.translate.instant('BUILDER.IMPORTED_RESUME_TITLE');

    this.draft.set({
      id: this.draft().id,
      title: title,
      createdAt: this.draft().createdAt,
      updatedAt: this.draft().updatedAt,
      template: this.draft().template,
      colorTheme: this.draft().colorTheme,
      fontFamily: this.draft().fontFamily,
      spacingMode: this.draft().spacingMode,
      personalInfo: {
        name: 'Alexandre Magno',
        jobTitle: isEn ? 'Senior Software Engineer' : 'Engenheiro de Software Senior',
        email: 'alex.magno@email.com',
        phone: '+55 11 98765-4321',
        location: isEn ? 'São Paulo, SP - Hybrid' : 'São Paulo, SP - Híbrido',
        linkedin: 'linkedin.com/in/alexmagno',
        bio: isEn
          ? 'Software engineer passionate about building scalable architectures and products with excellent user experience. With over 8 years in tech, I have solid experience technically leading agile squads and transitioning monolithic systems to cloud microservices.'
          : 'Engenheiro de software apaixonado por criar arquiteturas escaláveis e produtos com excelente experiência de usuário. Com mais de 8 anos na área de tecnologia, possuo sólida experiência na liderança técnica de esquadrões ágeis e na transição de sistemas monolíticos para microsserviços na nuvem.'
      },
      experience: [
        {
          id: crypto.randomUUID(),
          role: 'Tech Lead / Staff Engineer',
          company: 'Fintech Solutions S.A.',
          startDate: isEn ? 'Jan 2021' : 'Jan 2021',
          endDate: '',
          current: true,
          description: isEn
            ? '• Led a tribe with 4 squads and over 20 developers, focused on core banking.\n• Architected and migrated legacy monolith to Node.js and Go microservices, improving response time by 45%.\n• Implemented DevOps culture and CI/CD with GitHub Actions, reducing time-to-market.'
            : '• Liderança de uma tribo com 4 squads e mais de 20 desenvolvedores, focada no core bancário.\n• Arquitetura e migração do monolito legado para microsserviços Node.js e Go, melhorando o tempo de resposta em 45%.\n• Implementação de cultura DevOps e CI/CD com GitHub Actions, reduzindo o time-to-market.'
        },
        {
          id: crypto.randomUUID(),
          role: isEn ? 'Senior Full Stack Developer' : 'Desenvolvedor Full Stack Sênior',
          company: isEn ? 'Global Retail E-commerce' : 'E-commerce Varejo Global',
          startDate: isEn ? 'Feb 2018' : 'Fev 2018',
          endDate: isEn ? 'Dec 2020' : 'Dez 2020',
          current: false,
          description: isEn
            ? '• Developed the new platform checkout using React and Node.js.\n• Frontend performance optimization that increased sales conversion by 12%.\n• Mentored junior and mid-level developers.'
            : '• Desenvolvimento do novo checkout da plataforma utilizando React e Node.js.\n• Otimização de performance no frontend que aumentou a conversão de vendas em 12%.\n• Mentoria de desenvolvedores juniores e plenos.'
        }
      ],
      education: [
        {
          id: crypto.randomUUID(),
          degree: isEn ? 'Postgraduate in Software Architecture' : 'Pós-graduação em Arquitetura de Software',
          field: isEn ? 'Information Technology' : 'Tecnologia da Informação',
          institution: isEn ? 'Technological University' : 'Universidade Tecnológica',
          startDate: '2019',
          endDate: '2020',
          current: false
        },
        {
          id: crypto.randomUUID(),
          degree: isEn ? 'Bachelor of Computer Science' : 'Bacharelado em Ciência da Computação',
          field: isEn ? 'Computing' : 'Computação',
          institution: isEn ? 'Federal University' : 'Universidade Federal',
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
        { id: crypto.randomUUID(), name: isEn ? 'Leadership' : 'Liderança', level: 5 }
      ],
      languages: [
        { id: crypto.randomUUID(), name: isEn ? 'Portuguese' : 'Português', level: 'Nativo' },
        { id: crypto.randomUUID(), name: isEn ? 'English' : 'Inglês', level: 'Avançado' },
        { id: crypto.randomUUID(), name: isEn ? 'Spanish' : 'Espanhol', level: 'Intermediário' }
      ]
    });
    this.resumeTitle = title;
    this.saveTitle();
  }

  goBack() {
    const current = this.draft();
    if (current.id) {
      this.resumeService.update(current.id, { ...current, title: this.resumeTitle }).subscribe();
    }
    this.router.navigate(['/dashboard']);
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 2 * 1024 * 1024) {
        this.toastr.warning(this.currentLang === 'en' ? 'Image must be less than 2MB' : 'A imagem deve ter no máximo 2MB', this.currentLang === 'en' ? 'Warning' : 'Aviso');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        const base64 = e.target?.result as string;
        this.draft.update(d => ({
          ...d,
          personalInfo: {
            ...d.personalInfo,
            photo: base64 || ''
          }
        }));
        this.onFieldChange();
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.draft.update(d => ({
      ...d,
      personalInfo: {
        ...d.personalInfo,
        photo: ''
      }
    }));
    this.onFieldChange();
  }

  finishAndSave(): void {
    const current = this.draft();
    if (!current.id) return;

    this.isSaving.set(true);
    this.resumeService.update(current.id, { ...current, title: this.resumeTitle }).pipe(
      switchMap(() => this.resumeService.publish(current.id))
    ).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isPublishedLocally = true;
        this.toastr.success(
          this.translate.instant('BUILDER.FINISH.SAVE_SUCCESS_MSG'),
          this.translate.instant('BUILDER.FINISH.SAVE_SUCCESS_TITLE')
        );
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isSaving.set(false);
        this.toastr.error(this.currentLang === 'en' ? 'Error saving resume. Try again.' : 'Erro ao salvar currículo. Tente novamente.', this.currentLang === 'en' ? 'Error' : 'Erro');
      }
    });
  }

  canDeactivate(): Observable<boolean> {
    if (this.isPublishedLocally || this.isNavigatingInternally) return of(true);
    this.showLeaveModal.set(true);
    return this.leaveSubject.asObservable();
  }

  confirmLeave(): void {
    this.showLeaveModal.set(false);
    this.leaveSubject.next(true);
  }

  cancelLeave(): void {
    this.showLeaveModal.set(false);
    this.leaveSubject.next(false);
  }

  toggleMobileView(): void {
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

  showRoastModal = signal(false);
  isRoasting = signal(false);
  roastResult = signal<{ roast?: string; score?: number; feedback?: string; weaknesses?: string[]; actionableFeedback?: string[]; strengths?: string[] }>({});

  generateCoverLetter(): void {
    if (!this.jobDescription || this.jobDescription.length < 20) {
      this.toastr.warning(this.currentLang === 'en' ? 'Please paste a job description with at least 20 characters.' : 'Por favor, cole uma descrição de vaga com pelo menos 20 caracteres.', this.currentLang === 'en' ? 'Attention' : 'Atenção');
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
        this.toastr.error(this.currentLang === 'en' ? 'Error generating letter. Free limit may be reached.' : 'Erro ao gerar carta. O limite gratuito pode ter sido atingido.', this.currentLang === 'en' ? 'AI Error' : 'Erro IA');
        this.isGeneratingCoverLetter.set(false);
      }
    });
  }

  roastResume(): void {
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
        this.toastr.error(this.currentLang === 'en' ? 'The recruiter went for coffee, try again.' : 'O recrutador foi tomar um café, tente novamente.', this.currentLang === 'en' ? 'AI Error' : 'Erro IA');
        this.isRoasting.set(false);
        this.showRoastModal.set(false);
      }
    });
  }

  closeRoastModal(): void {
    this.showRoastModal.set(false);
  }

  copyCoverLetter(): void {
    navigator.clipboard.writeText(this.generatedCoverLetter());
    this.toastr.success(this.currentLang === 'en' ? 'Letter copied to clipboard!' : 'Carta copiada para a área de transferência!', this.currentLang === 'en' ? 'Success' : 'Sucesso');
  }

  closeCoverLetterModal(): void {
    this.showCoverLetterModal.set(false);
  }

  isExportingPdf = signal(false);

  async exportToPDF(): Promise<void> {
    this.isExportingPdf.set(true);

    const originalElement = document.querySelector('.preview-sheet') as HTMLElement;
    if (!originalElement) {
      this.isExportingPdf.set(false);
      return;
    }

    const clone = originalElement.cloneNode(true) as HTMLElement;
    Object.assign(clone.style, {
      transform: 'none',
      position: 'relative',
      width: '794px',
      height: 'fit-content',
      minHeight: 'auto',
      paddingBottom: '0',
      marginBottom: '0',
      overflow: 'hidden'
    });

    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '-9999px';
    wrapper.style.width = '794px';
    wrapper.style.height = 'fit-content';
    Object.assign(wrapper.style, { margin: '0', padding: '0' });
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      const html2pdf = (await import('html2pdf.js')).default || (await import('html2pdf.js'));
      await new Promise(resolve => setTimeout(resolve, 150));

      // Apenas 10mm no rodapé para respiração antes da quebra de página.
      const MARGIN_BOT_PX = Math.round(10 * 3.7795); // 10mm rodapé em px
      const A4_FULL_PX = 1123;
      const A4_USABLE_PX = A4_FULL_PX - MARGIN_BOT_PX; // ~1085px

      const contentHeight = clone.scrollHeight;
      const overflowRatio = contentHeight / A4_USABLE_PX;

      if (overflowRatio > 1 && overflowRatio <= 1.15) {
        const fitZoom = (A4_USABLE_PX / contentHeight) * 0.98;
        clone.style.zoom = `${fitZoom}`;
      }

      const opt = {
        margin: [0, 0, 10, 0] as [number, number, number, number], // 0 topo (sem faixa branca), 10mm rodapé
        filename: `${this.draft().title || 'Curriculo'}.pdf`,
        image: { type: 'jpeg' as const, quality: 1 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false, scrollY: 0 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: [
            'li', '.bullet-item', '.cv-item', '.timeline-item', '.skill-item',
            '.exp-item', '.edu-item', '.contact-row', '.contact-item',
            '.sidebar-section', '.sidebar-box', '.language-item', '.skill-pill'
          ]
        }
      };

      await html2pdf().set(opt).from(clone).save();

      const isEn = this.translate.currentLang === 'en';
      this.toastr.success(isEn ? 'PDF generated successfully!' : 'PDF gerado com sucesso!');

      const current = this.draft();
      if (current.id && !this.isPublishedLocally) {
        this.resumeService.publish(current.id).subscribe({
          next: () => { this.isPublishedLocally = true; }
        });
      }
    } catch (err) {
      console.error(err);
      const isEn = this.translate.currentLang === 'en';
      this.toastr.error(isEn ? 'Error generating PDF. Try again.' : 'Erro ao gerar PDF. Tente novamente.', isEn ? 'Error' : 'Erro');
    } finally {
      document.body.removeChild(wrapper);
      this.isExportingPdf.set(false);
    }
  }
}
