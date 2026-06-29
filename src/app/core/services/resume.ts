import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { Resume, DashboardStats, EMPTY_RESUME } from '../models/resume.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private http = inject(HttpClient);

  private resumesSubject = new BehaviorSubject<Resume[]>([]);
  private currentResumeSubject = new BehaviorSubject<Resume | null>(null);

  readonly resumes$ = this.resumesSubject.asObservable();
  readonly currentResume$ = this.currentResumeSubject.asObservable();

  constructor() {
    this.loadResumes().subscribe();
  }

  loadResumes(): Observable<Resume[]> {
    return this.http.get<Resume[]>(`${environment.apiUrl}/resumes`).pipe(
      tap(resumesList => {
        this.resumesSubject.next(resumesList);
      })
    );
  }

  getAll(): Resume[] {
    return this.resumesSubject.value;
  }

  getById(id: string): Observable<Resume> {
    return this.http.get<Resume>(`${environment.apiUrl}/resumes/detail/${id}`).pipe(
      tap(resume => {
        this.currentResumeSubject.next(resume);
      })
    );
  }

  create(partial?: Partial<Resume>): Observable<Resume> {
    const resumePayload = {
      title: partial?.title || EMPTY_RESUME.title,
      template: partial?.template || EMPTY_RESUME.template,
      colorTheme: partial?.colorTheme || EMPTY_RESUME.colorTheme,
      fontFamily: partial?.fontFamily || EMPTY_RESUME.fontFamily,
      spacingMode: partial?.spacingMode || EMPTY_RESUME.spacingMode,
      personalInfo: partial?.personalInfo || EMPTY_RESUME.personalInfo,
      experience: partial?.experience || EMPTY_RESUME.experience,
      education: partial?.education || EMPTY_RESUME.education,
      skills: partial?.skills || EMPTY_RESUME.skills,
    };

    return this.http.post<Resume>(`${environment.apiUrl}/resumes`, resumePayload).pipe(
      tap(newResume => {
        const currentList = this.resumesSubject.value;
        this.resumesSubject.next([...currentList, newResume]);
        this.currentResumeSubject.next(newResume);
      })
    );
  }

  update(id: string, changes: Partial<Resume>): Observable<Resume> {
    return this.http.put<Resume>(`${environment.apiUrl}/resumes/${id}`, changes).pipe(
      tap(updated => {
        const currentList = this.resumesSubject.value;
        this.resumesSubject.next(currentList.map(r => r.id === id ? updated : r));
        this.currentResumeSubject.next(updated);
      })
    );
  }

  delete(id: string): Observable<Resume[]> {
    return this.http.delete<void>(`${environment.apiUrl}/resumes/${id}`).pipe(
      tap(() => {
        if (this.currentResumeSubject.value?.id === id) {
          this.currentResumeSubject.next(null);
        }
      }),
      switchMap(() => this.loadResumes())
    );
  }

  setCurrentResume(resume: Resume | null): void {
    this.currentResumeSubject.next(resume);
  }

  duplicate(id: string): Observable<Resume> {
    return this.http.post<Resume>(`${environment.apiUrl}/resumes/${id}/duplicate`, {}).pipe(
      tap(duplicated => {
        const currentList = this.resumesSubject.value;
        this.resumesSubject.next([...currentList, duplicated]);
      })
    );
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/resumes/dashboard/stats`);
  }
}
