<div align="center">
  <h1>✨ Prime Resume (Frontend) &bull; Smart-CV</h1>
  <p><strong>A Plataforma Definitiva para Criação de Currículos com Inteligência Artificial & Engenharia de Alta Performance</strong></p>
  <p><em>⚠️ Projeto de vitrine técnica demonstrando padrões avançados em Angular & RxJS. ⚠️</em></p>
</div>

<br />

## 🚀 Visão Geral
O **Prime Resume (Smart-CV)** é uma plataforma premium concebida para orientar profissionais na construção de currículos de impacto, adaptados nativamente para sistemas **ATS (Applicant Tracking Systems)** e com cartas de apresentação customizadas pelo Google Gemini em segundos. 

Mais do que um simples produto visual, o projeto foi arquitetado com base em pilares rigorosos de **Engenharia de Software Sênior, Clean Code e Alta Resiliência Reativa**, combinando interfaces no modo escuro (*Dark Mode*), efeitos de *glassmorphism* e micro-animações com uma das mais modernas suítes de performance no ecossistema **Angular (Zoneless & OnPush)**.

---

## 🏰 Arquitetura & Engenharia de Software Sênior

Este repositório serve como referência na adoção dos melhores padrões de design enterprise e engenharia defensiva, focando em escalabilidade, desacoplamento e performance extrema:

### 1. ⚡ Arquitetura de Alta Performance "Zoneless" + OnPush
* **Fim da Sobrecarga de Mutações (`zone.js`):** A aplicação transicionou para o motor estável do Angular via `provideZonelessChangeDetection()`, abolindo verificação de ciclo impelida por detecção extensiva via monkey-patching do DOM.
* **Granulidade Reativa (Signals & RxJS):** 100% dos componentes operam sob `ChangeDetectionStrategy.OnPush`. O repasse de tela é acionado de maneira estritamente transacional apenas quando fluxos de observables (com o pipe `async`) ou **Angular Signals** emitem novos arranjos imutáveis, elevando a eficiência computacional de CPU a patamares de excelência no Desktop e no Mobile.

### 2. 🛡️ Programação Defensiva & Resiliência TypeScript
* **Proteção contra Falhas no DOM (Nullish Resiliency):** Todos os consumidores de stream e chamadas de API aplicam sistematicamente *Optional Chaining* (`?.`) e *Nullish Coalescing* (`??`).
* **Safe Fallback Streams:** Assinaturas e transformações no RxJS injetam arrays e objetos de fallback reativos (`resumes ?? []` ou `stats ?? defaultStats`), impedindo a quebra de renderização de listas no template (blocos `@for`) frente a falhas momentâneas do servidor ou recebimento de payloads em branco.

### 3. 🔄 Transacionalidade Reativa no RxJS (`finalize`)
* **Engenharia de Ciclo de Vida Reativo:** O encerramento visual do carregamento (*loading spinners*) e liberação de travas de input foram banidos dos *side-effects* avulsos nos callbacks do tipo `next:` ou `error:`.
* **Teardown Determinístico:** Repousam estritamente sobre o operador canônico `.pipe(finalize(() => ...))` do RxJS. Esta arquitetura assegura que as microtarefas do DOM sejam limpas e restabelecidas independentemente de exceções HTTP de backend ou quedas na conexão.

### 4. 🧩 Padrão Arquitetural Adapter / Facade (`NotificationService`)
* **Desacoplamento de Bibliotecas Externas:** A fim de proteger as camadas de apresentação visual da injeção direta de pacotes de terceiros (como `ngx-toastr`), criou-se um adaptador de nível `@core`, o `NotificationService`. Caso o time precise migrar para outra UI Library de feedbacks no futuro, bastará refatorar **1 único arquivo** no sistema.
* **Internacionalização Sem Verbosa Repetição (DRY):** O adaptador encapsula e decodifica nativamente o `TranslateService`, convertendo chaves estáticas ou dicionários reativos bilíngues (`{ pt: string; en: string }`) e sepultando os ternários condicionais e poluentes (`currentLang === 'en' ? ...`) dos componentes de UI.

