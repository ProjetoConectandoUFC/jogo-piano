<div align="center">

<img src="logo.jpeg" alt="Conectando - Ciências, Tecnologias e Artes" width="500"/>

#  Genius no Piano

*Um jogo de ritmo que transforma seu teclado MIDI em uma tela de Genius.*

![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript)
![Web MIDI](https://img.shields.io/badge/Web%20MIDI-API-blueviolet)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

## Funcionalidades:

- **Conexão com teclado MIDI** — detecta automaticamente dispositivos compatíveis (ex: MPK Mini) e exibe o status da conexão em tempo real
- **3 estágios de dificuldade** — melodias com complexidade crescente, do tema simples até a versão completa
- **Modo Playground** — toque o piano livremente, sem regras, ideal para testar o teclado ou aquecer antes da partida
- **Sistema de pontuação por ritmo** — avalia não só se a nota está certa, mas a precisão temporal, gerando uma nota de 0 a 100 e uma classificação (ex: "Maestro")
- **Painel de configurações** — escolha usar a mesma melodia nos 3 níveis e ative/desative o console de observação
- **Modo desenvolvedor** — selecione manualmente qual melodia carregar em cada estágio, sem precisar jogar do início
- **Painel de debug (Observador)** — log em tempo real de eventos MIDI e mudanças de estado do jogo, útil para diagnóstico
- **Feedback visual e sonoro** — confetes, jingles de vitória, derrota e "campeão", com animações reativas ao resultado

## Pré-requisitos

- [Node.js](https://nodejs.org/) e npm instalados
- Um teclado MIDI compatível (testado com MPK Mini)
- Sistema operacional: Windows, macOS ou Linux

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone <url-do-repositorio>
cd genius-no-piano
npm install
```

## Como Executar

```bash
npm start
```

Isso abrirá a janela do aplicativo Electron. Conecte o teclado MIDI antes ou depois de abrir — o status de conexão é atualizado automaticamente.

## Gerando o executável (build)

O projeto usa [electron-builder](https://www.electron.build/) para empacotar a aplicação:

```bash
npm run dist:mac    # gera o instalador para macOS (.dmg)
npm run dist:win    # gera o instalador para Windows (.exe / portátil)
npm run dist:all    # gera para macOS e Windows
```

Os arquivos gerados ficam na pasta `dist/`.

## Estrutura do Projeto

```
├── main.js           # Processo principal do Electron — cria a janela e libera permissões de MIDI
├── preload.js         # Ponte segura entre o processo principal e a interface (sandboxing)
├── index.html          # Estrutura da interface (piano, painéis, overlay de resultado)
├── style.css           # Estilização visual de toda a interface
├── renderer.js         # Orquestrador principal — conecta MIDI, jogo e interface
├── game.js             # Máquina de estados do jogo (partida, pontuação, watchdog de tempo)
├── midi.js             # Comunicação com o teclado MIDI via Web MIDI API
├── piano.js             # Renderização visual do teclado e animação das teclas
├── audio.js             # Motor de som (Web Audio API) — notas, jingles e efeitos
├── confetti.js          # Efeito visual de confetes na vitória do estágio 3
├── debug.js              # Painel de observador — logs em tempo real para diagnóstico
├── playground.js         # Modo livre, sem regras do jogo
└── melodies.js           # Banco de dados das melodias, organizadas por estágio
```

## Como Jogar

1. Conecte um teclado MIDI compatível (ex: MPK Mini) antes ou depois de abrir o aplicativo
2. Aguarde o status no topo da tela mudar para "conectado"
3. Clique em **Iniciar partida**
4. Observe/ouça a demonstração da melodia do estágio atual
5. Reproduza a melodia no teclado dentro do tempo esperado
6. Ao final, veja sua pontuação, estrelas e classificação (ex: "Maestro")
7. Avance pelos 3 estágios — cada um com uma melodia mais complexa

## Modo Desenvolvedor

Para facilitar testes durante o desenvolvimento, o jogo conta com ferramentas extras, acessíveis por atalhos de teclado:

- **D** — abre o seletor de melodias, permitindo escolher manualmente qual música carregar em cada estágio, sem precisar jogar do início
- **ESC** — fecha o seletor de melodias
- **O** — abre/fecha o painel de observador (debug), com log em tempo real de eventos MIDI e mudanças de estado do jogo

O painel de observador também pode ser ativado marcando a opção **"Mostrar console (observador)"** no menu de configurações (ícone ☰ no canto superior esquerdo).

## Créditos

Desenvolvido por **Eduardo Novais**, como parte do projeto **Conectando — Ciências, Tecnologias e Artes**.

Versão atual: `0.2.0`
