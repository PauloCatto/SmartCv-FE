export type TemplateType = 'elegance' | 'modern' | 'minimal' | 'creative' | 'compact';

export interface PersonalInfo {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  bio: string;
  photo?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface Skill {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  category?: string;
}

export interface Resume {
  id: string;
  title: string;
  template: TemplateType;
  colorTheme?: string;
  fontFamily?: string;
  spacingMode?: 'compact' | 'normal' | 'spacious';
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'premium';
}

export const EMPTY_RESUME: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'> = {
  title: 'Meu Currículo',
  template: 'elegance',
  colorTheme: '#1e293b',
  fontFamily: "'Georgia', serif",
  spacingMode: 'normal',
  personalInfo: {
    name: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    bio: '',
    photo: '',
  },
  experience: [],
  education: [],
  skills: [],
};
