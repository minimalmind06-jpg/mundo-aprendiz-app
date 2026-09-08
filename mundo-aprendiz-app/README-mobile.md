# Mundo Aprendiz — do browser à App Store e Play Store 📱

Este guia usa o **Capacitor** (da equipa do Ionic) para embrulhar a app web já criada (`www/`) numa app nativa real, instalável nas duas lojas. É a via mais simples: reaproveita 100% do HTML/CSS/JS que já tens, sem reescrever nada.

> Precisas de: um computador com **Node.js** instalado. Para publicar na **App Store**, precisas também de um **Mac** com Xcode (é um requisito da Apple, não há forma de contornar). Para a **Play Store**, um Mac, Windows ou Linux com Android Studio serve.

---

## 0. O que já está preparado neste projeto
- `www/` — a tua app web (HTML/CSS/JS), tal como já tinhas.
- `capacitor.config.json` — configuração base (nome da app, cor de fundo, splash screen).
- `package.json` — lista de dependências do Capacitor.
- `assets/icon.svg` e `assets/splash.svg` — fonte do ícone e do ecrã de arranque, com a mascote da app.

## 1. Instalar as ferramentas
Abre o terminal na pasta do projeto e corre:
```bash
npm install
```

## 2. Adicionar as plataformas nativas
```bash
npx cap add ios
npx cap add android
```
Isto cria as pastas `ios/` e `android/` com projetos nativos completos (Xcode e Android Studio, respetivamente).

> Se só quiseres testar uma plataforma de cada vez, corre apenas o comando correspondente.

## 3. Gerar os ícones e o splash screen
Os ficheiros `assets/icon.svg` e `assets/splash.svg` são a fonte. Converte-os para PNG em alta resolução (1024×1024 para o ícone, 2732×2732 para o splash) — podes usar, por exemplo:
```bash
npx svgexport assets/icon.svg assets/icon.png 1024:1024
npx svgexport assets/splash.svg assets/splash.png 2732:2732
```
(ou abre os `.svg` num editor como o Figma/Inkscape e exporta como PNG nesses tamanhos).

Depois gera automaticamente todos os tamanhos que a Apple e a Google exigem:
```bash
npx @capacitor/assets generate
```

## 4. Sincronizar o código web com os projetos nativos
Sempre que alterares algo em `www/`, corre:
```bash
npx cap sync
```

## 5. Abrir e testar
```bash
npx cap open ios       # abre no Xcode (só em Mac)
npx cap open android   # abre no Android Studio
```
Em cada um, escolhe um simulador/emulador (ou liga o teu telemóvel por USB) e carrega em ▶️ Run para testar a app real no dispositivo.

## 6. Preparar a publicação

### Antes de tudo: identidade da app
No `capacitor.config.json`, troca `"appId": "com.mundoaprendiz.app"` pelo teu próprio identificador único (formato inverso de domínio, ex: `com.<oteunome>.mundoaprendiz`) **antes** de gerares os projetos nativos — depois de criado é trabalhoso mudar.

### Google Play Store (Android)
1. Cria uma conta de programador em https://play.google.com/console (pagamento único de 25 USD).
2. No Android Studio: `Build → Generate Signed Bundle/APK` → cria uma keystore (guarda-a em local seguro, vais precisar dela em todas as atualizações futuras) → gera o `.aab`.
3. Cria a ficha da app na Play Console: nome, descrição, capturas de ecrã (tablet e telemóvel), ícone, categoria "Educação".
4. Como é uma app para crianças, preenche o **questionário "Programa Designed for Families"** e a **Política de Dados para Crianças** — a app não recolhe dados pessoais nem tem anúncios, o que simplifica bastante esta parte.
5. Submete para revisão (normalmente 1–3 dias).

### Apple App Store (iOS)
1. Cria uma conta no Apple Developer Program em https://developer.apple.com (99 USD/ano).
2. No Xcode: define a equipa de assinatura (`Signing & Capabilities`), depois `Product → Archive` para gerar o build.
3. Usa o **App Store Connect** (https://appstoreconnect.apple.com) para criar a ficha da app: nome, descrição, capturas de ecrã, ícone, categoria "Educação".
4. Se quiseres submeter à **categoria Kids** da Apple (recomendada para apps deste género), há regras extra: sem publicidade comportamental, sem links externos não supervisionados, e é preciso declarar os intervalos de idade (2-5, 6-8, 9-11). A app já cumpre estes requisitos por não ter anúncios nem recolha de dados.
5. Envia o build via Xcode Organizer ou Transporter, associa-o à ficha, e submete para revisão (normalmente 1–2 dias).

### Requisito comum às duas lojas: Política de Privacidade
Ambas exigem um link para uma política de privacidade pública, mesmo que a app não recolha dados (o que é o caso aqui — tudo fica guardado só no dispositivo, em `localStorage`). Podes criar uma página simples (ex: no GitHub Pages ou Google Sites) a explicar isso.

---

## Notas importantes
- **Ligação à internet:** a app não precisa de internet para funcionar (tudo corre localmente), mas o ecrã de instalação/loja precisa, como é normal.
- **Narração por voz:** a Web Speech API funciona dentro do Capacitor em Android; no iOS pode ser necessário testar em dispositivo real (alguns simuladores não reproduzem áudio de síntese de voz).
- **Atualizações:** sempre que editares `www/`, repete os passos 4-5 (`cap sync` + rebuild) antes de gerar uma nova versão para as lojas.
