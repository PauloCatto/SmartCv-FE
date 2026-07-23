import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobMatcherModalComponent } from './job-matcher-modal.component';
import { AiService } from '../../../core/services/ai';
import { ResumeService } from '../../../core/services/resume';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('JobMatcherModalComponent', () => {
  let component: JobMatcherModalComponent;
  let fixture: ComponentFixture<JobMatcherModalComponent>;
  let mockAiService: Record<string, ReturnType<typeof vi.fn>>;
  let mockResumeService: Record<string, ReturnType<typeof vi.fn>>;
  let mockRouter: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockAiService = {
      matchJobDescription: vi.fn().mockReturnValue(of({
        matchScore: 85,
        suggestedBio: 'New optimized bio',
        suggestedExperiences: [{ id: 'exp1', description: 'Updated exp' }],
        missingKeywords: ['Angular', 'TypeScript']
      }))
    };
    mockResumeService = {
      getById: vi.fn().mockReturnValue(of({
        id: '123',
        personalInfo: { bio: 'Old bio' },
        experience: [{ id: 'exp1', description: 'Old exp' }]
      })),
      update: vi.fn().mockReturnValue(of({}))
    };
    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [JobMatcherModalComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AiService, useValue: mockAiService },
        { provide: ResumeService, useValue: mockResumeService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobMatcherModalComponent);
    component = fixture.componentInstance;
    component.resumeId = '123';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit if description is empty', () => {
    component.jobDescription = '   ';
    component.onSubmit();
    expect(mockAiService.matchJobDescription).not.toHaveBeenCalled();
  });

  it('should submit and set result', () => {
    component.jobDescription = 'Long enough description...';
    fixture.detectChanges();
    component.onSubmit();
    fixture.detectChanges();
    expect(mockAiService.matchJobDescription).toHaveBeenCalledWith('123', 'Long enough description...');
    expect(component.result()?.matchScore).toBe(85);
  });

  it('should handle submission error', () => {
    mockAiService.matchJobDescription.mockReturnValueOnce(throwError(() => new Error('Test error')));
    component.jobDescription = 'Long enough description...';
    component.onSubmit();
    fixture.detectChanges();
    expect(component.error()).toBe('Test error');
  });

  it('should handle submission error with no message', () => {
    mockAiService.matchJobDescription.mockReturnValueOnce(throwError(() => ({})));
    component.jobDescription = 'Long enough description...';
    component.onSubmit();
    expect(component.error()).toBe('Falha ao analisar a vaga. Verifique a chave de API da IA.');
  });

  it('should apply optimization', () => {
    component.jobDescription = 'Long enough description...';
    component.onSubmit(); // populate result()
    fixture.detectChanges();
    
    vi.spyOn(component.close, 'emit');
    
    component.applyOptimization();
    fixture.detectChanges();
    
    expect(mockResumeService.getById).toHaveBeenCalledWith('123');
    expect(mockResumeService.update).toHaveBeenCalled();
    expect(component.close.emit).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/resume', '123', 'edit']);
  });

  it('should apply optimization and keep original experience if no matching suggestion is found', () => {
    // Setup getById to return an experience that doesn't match the suggested 'exp1'
    mockResumeService.getById.mockReturnValueOnce(of({
      id: '123',
      personalInfo: { bio: 'Old bio' },
      experience: [{ id: 'exp2', description: 'Old exp 2' }] // different ID
    }));
    
    component.jobDescription = 'Desc';
    component.onSubmit(); 
    
    component.applyOptimization();
    
    expect(mockResumeService.update).toHaveBeenCalledWith('123', expect.objectContaining({
      experience: [{ id: 'exp2', description: 'Old exp 2' }] // Unchanged
    }));
  });

  it('should not apply optimization if result is null', () => {
    component.applyOptimization();
    expect(mockResumeService.getById).not.toHaveBeenCalled();
  });

  it('should handle error when fetching resume during optimization', () => {
    component.jobDescription = 'Desc';
    component.onSubmit();
    mockResumeService.getById.mockReturnValueOnce(throwError(() => new Error('Fetch error')));
    
    component.applyOptimization();
    expect(component.error()).toBe('Erro ao buscar currículo.');
    expect(component.applying()).toBe(false);
  });

  it('should handle case when fetching resume returns null during optimization', () => {
    component.jobDescription = 'Desc';
    component.onSubmit();
    mockResumeService.getById.mockReturnValueOnce(of(null));
    
    component.applyOptimization();
    expect(component.error()).toBe('Erro ao carregar o currículo atual');
    expect(component.applying()).toBe(false);
  });

  it('should handle error when updating resume during optimization', () => {
    component.jobDescription = 'Desc';
    component.onSubmit();
    mockResumeService.update.mockReturnValueOnce(throwError(() => new Error('Update error')));
    
    component.applyOptimization();
    expect(component.error()).toBe('Erro ao aplicar as otimizações no currículo');
    expect(component.applying()).toBe(false);
  });
});
