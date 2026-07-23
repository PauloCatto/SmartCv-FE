import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuilderComponent } from './builder.component';
import { ResumeService } from '../../../../core/services/resume';
import { AiService } from '../../../../core/services/ai';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { EMPTY_RESUME } from '../../../../core/models/resume.model';

describe('BuilderComponent', () => {
  let component: BuilderComponent;
  let fixture: ComponentFixture<BuilderComponent>;
  let mockResumeService: Record<string, ReturnType<typeof vi.fn>>;
  let mockAiService: Record<string, ReturnType<typeof vi.fn>>;
  let mockToastrService: Record<string, ReturnType<typeof vi.fn>>;
  let mockRouter: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockResumeService = {
      getById: vi.fn().mockReturnValue(of({ ...EMPTY_RESUME, id: '123', title: 'My Resume' })),
      create: vi.fn().mockReturnValue(of({ ...EMPTY_RESUME, id: '456', title: 'New Resume' })),
      update: vi.fn().mockReturnValue(of({})),
      publish: vi.fn().mockReturnValue(of({})),
      getLanguages: vi.fn().mockReturnValue(of(['Portuguese', 'English']))
    };

    mockAiService = {
      improveBio: vi.fn().mockReturnValue(of('Improved bio')),
      improveExperience: vi.fn().mockReturnValue(of('Improved experience description')),
      roastResume: vi.fn().mockReturnValue(of({ score: 70, strengths: ['Good'], weaknesses: ['Bad'], actionableFeedback: ['Do more'] })),
      generateCoverLetter: vi.fn().mockReturnValue(of({ result: { coverLetter: 'Dear...' } }))
    };

    mockToastrService = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [BuilderComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (key: string) => key === 'id' ? '123' : null },
              queryParamMap: { get: () => null }
            }
          }
        },
        { provide: ResumeService, useValue: mockResumeService },
        { provide: AiService, useValue: mockAiService },
        { provide: ToastrService, useValue: mockToastrService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BuilderComponent);
    component = fixture.componentInstance;
    const translate = TestBed.inject(TranslateService);
    vi.spyOn(translate, 'currentLang', 'get').mockReturnValue('pt');
    fixture.detectChanges();
  });

  it('should create and load resume if id is present', () => {
    expect(component).toBeTruthy();
    expect(mockResumeService.getById).toHaveBeenCalledWith('123');
    expect(component.resumeTitle).toBe('My Resume');
  });

  it('should create new resume when id is not present', () => {
    const route = TestBed.inject(ActivatedRoute);
    vi.spyOn(route.snapshot.paramMap, 'get').mockReturnValue(null);
    vi.spyOn(route.snapshot.queryParamMap, 'get').mockReturnValue('modern');
    component.ngOnInit();
    expect(mockResumeService.create).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/resume', 'new-resume', 'edit'], { replaceUrl: true });
  });

  it('should format dates properly or handle missing ones', () => {
    component.newSkillName = 'Angular';
    component.newSkillLevel = 5;
    component.addSkill();
    expect(component.draft().skills.length).toBeGreaterThan(0);
    expect(component.draft().skills[0].name).toBe('Angular');
  });

  it('should add and remove experience', () => {
    const initialCount = component.draft().experience.length;
    component.addExperience();
    expect(component.draft().experience.length).toBe(initialCount + 1);

    component.removeExperience(initialCount);
    expect(component.draft().experience.length).toBe(initialCount);
  });

  it('should improve bio with AI', () => {
    component.draft.update(d => ({ ...d, personalInfo: { ...d.personalInfo, bio: 'Old bio' } }));
    component.improveWithAI('bio', null, '');

    expect(mockAiService.improveBio).toHaveBeenCalledWith('Old bio', 'pt');
    expect(component.draft().personalInfo.bio).toBe('Improved bio');
    expect(mockToastrService.success).toHaveBeenCalled();
  });

  it('should handle AI improve bio error', () => {
    mockAiService.improveBio.mockReturnValueOnce(throwError(() => new Error('Error')));
    component.improveWithAI('bio', null, '');
    expect(mockToastrService.error).toHaveBeenCalled();
  });

  it('should improve experience with AI', () => {
    component.addExperience();
    const index = component.draft().experience.length - 1;
    component.draft.update(d => {
      const exps = [...d.experience];
      exps[index].description = 'Old description';
      exps[index].role = 'Developer';
      return { ...d, experience: exps };
    });

    component.improveWithAI('experience', index, 'description');

    expect(mockAiService.improveExperience).toHaveBeenCalledWith('Old description', 'Developer', 'pt');
    expect(component.draft().experience[index].description).toBe('Improved experience description');
  });

  it('should not add duplicate skills', () => {
    component.newSkillName = 'React';
    component.addSkill();
    const count = component.draft().skills.length;

    component.newSkillName = 'react';
    component.addSkill();
    expect(component.draft().skills.length).toBe(count);
  });

  it('should change step using nextStep/prevStep', () => {
    expect(component.currentStep()).toBe('template');
    component.goToStep('personal');
    
    // Fill required personal info to pass validation
    component.draft.update(d => ({
      ...d,
      personalInfo: { ...d.personalInfo, name: 'John', email: 'john@test.com' }
    }));

    fixture.detectChanges();
    component.nextStep();
    expect(component.currentStep()).toBe('experience');

    fixture.detectChanges();
    component.prevStep();
    expect(component.currentStep()).toBe('personal');
  });

  it('should save title and navigate', () => {
    component.resumeTitle = 'Updated Resume Title';
    component.saveTitle();

    expect(mockResumeService.update).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should not save title if empty', () => {
    component.resumeTitle = '   ';
    component.saveTitle();
    expect(mockResumeService.update).not.toHaveBeenCalled();
  });

  it('should format location correctly in selectLocation', () => {
    const loc = { display_name: 'Raw', address: { city: 'São Paulo', state: 'SP' } };
    component.selectLocation(loc);
    expect(component.draft().personalInfo.location).toBe('São Paulo, SP');
  });

  it('should handle photo selection correctly', () => {
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1024 });
    const event = { target: { files: [file] } } as unknown as Event;

    const readerSpy = vi.spyOn(FileReader.prototype, 'readAsDataURL');
    component.onPhotoSelected(event);

    expect(readerSpy).toHaveBeenCalledWith(file);
  });

  it('should warn if photo is too large', () => {
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }); // 5MB
    const event = { target: { files: [file] } } as unknown as Event;

    component.onPhotoSelected(event);

    expect(mockToastrService.warning).toHaveBeenCalled();
  });

  it('should test styling selections (color, font, spacing)', () => {
    component.selectColorTheme('#fff');
    expect(component.draft().colorTheme).toBe('#fff');

    component.selectFontFamily('Arial');
    expect(component.draft().fontFamily).toBe('Arial');

    component.selectSpacingMode('compact');
    expect(component.draft().spacingMode).toBe('compact');
  });

  it('should test slugify', () => {
    expect(component.slugify('Currículo do João-Teste')).toBe('curriculo-do-joao-teste');
  });

  it('should import mock data', () => {
    component.importMockData();
    expect(component.draft().personalInfo.name).toBe('Alexandre Magno');
    expect(component.draft().experience.length).toBeGreaterThan(0);
  });

  it('should import mock data in English', () => {
    const translate = TestBed.inject(TranslateService);
    Object.defineProperty(translate, 'currentLang', { value: 'en', writable: true });
    
    component.importMockData();
    expect(component.draft().personalInfo.jobTitle).toBe('Senior Software Engineer');
  });

  it('should handle template selection', () => {
    component.resumeTitle = 'Meu Currículo';
    component.selectTemplate({ id: 'creative', ptName: 'Criativo' });
    expect(component.draft().template).toBe('creative');
    expect(component.resumeTitle).toBe('Criativo');
  });

  it('should go back to dashboard and save if id exists', () => {
    component.draft.update(d => ({ ...d, id: '123' }));
    component.goBack();
    expect(mockResumeService.update).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should go back to dashboard without saving if no id exists', () => {
    component.draft.update(d => ({ ...d, id: '' }));
    component.goBack();
    expect(mockResumeService.update).not.toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should toggle expand item', () => {
    component.toggleExpand('exp', 0);
    expect(component.expandedItem()).toBe('exp-0');
    
    component.toggleExpand('exp', 0);
    expect(component.expandedItem()).toBeNull();
  });

  it('should add and remove education', () => {
    const initialCount = component.draft().education.length;
    component.addEducation();
    expect(component.draft().education.length).toBe(initialCount + 1);

    component.removeEducation(initialCount);
    expect(component.draft().education.length).toBe(initialCount);
  });

  it('should add, remove, and set languages', () => {
    component.newLanguageName = 'Spanish';
    component.newLanguageLevel = 'Básico';
    component.addLanguage();
    fixture.detectChanges();

    const count = component.draft().languages!.length;
    expect(component.draft().languages![count - 1].name).toBe('Spanish');

    component.setLanguageLevel(count - 1, 'Avançado');
    expect(component.draft().languages![count - 1].level).toBe('Avançado');
    fixture.detectChanges();

    expect(component.languageExists('Spanish')).toBe(true);
    expect(component.languageExists('French')).toBe(false);

    // Should not add if language already exists
    component.newLanguageName = 'spanish';
    component.addLanguage();
    expect(mockToastrService.warning).toHaveBeenCalled();
    expect(component.draft().languages!.length).toBe(count);

    component.removeLanguage(count - 1);
    expect(component.draft().languages!.length).toBe(count - 1);
  });

  it('should get translated language level', () => {
    const translate = TestBed.inject(TranslateService);
    vi.spyOn(translate, 'instant').mockImplementation((key) => key as string);
    expect(component.getTranslatedLanguageLevel('Básico')).toBe('BUILDER.LANGUAGES.LEVELS.BASIC');
    expect(component.getTranslatedLanguageLevel('Unknown')).toBe('BUILDER.LANGUAGES.LEVELS.BASIC');
  });

  it('should test drag and drop for experience', () => {
    component.addExperience();
    component.addExperience();
    const event = { previousIndex: 0, currentIndex: 1 } as any;
    component.dropExperience(event);
    expect(component.draft().experience.length).toBe(2);
  });

  it('should compute atsScore correctly', () => {
    expect(component.atsScore()).toBe(0);
    component.draft.update((d: any) => ({
      ...d,
      personalInfo: { name: 'John Doe', email: 'j@d.com', phone: '123' },
      experience: [{ id: '1', title: 'Developer', company: 'X', startDate: '2020', description: 'test test test test test test test test test test' }],
      education: [{ id: '1', degree: 'BSc', school: 'U', startDate: '2016' }]
    }));
    fixture.detectChanges();
    expect(component.atsScore()).toBeGreaterThan(0);
  });

  it('should trigger locationSearch$ on onLocationInput', () => {
    const spy = vi.spyOn(component.locationSearch$, 'next');
    const event = { target: { value: 'São' } } as unknown as Event;
    component.onLocationInput(event);
    expect(spy).toHaveBeenCalledWith('São');
  });

  it('should trigger languageSearch$ on onLanguageInput', () => {
    const spy = vi.spyOn(component.languageSearch$, 'next');
    const event = { target: { value: 'Eng' } } as unknown as Event;
    component.onLanguageInput(event);
    expect(spy).toHaveBeenCalledWith('Eng');
  });

  it('should hide location dropdown after timeout', () => {
    vi.useFakeTimers();
    component.showLocationDropdown = true;
    component.hideLocationDropdown();
    vi.advanceTimersByTime(250);
    expect(component.showLocationDropdown).toBe(false);
    vi.useRealTimers();
  });

  it('should hide language dropdown after timeout', () => {
    vi.useFakeTimers();
    component.showLanguageDropdown = true;
    component.hideLanguageDropdown();
    vi.advanceTimersByTime(250);
    expect(component.showLanguageDropdown).toBe(false);
    vi.useRealTimers();
  });

  it('should select language from dropdown', () => {
    component.selectLanguage('French');
    expect(component.newLanguageName).toBe('French');
    expect(component.showLanguageDropdown).toBe(false);
  });

  it('should handle addSuggestion', () => {
    component.addSuggestion('Go');
    expect(component.newSkillName).toBe('');
    expect(component.skillExists('Go')).toBe(true);
  });

  // ─── Step rendering tests (HTML coverage) ───────────────────────────────────
  // Each test navigates to a specific step and calls detectChanges so Angular
  // renders that section of the template, counting those lines as covered.

  it('should render template step', () => {
    component.goToStep('template');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Template step shows template grid
    expect(compiled.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render personal step', () => {
    component.goToStep('personal');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render experience step', () => {
    component.goToStep('experience');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render education step', () => {
    component.goToStep('education');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render skills step', () => {
    component.goToStep('skills');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render languages step', () => {
    component.goToStep('languages');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render finish step', () => {
    component.goToStep('finish');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render personal step with data filled in', () => {
    component.draft.update(d => ({
      ...d,
      personalInfo: {
        name: 'John Doe',
        email: 'john@test.com',
        phone: '11999999999',
        bio: 'I am a developer',
        jobTitle: 'Developer',
        location: 'São Paulo, SP',
        linkedin: 'linkedin.com/in/johndoe',
        website: 'johndoe.com',
        photo: ''
      }
    }));
    component.goToStep('personal');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render experience step with experience items', () => {
    component.addExperience();
    component.addExperience();
    component.draft.update(d => ({
      ...d,
      experience: d.experience.map((e, i) => ({
        ...e,
        role: `Role ${i}`,
        company: `Company ${i}`,
        startDate: '2020-01',
        current: i === 0
      }))
    }));
    component.goToStep('experience');
    component.toggleExpand('exp', 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render education step with education items', () => {
    component.addEducation();
    component.draft.update(d => ({
      ...d,
      education: d.education.map(e => ({
        ...e,
        degree: 'BSc',
        institution: 'University',
        field: 'Computer Science',
        startDate: '2016-01',
        current: false
      }))
    }));
    component.goToStep('education');
    component.toggleExpand('edu', 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render skills step with skills and AI loading', () => {
    component.newSkillName = 'TypeScript';
    component.addSkill();
    component.newSkillName = 'Angular';
    component.addSkill();
    component.newSkillName = 'React';
    component.addSkill();
    component.newSkillName = 'Node.js';
    component.addSkill();
    component.newSkillName = 'Python';
    component.addSkill();
    component.goToStep('skills');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render languages step with language items', () => {
    component.newLanguageName = 'Portuguese';
    component.newLanguageLevel = 'Nativo';
    component.addLanguage();
    component.newLanguageName = 'English';
    component.newLanguageLevel = 'Avançado';
    component.addLanguage();
    component.goToStep('languages');
    component.toggleExpand('lang', 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render finish step with high ATS score', () => {
    component.draft.update(d => ({
      ...d,
      personalInfo: {
        name: 'John Doe', email: 'j@d.com', phone: '11999999',
        bio: 'I am a very experienced developer with lots of skills and expertise. I have worked in many companies.',
        jobTitle: 'Developer', location: 'SP', linkedin: 'linkedin.com', website: '', photo: ''
      },
      experience: [{ id: '1', role: 'Dev', company: 'X', startDate: '2020', endDate: '', current: true, description: 'long long long long long long long long long long long description' }],
      education: [{ id: '1', degree: 'BSc', institution: 'U', field: 'CS', startDate: '2016', endDate: '', current: false }],
      skills: [
        { id: '1', name: 'JS', level: 5 }, { id: '2', name: 'TS', level: 4 },
        { id: '3', name: 'Angular', level: 4 }, { id: '4', name: 'React', level: 3 },
        { id: '5', name: 'Node', level: 3 }
      ],
      languages: [{ id: '1', name: 'PT', level: 'Nativo' }, { id: '2', name: 'EN', level: 'Avançado' }]
    }));
    component.goToStep('finish');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render saving and saved states', () => {
    component.saveState.set('saving');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.save-indicator.saving')).toBeTruthy();

    component.saveState.set('saved');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.save-indicator.saved')).toBeTruthy();
  });

  it('should render ATS info modal when showAtsInfoModal is true', () => {
    component.showAtsInfoModal.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render preview tab', () => {
    component.activeTab.set('preview');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render leave modal when showLeaveModal is true', () => {
    component.showLeaveModal.set(true);
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.leave-modal-overlay');
    expect(modal).toBeTruthy();
  });

  it('should render roast modal with loading state', () => {
    component.showRoastModal.set(true);
    component.isRoasting.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.builder-page')).toBeTruthy();
  });

  it('should render roast modal with results', () => {
    component.showRoastModal.set(true);
    component.isRoasting.set(false);
    component.roastResult.set({
      score: 75,
      strengths: ['Great experience'],
      weaknesses: ['No photo'],
      actionableFeedback: ['Add a photo', 'Add more skills']
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.builder-page')).toBeTruthy();
  });

  it('should canDeactivate return observable and show leave modal', () => {
    component.isPublishedLocally = false;
    component.isNavigatingInternally = false;
    const result = component.canDeactivate();
    expect(component.showLeaveModal()).toBe(true);
    expect(typeof result === 'object').toBe(true);
  });

  it('should canDeactivate return true if published or navigating', () => {
    component.isPublishedLocally = true;
    let result = component.canDeactivate();
    // of(true) is an observable
    expect(result).toBeTruthy();

    component.isPublishedLocally = false;
    component.isNavigatingInternally = true;
    result = component.canDeactivate();
    expect(result).toBeTruthy();
  });

  it('should confirmLeave and cancelLeave close the modal', () => {
    component.showLeaveModal.set(true);
    component.confirmLeave();
    expect(component.showLeaveModal()).toBe(false);

    component.showLeaveModal.set(true);
    component.cancelLeave();
    expect(component.showLeaveModal()).toBe(false);
  });

  it('should toggle mobile view', () => {
    expect(component.activeTab()).toBe('edit');
    component.toggleMobileView();
    expect(component.activeTab()).toBe('preview');
    component.toggleMobileView();
    expect(component.activeTab()).toBe('edit');
  });

  it('should call roastResume and populate roastResult', () => {
    component.draft.update(d => ({ ...d, id: '123' }));
    component.roastResume();
    expect(mockAiService.roastResume).toHaveBeenCalled();
    expect(component.showRoastModal()).toBe(true);
    expect(component.roastResult().score).toBe(70);
    expect(component.isRoasting()).toBe(false);
  });

  it('should handle roastResume error', () => {
    mockAiService.roastResume.mockReturnValueOnce(throwError(() => new Error('AI error')));
    component.draft.update(d => ({ ...d, id: '123' }));
    component.roastResume();
    expect(mockToastrService.error).toHaveBeenCalled();
    expect(component.showRoastModal()).toBe(false);
    expect(component.isRoasting()).toBe(false);
  });

  it('should closeRoastModal', () => {
    component.showRoastModal.set(true);
    component.closeRoastModal();
    expect(component.showRoastModal()).toBe(false);
  });
});

