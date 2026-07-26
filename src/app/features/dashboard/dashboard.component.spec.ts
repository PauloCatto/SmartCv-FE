import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ResumeService } from '../../core/services/resume';
import { AuthService } from '../../core/services/auth';
import { AiService } from '../../core/services/ai';
import { NotificationService } from '../../core/services/notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  let mockResumeService: any;
  let mockAuthService: any;
  let mockAiService: any;
  let mockNotificationService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockResumeService = {
      resumes$: new BehaviorSubject([]),
      getDashboardStats: vi.fn().mockReturnValue(of({ totalResumes: 0, plan: 'FREE', aiActive: false })),
      loadResumes: vi.fn().mockReturnValue(of([])),
      duplicate: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of({})),
      create: vi.fn().mockReturnValue(of({ id: '123', title: 'New Resume' }))
    };

    mockAuthService = {
      user$: new BehaviorSubject({ name: 'Paulo Catto' })
    };

    mockAiService = {
      importLinkedIn: vi.fn().mockReturnValue(of({ title: 'Imported Resume' }))
    };

    mockNotificationService = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ResumeService, useValue: mockResumeService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AiService, useValue: mockAiService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load resumes on init', () => {
    expect(mockResumeService.loadResumes).toHaveBeenCalledWith();
  });

  it('should handle resume duplication successfully', () => {
    const mockResume: any = { id: 'test-123' };
    component.duplicate(mockResume);
    expect(mockResumeService.duplicate).toHaveBeenCalledWith('test-123');
    expect(mockNotificationService.success).toHaveBeenCalledWith({ pt: 'Currículo duplicado com sucesso!', en: 'Resume duplicated successfully!' }, { pt: 'Duplicado', en: 'Duplicated' });
  });

  it('should handle resume duplication error', () => {
    mockResumeService.duplicate.mockReturnValueOnce(throwError(() => new Error('Error')));
    const mockResume: any = { id: 'test-123' };
    component.duplicate(mockResume);
    expect(mockNotificationService.error).toHaveBeenCalledWith({ pt: 'Erro ao duplicar currículo.', en: 'Error duplicating resume.' });
  });

  it('should request delete and confirm delete', () => {
    component.requestDelete('test-123');
    expect(component.deleteTargetId).toBe('test-123');

    component.confirmDelete();
    expect(mockResumeService.delete).toHaveBeenCalledWith('test-123');
    expect(mockNotificationService.success).toHaveBeenCalledWith({ pt: 'Currículo excluído com sucesso!', en: 'Resume deleted successfully!' }, { pt: 'Excluído', en: 'Deleted' });
    expect(component.deleteTargetId).toBeNull();
  });

  it('should handle delete error', () => {
    mockResumeService.delete.mockReturnValueOnce(throwError(() => new Error('Error')));
    component.requestDelete('test-123');
    component.confirmDelete();
    expect(mockNotificationService.error).toHaveBeenCalledWith({ pt: 'Erro ao excluir currículo. Tente novamente.', en: 'Error deleting resume. Try again.' });
  });

  it('should cancel delete', () => {
    component.requestDelete('test-123');
    component.cancelDelete();
    expect(component.deleteTargetId).toBeNull();
  });

  it('should create with template and navigate', () => {
    const tmpl = { id: 'modern', ptName: 'Moderno' };
    component.createWithTemplate(tmpl);

    expect(mockResumeService.create).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/resume', 'new-resume', 'edit']);
  });

  it('should open and close job matcher', () => {
    component.openJobMatcher('test-123');
    expect(component.selectedResumeId).toBe('test-123');

    component.closeJobMatcher();
    expect(component.selectedResumeId).toBeNull();
  });

  it('should format dates correctly', () => {
    const now = new Date();

    const oneMinAgo = new Date(now.getTime() - 30 * 1000).toISOString();
    expect(component.formatDate(oneMinAgo)).toBe('agora mesmo');

    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60000).toISOString();
    expect(component.formatDate(thirtyMinsAgo)).toBe('há 30 min');

    const twoHoursAgo = new Date(now.getTime() - 2 * 3600000).toISOString();
    expect(component.formatDate(twoHoursAgo)).toBe('há 2h');

    const twoDaysAgo = new Date(now.getTime() - 48 * 3600000);
    expect(component.formatDate(twoDaysAgo.toISOString())).toBe(twoDaysAgo.toLocaleDateString('pt-BR'));
  });

  it('should get template name', () => {
    expect(component.getTemplateName('modern')).toBe('Moderno Azul');
    expect(component.getTemplateName('unknown')).toBe('unknown');
  });

  it('should navigate on editResume', () => {
    component.editResume({ title: 'My Resume' } as any);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/resume', 'my-resume', 'edit']);
  });

  it('should scroll carousel', () => {
    component.carouselContainer = { nativeElement: { scrollBy: vi.fn() } } as any;
    component.scrollCarousel(100);
    expect(component.carouselContainer.nativeElement.scrollBy).toHaveBeenCalledWith({ left: 100, behavior: 'smooth' });
  });

  it('should trigger file input on triggerLinkedInImport', () => {
    component.fileInput = { nativeElement: { click: vi.fn() } } as any;
    component.triggerLinkedInImport();
    expect(component.fileInput.nativeElement.click).toHaveBeenCalled();
  });

  it('should return early on empty file selection', () => {
    const event = { target: { files: [] } } as any;
    component.onLinkedInFileSelected(event);
    expect(mockNotificationService.error).not.toHaveBeenCalled();
    expect(mockAiService.importLinkedIn).not.toHaveBeenCalled();
  });

  it('should handle non-PDF file on LinkedIn import', () => {
    const event = { target: { files: [{ type: 'image/png' }] } } as any;
    component.onLinkedInFileSelected(event);
    expect(mockNotificationService.error).toHaveBeenCalledWith({ pt: 'Por favor, envie um arquivo PDF do LinkedIn.', en: 'Please upload a LinkedIn PDF file.' });
    expect(mockAiService.importLinkedIn).not.toHaveBeenCalled();
  });

  it('should process LinkedIn PDF and navigate on success', () => {
    const event = { target: { files: [{ type: 'application/pdf' }], value: 'test' } } as any;

    const translate = TestBed.inject(TranslateService);
    Object.defineProperty(translate, 'currentLang', { value: 'pt', writable: true });

    mockAiService.importLinkedIn.mockReturnValue(of({ title: 'Imported', personalInfo: {} }));
    mockResumeService.create.mockReturnValue(of({ id: '1', title: 'Curriculo LinkedIn - Jul 2026' }));

    component.onLinkedInFileSelected(event);

    expect(mockAiService.importLinkedIn).toHaveBeenCalled();
    expect(mockResumeService.create).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/resume', 'curriculo-linkedin-jul-2026', 'edit']);
  });

  it('should handle error when importing LinkedIn PDF', () => {
    const event = { target: { files: [{ type: 'application/pdf' }], value: 'test' } } as any;

    const translate = TestBed.inject(TranslateService);
    Object.defineProperty(translate, 'currentLang', { value: 'pt', writable: true });

    mockAiService.importLinkedIn.mockReturnValue(throwError(() => new Error('Error')));

    component.onLinkedInFileSelected(event);

    expect(mockNotificationService.error).toHaveBeenCalledWith({ pt: 'Falha ao processar o PDF do LinkedIn.', en: 'Failed to process LinkedIn PDF.' });
  });

  it('should handle error when creating resume from LinkedIn import', () => {
    const event = { target: { files: [{ type: 'application/pdf' }], value: 'test' } } as any;

    const translate = TestBed.inject(TranslateService);
    Object.defineProperty(translate, 'currentLang', { value: 'pt', writable: true });

    mockAiService.importLinkedIn.mockReturnValue(of({ title: 'Imported' }));
    mockResumeService.create.mockReturnValue(throwError(() => new Error('Error')));

    component.onLinkedInFileSelected(event);

    expect(mockNotificationService.error).toHaveBeenCalledWith({ pt: 'Erro ao salvar o currículo.', en: 'Error saving the resume.' });
  });

  it('should unsubscribe on destroy', () => {
    const unsubscribeSpy = vi.fn();
    (component as any).subs = [{ unsubscribe: unsubscribeSpy }];
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
