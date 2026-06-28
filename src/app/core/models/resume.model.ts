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

export interface DashboardStats {
  totalResumes: number;
  plan: 'FREE' | 'PREMIUM';
  aiActive: boolean;
}

export interface TemplateOption {
  id: TemplateType;
  name: string;
  desc: string;
  previewBg: string;
  preview: string;
  customColor?: string;
  customFont?: string;
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'elegance',
    name: 'Elegance',
    desc: 'Clássico e profissional',
    previewBg: 'linear-gradient(135deg, #1e293b, #0f172a)',
    preview: '',
    customColor: '#1e293b',
    customFont: "'Georgia', serif"
  },
  {
    id: 'elegance',
    name: 'Executive Gold',
    desc: 'Corporativo refinado em ouro',
    previewBg: 'linear-gradient(135deg, #d97706, #78350f)',
    preview: '',
    customColor: '#b45309',
    customFont: "'Georgia', serif"
  },
  {
    id: 'modern',
    name: 'Modern Blue',
    desc: 'Criativo com coluna lateral',
    previewBg: 'linear-gradient(135deg, #4c1d95, #1e1b4b)',
    preview: '',
    customColor: '#4f46e5',
    customFont: "'Inter', sans-serif"
  },
  {
    id: 'modern',
    name: 'Modern Teal',
    desc: 'Visual moderno e dinâmico',
    previewBg: 'linear-gradient(135deg, #0d9488, #115e59)',
    preview: '',
    customColor: '#0d9488',
    customFont: "'Inter', sans-serif"
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Ultra limpo e refinado',
    previewBg: 'linear-gradient(135deg, #1f2937, #111827)',
    preview: '',
    customColor: '#1f2937',
    customFont: "'Inter', sans-serif"
  },
  {
    id: 'minimal',
    name: 'Tech Mono',
    desc: 'Estilo clássico de engenharia',
    previewBg: 'linear-gradient(135deg, #0f172a, #020617)',
    preview: '',
    customColor: '#0f172a',
    customFont: "'Courier New', monospace"
  },
  {
    id: 'creative',
    name: 'Creative Rose',
    desc: 'Portfólio arrojado',
    previewBg: 'linear-gradient(135deg, #f43f5e, #be123c)',
    preview: '',
    customColor: '#e11d48',
    customFont: "'Inter', sans-serif"
  },
  {
    id: 'compact',
    name: 'Compact',
    desc: 'Preenchimento horizontal',
    previewBg: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
    preview: '',
    customColor: '#0284c7',
    customFont: "'Inter', sans-serif"
  },
];

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
