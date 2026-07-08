import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MatchResult } from '../models/ai.model';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private http = inject(HttpClient);
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (environment.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
    }
  }

  private async generateWithGemini(prompt: string): Promise<string> {
    if (!this.genAI) {
      console.warn('Gemini API Key não configurada no environment. Retornando texto de fallback.');
      return "Para usar a IA de verdade, configure a variável geminiApiKey no arquivo environment.ts. Este é apenas um texto de exemplo.";
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (e) {
      console.error("Erro na API do Gemini:", e);
      throw e;
    }
  }

  improveBio(bio: string): Observable<string> {
    const prompt = `Melhore o seguinte resumo profissional para um currículo. Torne-o mais atrativo, profissional e conciso (máximo de 3 parágrafos curtos). Mantenha no idioma em que foi escrito:\n\n"${bio}"`;
    return from(this.generateWithGemini(prompt));
  }

  improveExperience(description: string, jobTitle?: string): Observable<string> {
    const titleContext = jobTitle ? ` O cargo ocupado foi "${jobTitle}".` : '';
    const prompt = `Melhore a seguinte descrição de experiência profissional para um currículo.${titleContext} Transforme o texto em bullet points (marcadores) curtos e focados em impacto e resultados, usando verbos de ação fortes. Mantenha no idioma em que foi escrito:\n\n"${description}"`;
    return from(this.generateWithGemini(prompt));
  }

  suggestSkills(jobTitle: string): Observable<string[]> {
    return this.http.post<string[]>(`${environment.apiUrl}/ai/suggest-skills`, { jobTitle }).pipe(
      catchError(() => of(['JavaScript', 'Comunicação', 'Resolução de Problemas']))
    );
  }

  matchJobDescription(resumeId: string, jobDescription: string): Observable<MatchResult> {
    return this.http.post<MatchResult>(`${environment.apiUrl}/ai/match-job`, { resumeId, jobDescription });
  }
}
