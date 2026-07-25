import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResumeService } from './resume';
import { environment } from '../../../environments/environment';

describe('ResumeService', () => {
  let service: ResumeService;
  let httpMock: HttpTestingController;

  const mockResume = { id: '1', title: 'Test', experience: [], education: [], skills: [] } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ResumeService);
    httpMock = TestBed.inject(HttpTestingController);

    const req = httpMock.expectOne(`${environment.apiUrl}/resumes`);
    req.flush([mockResume]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load resumes', () => {
    service.loadResumes().subscribe(res => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/resumes`);
    expect(req.request.method).toBe('GET');
    req.flush([mockResume]);
  });

  it('should load completed resumes', () => {
    service.loadResumes(true).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/resumes?completed=true`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get languages with query', () => {
    service.getLanguages('en').subscribe(res => {
      expect(res).toEqual(['English']);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/resumes/languages?q=en`);
    req.flush(['English']);
  });

  it('should get all from subject', () => {
    expect(service.getAll()).toEqual([mockResume]);
  });

  it('should get by id', () => {
    service.getById('1').subscribe(res => {
      expect(res).toEqual(mockResume);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/resumes/detail/1`);
    req.flush(mockResume);
  });

  it('should create resume', () => {
    service.create({ title: 'New' }).subscribe(res => {
      expect(res.title).toBe('New');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/resumes`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockResume, title: 'New' });
  });

  it('should update resume', () => {
    service.update('1', { title: 'Updated' }).subscribe(res => {
      expect(res.title).toBe('Updated');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/resumes/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockResume, title: 'Updated' });
  });

  it('should delete resume', () => {
    service.delete('1').subscribe();
    const req1 = httpMock.expectOne(`${environment.apiUrl}/resumes/1`);
    expect(req1.request.method).toBe('DELETE');
    req1.flush({});

    const req2 = httpMock.expectOne(`${environment.apiUrl}/resumes`);
    req2.flush([]);
  });

  it('should set current resume', () => {
    service.setCurrentResume(mockResume);
    service.currentResume$.subscribe(res => {
      expect(res).toEqual(mockResume);
    });
  });

  it('should duplicate resume', () => {
    service.duplicate('1').subscribe(res => {
      expect(res.title).toBe('Copy');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/resumes/1/duplicate`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockResume, title: 'Copy' });
  });

  it('should publish resume', () => {
    service.publish('1').subscribe(res => {
      expect(res.id).toBe('1');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/resumes/1/publish`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResume);
  });

  it('should get dashboard stats', () => {
    service.getDashboardStats().subscribe(res => {
      expect(res.totalResumes).toBe(5);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/resumes/dashboard/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({ totalResumes: 5, plan: 'FREE', aiActive: true });
  });

  it('should handle reactive loading state and error stream during loadResumes failure', () => {
    let loadingState = false;
    service.loading$.subscribe(val => loadingState = val);

    service.loadResumes().subscribe({
      error: () => {}
    });
    expect(loadingState).toBe(true);

    const req = httpMock.expectOne(`${environment.apiUrl}/resumes`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(loadingState).toBe(false);

    service.error$.subscribe(err => {
      expect(err).toBe('Erro ao carregar os currículos.');
    });
  });
});
