import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoverLetterPageComponent } from './cover-letter.component';
import { ResumeService } from '../../../../core/services/resume';
import { AiService } from '../../../../core/services/ai';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

describe('CoverLetterPageComponent', () => {
  let component: CoverLetterPageComponent;
  let fixture: ComponentFixture<CoverLetterPageComponent>;
  let mockResumeService: Record<string, ReturnType<typeof vi.fn>>;
  let mockAiService: Record<string, ReturnType<typeof vi.fn>>;
  let mockToastrService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockResumeService = {
      loadResumes: vi.fn().mockReturnValue(of([{ id: '1', title: 'My Resume', personalInfo: { name: 'John Doe' } }]))
    };
    mockAiService = {
      generateCoverLetter: vi.fn().mockReturnValue(of({ result: { coverLetter: 'Dear hiring manager...', matchScore: 90 } }))
    };
    mockToastrService = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CoverLetterPageComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ResumeService, useValue: mockResumeService },
        { provide: AiService, useValue: mockAiService },
        { provide: ToastrService, useValue: mockToastrService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoverLetterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load resumes', () => {
    expect(component).toBeTruthy();
    expect(mockResumeService.loadResumes).toHaveBeenCalled();
    expect(component.resumes().length).toBe(1);
    expect(component.selectedResumeId).toBe('1');
  });

  it('should show warning if generating letter without resume', () => {
    component.selectedResumeId = '';
    component.generateCoverLetter();
    expect(mockToastrService.warning).toHaveBeenCalledWith('Selecione um currículo base primeiro.', 'Atenção');
  });

  it('should show warning if generating letter without enough job description', () => {
    component.selectedResumeId = '1';
    component.jobDescription = 'short';
    component.generateCoverLetter();
    expect(mockToastrService.warning).toHaveBeenCalledWith('Por favor, cole uma descrição de vaga com pelo menos 20 caracteres.', 'Atenção');
  });

  it('should generate cover letter successfully', () => {
    component.selectedResumeId = '1';
    component.jobDescription = 'This is a long enough job description for the test to pass successfully and generate a cover letter.';
    component.generateCoverLetter();
    
    expect(mockAiService.generateCoverLetter).toHaveBeenCalled();
    expect(component.generatedLetter()).toBe('Dear hiring manager...');
    expect(mockToastrService.success).toHaveBeenCalled();
  });

  it('should handle cover letter generation error', () => {
    mockAiService.generateCoverLetter.mockReturnValueOnce(throwError(() => new Error('API Error')));
    component.selectedResumeId = '1';
    component.jobDescription = 'This is a long enough job description for the test to pass successfully and generate a cover letter.';
    
    component.generateCoverLetter();
    expect(mockToastrService.error).toHaveBeenCalled();
  });

  it('should copy letter to clipboard', () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText');
    component.generatedLetterEditable = 'Test letter';
    component.copyLetter();
    expect(clipboardSpy).toHaveBeenCalledWith('Test letter');
    expect(component.isSavedOrExported).toBe(true);
    expect(mockToastrService.success).toHaveBeenCalled();
  });

  it('should slugify text', () => {
    expect(component.slugify('Meu Currículo Teste!')).toBe('meu-curriculo-teste');
    expect(component.slugify('')).toBe('');
  });

  it('should handle canDeactivate logic', () => {
    component.generatedLetter.set('New Letter');
    component.defaultLetterText = 'Old Letter';
    component.isSavedOrExported = false;

    const res = component.canDeactivate();
    expect(component.showLeaveModal()).toBe(true);

    component.confirmLeave();
    expect(component.showLeaveModal()).toBe(false);

    component.cancelLeave();
    expect(component.showLeaveModal()).toBe(false);
  });

  it('should select resume and set styles even if no personal info', () => {
    component.resumes.set([{ id: '2', title: 'Resume 2' } as any]);
    component.selectedResumeId = '2';
    component.onResumeSelect();
    expect(component.selectedResumeName()).toBe('Candidato');
  });

  it('should test error on resume load', () => {
    mockResumeService.loadResumes.mockReturnValueOnce(throwError(() => new Error('Error')));
    component.ngOnInit();
    expect(mockToastrService.error).toHaveBeenCalled();
  });
});
