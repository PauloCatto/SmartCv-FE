export interface AIResponse {
  result: string;
}

export interface MatchResult {
  matchScore: number;
  missingKeywords: string[];
  suggestedBio: string;
  suggestedExperiences: { id: string; description: string }[];
}

export interface RoastResultPayload {
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  actionableFeedback?: string[];
  overallVerdict?: string;
  summary?: { title?: string; comment?: string; score?: number };
  ats?: { missingKeywords?: string[]; comment?: string; score?: number };
  actionable?: { list?: string[]; comment?: string; score?: number };
  [key: string]: unknown;
}
