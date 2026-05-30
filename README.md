# 🚀 SmartCV - Gerador Inteligente de Currículos (Frontend)

O **SmartCV** é uma plataforma SaaS moderna e inovadora voltada para a criação de currículos profissionais de alta conversão. Desenvolvido com foco absoluto em **otimização para sistemas ATS (Applicant Tracking Systems)** e alimentado por Inteligência Artificial (Google Gemini), o SmartCV capacita profissionais a criarem currículos visualmente deslumbrantes que se destacam tanto para recrutadores quanto para robôs de triagem.

---

## ⚠️ NOTA DE DESENVOLVIMENTO: FASE 1 (FRONTEND)
> [!IMPORTANT]
> **Status Atual do Projeto**: Esta etapa compreende exclusivamente a construção robusta e completa do **Frontend** da plataforma. 
>
> **Próximos Passos (Roadmap de Fase 2)**:
> 1. **Desenvolvimento do Backend**: API RESTful em Node.js com Express.js.
> 2. **Persistência de Dados**: Banco de dados relacional PostgreSQL (via Neon) com ORM Prisma.
> 3. **Segurança**: Autenticação e proteção de rotas via JWT persistente.
> 4. **Infraestrutura e Deploy**: Deploy automatizado do Frontend na Vercel e Backend na Railway/Render.

---

## ✨ Funcionalidades Principais (Frontend)

* **Live Preview Reativo e à Prova de Falhas**: Visualização instantânea em tempo real de todas as edições feitas no formulário, contendo um sistema de dados fictícios realistas (Mock Fallbacks) reativos baseados em Angular Signals.
* **5 Modelos de Currículo de Alta Fidelidade (Premium Templates)**:
  1. **Elegance**: Clássico, sofisticado e executivo. Perfeito para áreas tradicionais como Direito e Finanças.
  2. **Modern**: Criativo e dinâmico, com uma sidebar no lado esquerdo. Ótimo para Tech, Engenharia e Startups.
  3. **Minimal**: Ultra limpo, focado no conteúdo. Ideal para acadêmicos e pesquisadores.
  4. **Creative**: Ousado e inovador, apresentando uma sidebar assimétrica no lado direito com layouts de grade refinados.
  5. **Compact**: Layout horizontal estruturado, ideal para preencher a folha uniformemente mesmo com poucas informações.
* **Controle Dinâmico de Densidade do Layout (`spacingMode`)**:
  - **Compacto**: Reduz paddings, margens e entrelinhas para currículos longos caberem em uma página.
  - **Padrão**: Layout equilibrado e confortável.
  - **Amplo**: Expande margens, lacunas e fontes para preencher visualmente a folha de maneira uniforme caso o usuário possua poucas experiências.
* **Paleta de Cores e Fontes ATS**: Customizador integrado com 6 presets de cores corporativas harmoniosas e 5 tipografias premium recomendadas para leitura de robôs ATS.
* **Exportação Profissional para PDF**: Geração de arquivos PDF impecáveis a partir do navegador utilizando `html2canvas` e `jsPDF`.

---

## 🛠️ Stack Tecnológica (Frontend)

* **Core**: [Angular Standalone](https://angular.dev/) (Versão 21)
* **Estilização**: Vanilla CSS & SCSS/SASS para máxima flexibilidade e controle estético
* **Gerenciamento de Estado**: Angular Reactive Signals (`signal`, `computed`)
* **Utilitários de PDF**: `jsPDF` e `html2canvas`
* **Testes**: `Vitest` para execução rápida de testes unitários
* **Ícones**: SVG inline personalizados de alta resolução

---

## 📁 Estrutura de Arquivos (Padrões Utilizados)

O frontend foi reestruturado de forma modular e escalável, adotando a clássica arquitetura de 4 arquivos do Angular por componente (HTML, SCSS, TS, SPEC) e separando as responsabilidades de layout global:

```
src/app/
├── core/                  # Guardas, Modelos globais e Serviços centrais
├── features/
│   ├── auth/              # Módulo de Autenticação (Login & Cadastro)
│   ├── dashboard/         # Painel administrativo do usuário
│   └── resume/            # Workspace do Construtor e Live Preview
│       ├── components/    # Templates visuais (Elegance, Modern, Minimal, etc.)
│       └── pages/builder/ # Construtor principal (Passo a passo e Customizadores)
├── layout/                # Casca da aplicação (LayoutComponent, Header, Sidebar, Footer)
└── pages/home/            # Landing page principal
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado em sua máquina.

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/PauloCatto/SmartCv-FE.git
   cd SmartCv-FE
   ```

2. **Instalar Dependências**:
   ```bash
   npm install
   ```

3. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   npm start
   ```
   Acesse a aplicação localmente no endereço `http://localhost:4200/`.

4. **Compilar para Produção**:
   ```bash
   npm run build
   ```
   Os arquivos compilados otimizados serão gerados na pasta `/dist/smart-cv`.
