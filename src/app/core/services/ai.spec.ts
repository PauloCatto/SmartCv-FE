import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AiService } from './ai';
import { environment } from '../../../environments/environment';

describe('AiService', () => {
  let service: AiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should improve bio', () => {
    service.improveBio('bio', 'pt').subscribe(res => {
      expect(res).toBe('improved');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/improve-bio`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ bio: 'bio', language: 'pt' });
    req.flush({ result: 'improved' });
  });

  it('should improve experience', () => {
    service.improveExperience('desc', 'dev', 'en').subscribe(res => {
      expect(res).toBe('improved-exp');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/improve-experience`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ description: 'desc', jobTitle: 'dev', language: 'en' });
    req.flush({ result: 'improved-exp' });
  });

  it('should suggest skills on success', () => {
    service.suggestSkills('dev').subscribe(res => {
      expect(res).toEqual(['skill1', 'skill2']);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/suggest-skills`);
    expect(req.request.method).toBe('POST');
    req.flush(['skill1', 'skill2']);
  });

  it('should suggest fallback skills on error', () => {
    service.suggestSkills('dev').subscribe(res => {
      expect(res).toEqual(['JavaScript', 'Comunicação', 'Resolução de Problemas']);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/suggest-skills`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should match job description', () => {
    service.matchJobDescription('123', 'job desc').subscribe(res => {
      expect(res.matchScore).toBe(90);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/match-job`);
    req.flush({ matchScore: 90 });
  });

  it('should generate cover letter', () => {
    service.generateCoverLetter('123', 'job desc', 'pt').subscribe(res => {
      expect(res.result.coverLetter).toBe('my letter');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/cover-letter`);
    req.flush({ result: { coverLetter: 'my letter', matchScore: 80 } });
  });

  it('should roast resume', () => {
    service.roastResume('123', 'en').subscribe(res => {
      expect(res.feedback).toBe('bad');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/roast-resume`);
    req.flush({ feedback: 'bad' });
  });

  it('should import LinkedIn', () => {
    const mockFile = new File([''], 'resume.pdf');
    service.importLinkedIn(mockFile, 'pt').subscribe(res => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ai/import-linkedin`);
    expect(req.request.body instanceof FormData).toBe(true);
    expect(req.request.body.get('language')).toBe('pt');
    req.flush({ success: true });
  });
});
