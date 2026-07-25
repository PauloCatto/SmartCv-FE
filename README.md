<div align="center">
  <h1>✨ Smart CV &bull; Frontend</h1>
  <p><strong>A Plataforma Definitiva para Criação de Currículos com Inteligência Artificial & Engenharia de Alta Performance</strong></p>
  <p><em>⚠️ Projeto de vitrine técnica demonstrando padrões avançados em Angular & RxJS. ⚠️</em></p>
</div>

<br />

## 🚀 Visão Geral
O **Smart CV** é uma plataforma premium concebida para orientar profissionais na construção de currículos de impacto, adaptados nativamente para sistemas **ATS (Applicant Tracking Systems)** e com cartas de apresentação customizadas pelo Google Gemini em segundos. 

Mais do que um simples produto visual, o projeto foi arquitetado com base em pilares rigorosos de **Engenharia de Software, Clean Code e Resiliência Reativa**, combinando interfaces modernas no modo escuro (*Dark Mode*) com uma das mais avançadas suítes de performance no ecossistema **Angular (Zoneless & OnPush)**.

---

## 🏰 Arquitetura & Padrões de Engenharia

Este repositório serve como referência na adoção dos melhores padrões de design e engenharia defensiva, focando em escalabilidade, desacoplamento e performance extrema:

### 1. ⚡ Arquitetura de Alta Performance "Zoneless" + OnPush
* **Fim da Sobrecarga de Mutações (`zone.js`):** A aplicação transicionou para o motor reativo do Angular via `provideZonelessChangeDetection()`, abolindo a verificação de ciclo impelida por detecção extensiva via monkey-patching do DOM.
* **Granulidade Reativa (Signals & RxJS):** 100% dos componentes operam sob `ChangeDetectionStrategy.OnPush`. A atualização de tela é acionada de maneira estritamente transacional apenas quando fluxos de observables (com o pipe `async`) ou **Angular Signals** emitem novos estados imutáveis, elevando a eficiência computacional ao máximo no Desktop e no Mobile.

### 2. 🔄 Controle de Fluxo & Anti-Race Conditions (`switchMap`, `debounceTime`)
* **Otimização do Editor & Live Preview:** No editor principal (`BuilderComponent`), os eventos de digitação e alteração de formulário são filtrados com `debounceTime` e `distinctUntilChanged`, evitando requisições redundantes em excesso (*HTTP Flooding*) e economizando recursos computacionais.
* **Cancelamento de Chamadas Obsoletas (`switchMap`):** Nas operações assíncronas em cadeia, a adoção estrita do `switchMap` assegura que requisições em andamento sejam imediatamente abortadas caso um novo evento de gatilho ocorra, erradicando completamente problemas de *race condition* no carregamento e salvamento de dados.

### 3. 🌊 Composição & Derivação de Streams (`combineLatest` & `map`)
* **Orquestração Paralela de Dados:** No painel principal (`DashboardComponent`), múltiplas fontes de dados reativos (lista de currículos, métricas de pontuação ATS e estado do perfil) são harmonizadas simbióticamente em uma única *view reativa* utilizando `combineLatest` e operadores de transformação (`map`).
* **Erradicação de Subscricões Imperativas:** Todas as projeções de dados são consumidas de forma declarativa via pipe `async` nos templates HTML. Isso abole o gerenciamento manual de inscrições (`subscribe/unsubscribe`), prevenindo vazamentos de memória (*memory leaks*).

### 4. 🛡️ Gestão de Estado Reativa & Resiliência (`BehaviorSubject`, `catchError`)
* **Single Source of Truth Reativo:** Serviços centrais da aplicação (como `AuthService` e `ResumeService`) são desenhados em torno do padrão de *Reactive State Stores* com `BehaviorSubject`, garantindo acesso síncrono seguro à última emissão sem abrir mão do fluxo contínuo para os consumidores reativos.
* **Fallback & Proteção contra Falhas:** Fluxos de dados consomem sistematicamente operadores defensivos como `catchError`, injetando arrays ou objetos de fallback em caso de falhas de rede (`resumes ?? []` ou streams com `of([])`). Isso mantém a interface estável e interoperável, sem quebrar componentes ou blocos iterativos (`@for`) na UI.

### 5. 🏁 Teardown Determinístico & Ciclo de Vida (`finalize`)
* **Engenharia de Ciclo de Vida Reativo:** O encerramento visual do carregamento (*loading spinners*) e a liberação de travas de botões foram terminantemente removidos de callbacks pontuais e frágeis como `next:` ou `error:`.
* **Garantia de Execução:** Todas as finalizações repousam sobre o operador canônico `.pipe(finalize(() => ...))` do RxJS. Esta arquitetura garante que estados transitórios e microtarefas de UI sejam obrigatoriamente limpos ao final de qualquer fluxo, independentemente do sucesso da chamada HTTP, exceção do servidor ou cancelamento da requisição.

