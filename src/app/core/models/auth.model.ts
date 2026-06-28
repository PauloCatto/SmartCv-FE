export interface BackendUser {
  id: string;
  name: string;
  email: string;
  plan: 'FREE' | 'PREMIUM';
}

export interface AuthResponse {
  user: BackendUser;
  token: string;
}
