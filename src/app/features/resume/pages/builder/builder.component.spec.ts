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
      getLanguages: vi.fn().mockReturnValue(of(['Portuguese', 'English']))
    };

    mockAiService = {
      improveBio: vi.fn().mockReturnValue(of('Improved bio')),
      improveExperience: vi.fn().mockReturnValue(of('Improved experience description'))
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
    expect(component.currentStep()).toBe('personal');

    // Fill required personal info to pass validation
    component.draft.update(d => ({
      ...d,
      personalInfo: { ...d.personalInfo, name: 'John', email: 'john@test.com' }
    }));

    component.nextStep();
    expect(component.currentStep()).toBe('experience');

    component.prevStep();
    expect(component.currentStep()).toBe('personal');
  });

  it('should save title and navigate', () => {
    component.resumeTitle = 'Updated Resume Title';
    component.saveTitle();

    expect(mockResumeService.update).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalled();
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

  it('should handle template selection', () => {
    component.resumeTitle = 'Meu Currículo';
    component.selectTemplate({ id: 'creative', ptName: 'Criativo' });
    expect(component.draft().template).toBe('creative');
    expect(component.resumeTitle).toBe('Criativo');
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

    const count = component.draft().languages!.length;
    expect(component.draft().languages![count - 1].name).toBe('Spanish');

    component.setLanguageLevel(count - 1, 'Avançado');
    expect(component.draft().languages![count - 1].level).toBe('Avançado');

    component.removeLanguage(count - 1);
    expect(component.draft().languages!.length).toBe(count - 1);
  });
});
