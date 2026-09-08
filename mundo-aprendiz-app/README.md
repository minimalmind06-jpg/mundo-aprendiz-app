# Mundo Aprendiz 🌟

App educativa para crianças dos 2 aos 8 anos — MVP funcional, feito em HTML, CSS e JavaScript puro (sem necessidade de instalar dependências).

## O que já está implementado
- Criação e seleção de perfis de crianças (nome, avatar, idade).
- Mapa de aventura com 4 ilhas, todas desbloqueadas.
- **100 jogos no total (25 por área)**, gerados a partir de listas de conteúdo em `js/app.js`:
  - **Letras e Leitura** (25): reconhecimento das letras do alfabeto + identificar a primeira letra de uma palavra.
  - **Números e Matemática** (25): contar até 10, comparar números, somas e subtrações simples.
  - **Lógica e Resolução de Problemas** (25): "qual não pertence ao grupo", sequências/padrões, associação de formas.
  - **O Mundo à Nossa Volta** (25): sons de animais, cores, emoções, dia/noite e estações do ano.
- Narração por voz em todas as atividades (Web Speech API).
- Sistema de estrelas e ecrã de recompensa com confetis.
- **Área dos pais** protegida por uma conta simples: relatório de estrelas/atividades por criança, controlo do tempo de ecrã diário (minutos), botão para repor progresso.
- Guarda tudo em `localStorage` do navegador — não precisa de servidor nem base de dados.

## Como abrir no VS Code (versão web)

1. Descompacta a pasta `mundo-aprendiz` e abre-a no VS Code (`Ficheiro → Abrir Pasta...`).
2. Instala a extensão **Live Server** (de Ritwick Dey) a partir do separador de extensões.
3. Clica com o botão direito em `www/index.html` → **"Open with Live Server"**.
4. A app abre no navegador em `http://127.0.0.1:5500` (ou porta semelhante).

Não é necessário `npm install` nem qualquer build para esta versão web — é HTML/CSS/JS simples.

### Alternativa sem extensões
Podes simplesmente abrir o ficheiro `www/index.html` diretamente no navegador (duplo clique), mas a narração por voz (Web Speech API) funciona melhor quando servido por `http://` em vez de `file://`, por isso o Live Server é recomendado.

## Transformar em app para iOS e Android

Este projeto já está preparado para ser embrulhado com **Capacitor** e publicado na App Store e na Play Store. Consulta o guia completo em [`README-mobile.md`](./README-mobile.md) — cobre desde `npm install` até à submissão nas duas lojas.

## Estrutura de pastas
```
mundo-aprendiz/
├── www/                     # A app web (fonte usada tanto no browser como nas apps nativas)
│   ├── index.html            # Todos os ecrãs da app (perfis, mapa, atividades, modo pais)
│   ├── css/style.css          # Design system: cores, tipografia, layout
│   └── js/app.js               # Toda a lógica: perfis, 100 atividades, pontuação, modo pais
├── assets/
│   ├── icon.svg               # Fonte do ícone da app
│   └── splash.svg             # Fonte do ecrã de arranque (splash screen)
├── capacitor.config.json     # Configuração do Capacitor (nome, cores, splash)
├── package.json               # Dependências para gerar as apps nativas
├── README.md                  # Este ficheiro
└── README-mobile.md          # Guia passo a passo: iOS + Android + lojas
```

## Próximos passos sugeridos
- Adicionar novas atividades: cada área é gerada por uma função `generate*Activities()` em `www/js/app.js` — basta acrescentar itens às listas de dados (ex: `LETTERS_LIST`, `ANIMAL_SOUNDS`, `SHAPES_POOL`) para criar mais jogos automaticamente.
- Substituir os emojis por ilustrações originais (SVG ou PNG) para um visual mais distintivo.
- Adicionar um temporizador real de tempo de ecrã que bloqueia a app ao atingir o limite definido pelos pais.
- Migrar de `localStorage` para uma base de dados (ex: Firebase/Supabase) se quiseres sincronizar o progresso entre vários dispositivos.
- Gravar áudios profissionais em vez da voz sintética do navegador, para uma experiência mais cuidada.

## Nota sobre originalidade
Esta app foi desenhada com nome, mascote, ilustrações e mecânicas próprias — não reproduz o código, os visuais nem os textos de nenhuma app existente.
