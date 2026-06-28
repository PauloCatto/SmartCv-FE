import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AIResponse {
  result: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private http = inject(HttpClient);

  async improveBio(bio: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post<AIResponse>(`${environment.apiUrl}/ai/improve-bio`, { bio })
      );
      return response.result;
    } catch (err: any) {
      const errMsg = err?.error?.error || 'Erro ao melhorar resumo com IA';
      throw new Error(errMsg);
    }
  }

  async improveExperience(description: string, jobTitle?: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post<AIResponse>(`${environment.apiUrl}/ai/improve-experience`, { description, jobTitle })
      );
      return response.result;
    } catch (err: any) {
      const errMsg = err?.error?.error || 'Erro ao melhorar experiência com IA';
      throw new Error(errMsg);
    }
  }

  async suggestSkills(jobTitle: string): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.http.post<string[]>(`${environment.apiUrl}/ai/suggest-skills`, { jobTitle })
      );
      return response;
    } catch (err: any) {
      const errMsg = err?.error?.error || 'Erro ao sugerir habilidades com IA';
      throw new Error(errMsg);
    }
  }
}