### 6. 🧩 Padrão Arquitetural Adapter / Facade (`NotificationService`)
* **Desacoplamento de Bibliotecas Externas:** A fim de proteger as camadas de visualização do acoplamento direto com pacotes de terceiros (como `ngx-toastr`), criou-se um adaptador na camada `@core`, o `NotificationService`. Caso o time opte por migrar de UI Library no futuro, será necessário alterar **apenas 1 único arquivo** em toda a base de código.
* **Internacionalização Integrada (DRY):** O adaptador consome nativamente o `TranslateService`, resolvendo chaves estáticas ou dicionários reativos bilíngues (`{ pt: string; en: string }`) diretamente no fluxo e eliminando condicionais verbosas e repetitivas nos componentes de interface.

### 7. 🧪 Suíte de Testes Contínuos com Alta Cobertura (Vitest CI/CD)
* **Qualidade Assegurada no Pipeline:** Desenvolvido sob uma rigorosa esteira de testes orientada a velocidade e blindagem contra regressões, alavancando a velocidade do motor do **Vitest**.
* **Métricas do Pipeline de Controle:**
  * 📦 **Total de Testes:** `224 testes unitários 100% aprovados`
  * 📂 **Arquivos Testados:** `31 módulos e suítes isoladas`
  * ⏱️ **Velocidade de Execução:** `< 25 segundos` para a verificação completa de todos os componentes, guardas reativas, interceptores e serviços do sistema.
* **Clean Code & SOLID:** Eliminação de dívidas técnicas ou ruídos e comentários explicativos excessivos, mantendo um código limpo, autoexplicativo e manutenível.

---

## ✨ Principais Funcionalidades do Produto

- **🤖 Geração de Conteúdo com IA:** Integração nativa ao **Google Gemini** para reescrever, enriquecer com vocabulário profissional e adaptar qualificações ao cargo almejado.
- **🎨 Templates Premium & Compatíveis com ATS:** Modelos customizáveis (com ou sem foto), renderizados dinamicamente através de tipografia estruturada compatível com robôs de leitura corporativos.
- **👁️ Visualização em Tempo Real (Live Preview):** Renderização instantânea do documento na interface, perfeitamente sincronizada com a digitação do usuário.
- **🔥 Análise Crítica com IA (Roast My Resume):** Diagnóstico virtual inteligente do currículo, identificando redundâncias e fornecendo sugestões pontuais de melhoria para o mercado.
- **🔗 Importação do LinkedIn:** Conversão da exportação em PDF nativa do LinkedIn em um currículo elegante de layout profissional em um único clique!
- **✉️ Gerador de Carta de Apresentação:** Criação instantânea de cartas de apresentação adaptadas diretamente à descrição técnica das vagas deseadas.
- **🌍 Internacionalização Contínua (i18n):** Mapeamento instantâneo da interface para Inglês e Português sem recarregamento da página ou quebra do DOM.

---

## 🛠️ Stack Tecnológica

* **Framework Core:** Angular (Standalone Components, Signals, Zoneless API)
* **Linguagem Principal:** TypeScript
* **Arquitetura de Estilos:** Vanilla SCSS & Tokens Customizados (Design System leve, escalável e sem dependências externas, com controle total sobre temas no Dark Mode)
* **Reatividade & Gerenciamento de Fluxo:** Angular Signals + RxJS Canônico (`combineLatest`, `switchMap`, `debounceTime`, `distinctUntilChanged`, `BehaviorSubject`, `finalize`, `catchError`)
* **Testes & Integração:** Vitest & Angular Testing TestBed
* **Serviço de Internacionalização (i18n):** `@ngx-translate/core`

---

## 📦 Como Executar e Validar o Repositório

### 1. Pré-requisitos & Instalação
Clone este repositório para o seu ambiente local e instale as dependências:
```bash
git clone https://github.com/PauloCatto/SmartCv-FE.git
cd smart-cv
npm install
```

### 2. Rodando o Servidor de Desenvolvimento
Inicie a aplicação local em modo de desenvolvimento:
```bash
npm start
```
Abra `http://localhost:4200/` no navegador. As alterações nos arquivos acionam o reload de forma contínua e automática.

### 3. Executando a Suíte de Testes (CI Ready)
Utilize o motor do Vitest para assegurar a aprovação dos 224 testes integrados e unitários do projeto:
```bash
# Executa a suíte de testes em modo de verificação única (Ideal para CI / Git Actions):
npm test -- --watch=false

# Ou execute no modo contínuo para inspecionar os testes durante o desenvolvimento:
npm test
```

---

<div align="center">
  <p><em>Desenvolvido sob sólidas práticas de Engenharia de Software por <strong>Paulo Catto</strong> &bull; Smart CV.</em></p>
</div>
