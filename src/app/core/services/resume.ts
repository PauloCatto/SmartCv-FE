import { Injectable, signal } from '@angular/core';
import { Resume, EMPTY_RESUME } from '../models/resume.model';

const STORAGE_KEY = 'smartcv_resumes';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private _resumes = signal<Resume[]>(this.loadResumes());
  private _currentResume = signal<Resume | null>(null);

  readonly resumes = this._resumes.asReadonly();
  readonly currentResume = this._currentResume.asReadonly();

  private loadResumes(): Resume[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveResumes(resumes: Resume[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    this._resumes.set(resumes);
  }

  getAll(): Resume[] {
    return this._resumes();
  }

  getById(id: string): Resume | undefined {
    return this._resumes().find(r => r.id === id);
  }

  create(partial?: Partial<Resume>): Resume {
    const now = new Date().toISOString();
    const resume: Resume = {
      ...EMPTY_RESUME,
      ...partial,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      personalInfo: { ...EMPTY_RESUME.personalInfo, ...(partial?.personalInfo ?? {}) },
      experience: partial?.experience ?? [],
      education: partial?.education ?? [],
      skills: partial?.skills ?? [],
    };
    const updated = [...this._resumes(), resume];
    this.saveResumes(updated);
    this._currentResume.set(resume);
    return resume;
  }

  update(id: string, changes: Partial<Resume>): Resume | null {
    const resumes = this._resumes();
    const idx = resumes.findIndex(r => r.id === id);
    if (idx === -1) return null;

    const updated: Resume = {
      ...resumes[idx],
      ...changes,
      id,
      updatedAt: new Date().toISOString(),
    };
    const newList = [...resumes];
    newList[idx] = updated;
    this.saveResumes(newList);
    this._currentResume.set(updated);
    return updated;
  }

  delete(id: string): void {
    const filtered = this._resumes().filter(r => r.id !== id);
    this.saveResumes(filtered);
    if (this._currentResume()?.id === id) {
      this._currentResume.set(null);
    }
  }

  setCurrentResume(resume: Resume | null): void {
    this._currentResume.set(resume);
  }

  duplicate(id: string): Resume | null {
    const original = this.getById(id);
    if (!original) return null;
    return this.create({
      ...original,
      title: `${original.title} (cópia)`,
    });
  }
}
