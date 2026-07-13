import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MatchResult } from '../models/ai.model';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private http = inject(HttpClient);

  improveBio(bio: string): Observable<string> {
    return this.http.post<{ result: string }>(`${environment.apiUrl}/ai/improve-bio`, { bio }).pipe(
      map(res => res.result)
    );
  }

  improveExperience(description: string, jobTitle?: string): Observable<string> {
    return this.http.post<{ result: string }>(`${environment.apiUrl}/ai/improve-experience`, { description, jobTitle }).pipe(
      map(res => res.result)
    );
  }

  suggestSkills(jobTitle: string): Observable<string[]> {
    return this.http.post<string[]>(`${environment.apiUrl}/ai/suggest-skills`, { jobTitle }).pipe(
      catchError(() => of(['JavaScript', 'Comunicação', 'Resolução de Problemas']))
    );
  }

  matchJobDescription(resumeId: string, jobDescription: string): Observable<MatchResult> {
    return this.http.post<MatchResult>(`${environment.apiUrl}/ai/match-job`, { resumeId, jobDescription });
  }

  generateCoverLetter(resumeId: string, jobDescription: string, language?: string): Observable<{ result: { coverLetter: string; matchScore: number } }> {
    return this.http.post<{ result: { coverLetter: string; matchScore: number } }>(`${environment.apiUrl}/ai/cover-letter`, { resumeId, jobDescription, language });
  }

  roastResume(resumeId: string, language?: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/ai/roast-resume`, { resumeId, language });
  }
}
