import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Resume, EMPTY_RESUME } from '../models/resume.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private http = inject(HttpClient);
  private _resumes = signal<Resume[]>([]);
  private _currentResume = signal<Resume | null>(null);

  readonly resumes = this._resumes.asReadonly();
  readonly currentResume = this._currentResume.asReadonly();

  constructor() {
    this.loadResumes();
  }

  async loadResumes(): Promise<void> {
    try {
      const resumesList = await firstValueFrom(
        this.http.get<Resume[]>(`${environment.apiUrl}/resumes`)
      );
      this._resumes.set(resumesList);
    } catch {
      this._resumes.set([]);
    }
  }

  getAll(): Resume[] {
    return this._resumes();
  }

  async getById(id: string): Promise<Resume | null> {
    // If already loaded, we can find it, but pulling from backend is safer for fresh data
    try {
      const resume = await firstValueFrom(
        this.http.get<Resume>(`${environment.apiUrl}/resumes/${id}`)
      );
      this._currentResume.set(resume);
      return resume;
    } catch {
      return null;
    }
  }

  async create(partial?: Partial<Resume>): Promise<Resume> {
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

    const newResume = await firstValueFrom(
      this.http.post<Resume>(`${environment.apiUrl}/resumes`, resumePayload)
    );

    this._resumes.update(list => [...list, newResume]);
    this._currentResume.set(newResume);
    return newResume;
  }

  async update(id: string, changes: Partial<Resume>): Promise<Resume | null> {
    try {
      const updated = await firstValueFrom(
        this.http.put<Resume>(`${environment.apiUrl}/resumes/${id}`, changes)
      );

      this._resumes.update(list => list.map(r => r.id === id ? updated : r));
      this._currentResume.set(updated);
      return updated;
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${environment.apiUrl}/resumes/${id}`)
      );
      this._resumes.update(list => list.filter(r => r.id !== id));
      if (this._currentResume()?.id === id) {
        this._currentResume.set(null);
      }
    } catch (err) {
      throw new Error('Falha ao deletar currículo');
    }
  }

  setCurrentResume(resume: Resume | null): void {
    this._currentResume.set(resume);
  }

  async duplicate(id: string): Promise<Resume | null> {
    try {
      const duplicated = await firstValueFrom(
        this.http.post<Resume>(`${environment.apiUrl}/resumes/${id}/duplicate`, {})
      );
      this._resumes.update(list => [...list, duplicated]);
      return duplicated;
    } catch {
      return null;
    }
  }
}
