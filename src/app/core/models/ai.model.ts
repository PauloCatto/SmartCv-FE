export interface AIResponse {
  result: string;
}

export interface MatchResult {
  matchScore: number;
  missingKeywords: string[];
  suggestedBio: string;
  suggestedExperiences: { id: string; description: string }[];
}
