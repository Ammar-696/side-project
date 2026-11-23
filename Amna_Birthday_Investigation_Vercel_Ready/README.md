# The Curious Case of Amna 🔎🎂

A self-contained, mobile-first birthday investigation website for Amna. No personal photos, no backend, and no paid services required.

## What's included
- Seven story scenes: classified opening → suspect file → swipeable charges → evidence locker → interrogation → verdict → birthday surprise.
- Interactive hold-to-scan fingerprint (plus skip option), declassifiable evidence, multiple-choice interrogation, and birthday letter.
- Original SVG drawings, optional synthesized sound effects (off by default), responsive styles, share button, and confetti.
- Designed for phones, but works on desktop too. Supports reduced-motion preferences.

## Deploy to Vercel (no build step)

1. Unzip the archive.
2. Go to https://vercel.com/new and sign in.
3. Choose **Add New → Project**, import your Git repository containing these files, or use the Vercel CLI as shown below.
4. Framework Preset: **Other**. Root Directory: the folder containing `index.html`.
5. No build command, output directory, API keys, or environment variables needed.
6. Click **Deploy**.

### Optional CLI deployment
Install Node.js, then in this folder run:

```bash
npx vercel
```

Follow the prompts. Once configured, deploy to production with:

```bash
npx vercel --prod
```

## Local preview
Open `index.html` in a modern browser, or run a simple local server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## Customizing
- `index.html`: headings, suspect profile, evidence texts, and final birthday letter.
- `script.js`: charges and interrogation questions / answers.
- `styles.css`: palette, animation, layout.
- `assets/`: favicon and social preview image. No real photos are used.

The website does not request, collect, or store answers. It has no analytics or database. External Google Fonts are optional; system fallbacks work if offline. On mobile, sound plays only after the visitor enables it.

**Privacy:** This is a public webpage once deployed. Avoid including sensitive information or jokes your friend wouldn't want publicly accessible.