### 5. 🧪 Suíte de Testes Contínuos com Alta Cobertura (Vitest CI/CD)
* **Qualidade Assegurada no Pipeline:** Desenvolvido sob uma rigorosa esteira de testes orientada a velocidade e blindagem contra regressão de software no motor do **Vitest**.
* **Métricas de CI (Continous Integration):**
  * 📦 **Total de Testes:** `224 testes unitários 100% aprovados`
  * 📂 **Arquivos Testados:** `31 módulos e suítes isoladas`
  * ⏱️ **Velocidade de Teste (Zoneless Engine):** `< 25 segundos` para execução síncrona/assíncrona de todas as rotas reativas de UI e interceptores.
* **Clean Code & SOLID:** Eliminação de dívidas técnicas ou ruídos em comentários explicativos avulsos, provendo um repositório imaculado, auto-explicativo e enterprise-ready.

---

## ✨ Principais Funcionalidades do Produto

- **🤖 Geração de Conteúdo com IA:** Integração nativa ao **Google Gemini** para reescrever, enriquecer com vocabulário corporativo e adaptar suas qualificações profissionais ao cargo almejado.
- **🎨 Templates Premium & Filtrados por ATS:** Modelos sofisticados (com ou sem foto), renderizados dinamicamente através de espaçamentos e fontes variáveis compatíveis com robôs de leitura corporativos.
- **👁️ Visualização em Tempo Real (Preview ao Vivo):** Feedback tátil onde o documento é atualizado no canvas perfeitamente sintonizado com seus inputs.
- **🔥 Análise Crítica com IA (Roast My Resume):** Avaliação de um recrutador virtual implacável, apontando redundâncias de currículo e sugestões urgentes de correção.
- **🔗 Importação do LinkedIn:** Transforme a exportação em PDF crua do seu LinkedIn nativo em um currículo elegante de layout executivo em um clique!
- **✉️ Gerador de Carta de Apresentação:** Criação instantânea de cartas devidamente orientadas às especificidades técnicas descritas na vaga da empresa.
- **🌍 Internacionalização Contínua (i18n):** Mapeamento nativo e instantâneo da UI para o Inglês e o Português sem recarregamentos do DOM.

---

## 🛠️ Stack Tecnológica

* **Framework Core:** Angular (Standalone Components, Signals, Zoneless API)
* **Linguagem Principal:** TypeScript
* **Arquitetura de Estilos:** Vanilla SCSS & Tokens Customizados (Design System sem dependências externas como Tailwind, com controle granular total sobre tokens HSL do Dark Mode)
* **Reatividade & Tratamento de Estados:** Angular Signals + RxJS Canônico (`combineLatest`, `switchMap`, `finalize`, `catchError`)
* **Testes & Integração:** Vitest & Angular Testing TestBed
* **Serviço de Internacionalização (i18n):** `@ngx-translate/core`

---

## 📦 Como Executar e Validar o Repositório

### 1. Pré-requisitos & Instalação
Clone este repositório para o seu ecossistema local e instale todas as dependências tipadas do node:
```bash
git clone https://github.com/PauloCatto/SmartCv-FE.git
cd smart-cv
npm install
```

### 2. Rodando o Servidor de Desenvolvimento
Inicie a aplicação local com otimização em tempo de compilação:
```bash
npm start
```
Abra `http://localhost:4200/` no navegador de sua preferência. A detecção transacional de arquivos cuidará dos hot-reloads ao vivo.

### 3. Executando a Suíte de Testes (CI Ready)
Toque no motor do Vitest para assegurar a aprovação dos 224 testes integrados de unidade:
```bash
# Executa suíte de testes de forma única sem observador contínuo (Padrão para CI/Git Actions):
npm test -- --watch=false

# Ou execute para inspecionar componentes ativamente em tempo de alteração:
npm test
```

---

## 🎨 Filosofia de UX e Micro-animações
Este projeto despreza elementos visuais óbvios. Foi adotada a paleta de cores escuras corporativas acentuada por cores quentes calibradas por contraste de legibilidade, bordas suaves reflexivas em *Glassmorphism*, responsividade a gestos e transições de hover imersivas para engajar ativamente profissionais na busca de suas melhores metas profissionais.

---

<div align="center">
  <p><em>Desenvolvido sob rígidas normas de Arquitetura Sênior por <strong>Paulo Catto</strong> &bull; Smart-CV.</em></p>
</div>
