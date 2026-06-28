import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AIResponse, MatchResult } from '../models/ai.model';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private http = inject(HttpClient);

  improveBio(bio: string): Observable<string> {
    return this.http.post<AIResponse>(`${environment.apiUrl}/ai/improve-bio`, { bio }).pipe(
      map(response => response.result)
    );
  }

  improveExperience(description: string, jobTitle?: string): Observable<string> {
    return this.http.post<AIResponse>(`${environment.apiUrl}/ai/improve-experience`, { description, jobTitle }).pipe(
      map(response => response.result)
    );
  }

  suggestSkills(jobTitle: string): Observable<string[]> {
    return this.http.post<string[]>(`${environment.apiUrl}/ai/suggest-skills`, { jobTitle });
  }

  matchJobDescription(resumeId: string, jobDescription: string): Observable<MatchResult> {
    return this.http.post<MatchResult>(`${environment.apiUrl}/ai/match-job`, { resumeId, jobDescription });
  }
}
