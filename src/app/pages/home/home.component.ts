import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../layout/header/header';
import { FooterComponent } from '../../layout/footer/footer';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  features = [
    {
      title: 'Preview em tempo real',
      desc: 'Veja seu currículo atualizar conforme você digita. Sem surpresas na hora de exportar.',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
      iconBg: 'rgba(99,102,241,0.15)',
    },
    {
      title: 'IA com Gemini',
      desc: 'Melhore textos, gere resumos profissionais e otimize para vagas específicas com IA.',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
      iconBg: 'rgba(139,92,246,0.15)',
    },
    {
      title: 'Exportação PDF',
      desc: 'Exporte seu currículo em PDF com alta qualidade e formatação profissional perfeita.',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
      iconBg: 'rgba(6,182,212,0.15)',
    },
    {
      title: 'ATS Friendly',
      desc: 'Templates otimizados para passar pelos filtros de sistemas de rastreio de candidatos.',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
      iconBg: 'rgba(16,185,129,0.15)',
    },
    {
      title: '5 Templates premium',
      desc: 'Elegance, Modern, Minimal, Creative e Compact. Designs sob medida para todas as carreiras.',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
      iconBg: 'rgba(245,158,11,0.15)',
    },
    {
      title: 'Salvo automaticamente',
      desc: 'Seu currículo é salvo conforme você edita. Nunca perca seu progresso.',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
      iconBg: 'rgba(236,72,153,0.15)',
    },
  ];

  templates = [
    {
      name: 'Elegance',
      desc: 'Clássico e profissional. Perfeito para áreas tradicionais como direito, finanças e RH.',
      featured: false,
      previewBg: 'linear-gradient(135deg, #1e293b, #0f172a)',
      preview: `
        <div style="background:white;width:85%;border-radius:8px;padding:20px;display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;align-items:center;gap:10px;border-bottom:2px solid #1e293b;padding-bottom:12px">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#1e293b,#334155)"></div>
            <div>
              <div style="width:100px;height:8px;background:#1e293b;border-radius:4px;margin-bottom:4px"></div>
              <div style="width:70px;height:6px;background:#94a3b8;border-radius:4px"></div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="width:60px;height:7px;background:#1e293b;border-radius:4px"></div>
            <div style="width:100%;height:5px;background:#e2e8f0;border-radius:4px"></div>
            <div style="width:80%;height:5px;background:#e2e8f0;border-radius:4px"></div>
          </div>
        </div>
      `,
    },
    {
      name: 'Modern',
      desc: 'Moderno e criativo. Ideal para tech, design e startups que valorizam personalidade.',
      featured: true,
      previewBg: 'linear-gradient(135deg, #312e81, #1e1b4b)',
      preview: `
        <div style="background:white;width:85%;border-radius:8px;overflow:hidden;display:flex">
          <div style="width:35%;background:linear-gradient(180deg,#6366f1,#8b5cf6);padding:16px;display:flex;flex-direction:column;gap:8px">
            <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.3)"></div>
            <div style="width:80%;height:6px;background:rgba(255,255,255,0.5);border-radius:4px"></div>
            <div style="width:60%;height:5px;background:rgba(255,255,255,0.3);border-radius:4px"></div>
          </div>
          <div style="flex:1;padding:16px;display:flex;flex-direction:column;gap:8px">
            <div style="width:70%;height:7px;background:#1e293b;border-radius:4px"></div>
            <div style="width:100%;height:5px;background:#e2e8f0;border-radius:4px"></div>
            <div style="width:85%;height:5px;background:#e2e8f0;border-radius:4px"></div>
            <div style="display:flex;gap:4px;margin-top:4px">
              <div style="height:18px;width:50px;background:#ede9fe;border-radius:100px"></div>
              <div style="height:18px;width:40px;background:#ede9fe;border-radius:100px"></div>
            </div>
          </div>
        </div>
      `,
    },
    {
      name: 'Minimal',
      desc: 'Minimalista e limpo. Para quem deixa o conteúdo falar mais alto.',
      featured: false,
      previewBg: 'linear-gradient(135deg, #1f2937, #111827)',
      preview: `
        <div style="background:white;width:85%;border-radius:8px;padding:20px;display:flex;flex-direction:column;gap:14px">
          <div>
            <div style="width:110px;height:10px;background:#111827;border-radius:4px;margin-bottom:6px"></div>
            <div style="width:80px;height:7px;background:#9ca3af;border-radius:4px"></div>
          </div>
          <div style="height:1px;background:#f3f4f6"></div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="width:100%;height:5px;background:#f3f4f6;border-radius:4px"></div>
            <div style="width:75%;height:5px;background:#f3f4f6;border-radius:4px"></div>
            <div style="width:90%;height:5px;background:#f3f4f6;border-radius:4px"></div>
          </div>
        </div>
      `,
    },
    {
      name: 'Creative',
      desc: 'Arrojado e moderno com sidebar direita. Perfeito para marketing, vendas e comunicação.',
      featured: false,
      previewBg: 'linear-gradient(135deg, #f43f5e, #be123c)',
      preview: `
        <div style="background:white;width:85%;border-radius:8px;overflow:hidden;display:flex;justify-content:space-between">
          <div style="flex:1;padding:16px;display:flex;flex-direction:column;gap:8px">
            <div style="width:70%;height:7px;background:#1e293b;border-radius:4px"></div>
            <div style="width:100%;height:5px;background:#e2e8f0;border-radius:4px"></div>
            <div style="width:85%;height:5px;background:#e2e8f0;border-radius:4px"></div>
          </div>
          <div style="width:30%;background:#f8fafc;border-left:1px solid #f1f5f9;padding:16px;display:flex;flex-direction:column;align-items:center;gap:8px">
            <div style="width:30px;height:30px;border-radius:50%;background:#e11d48"></div>
            <div style="width:80%;height:5px;background:#cbd5e1;border-radius:4px"></div>
            <div style="width:60%;height:4px;background:#cbd5e1;border-radius:4px"></div>
          </div>
        </div>
      `,
    },
    {
      name: 'Compact',
      desc: 'Otimizado horizontalmente. Ideal para preencher folhas de forma equilibrada com poucos dados.',
      featured: false,
      previewBg: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
      preview: `
        <div style="background:white;width:85%;border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="width:100px;height:8px;background:#0f172a;border-radius:4px"></div>
            <div style="width:40px;height:6px;background:#94a3b8;border-radius:4px"></div>
          </div>
          <div style="height:1px;background:#f1f5f9"></div>
          <div style="display:flex;gap:8px">
            <div style="flex:1;height:24px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:4px;display:flex;flex-direction:column;gap:3px">
              <div style="width:80%;height:3px;background:#cbd5e1;border-radius:2px"></div>
              <div style="width:60%;height:3px;background:#e2e8f0;border-radius:2px"></div>
            </div>
            <div style="flex:1;height:24px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:4px;display:flex;flex-direction:column;gap:3px">
              <div style="width:80%;height:3px;background:#cbd5e1;border-radius:2px"></div>
              <div style="width:60%;height:3px;background:#e2e8f0;border-radius:2px"></div>
            </div>
          </div>
        </div>
      `,
    },
  ];
}
