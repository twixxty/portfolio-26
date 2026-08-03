# twixxty's portfolio

> making sites nobody asked for

live at [twixxt.vercel.app](https://twixxt.vercel.app) (if it's down that's your problem)

---

## what is this

my personal portfolio. it has:

- a hero with cool animations
- a projects section
- a pitch section and testimonials carousel
- an faq section
- other cool stuff

---

## stack

- **astro 7** — because i felt like convenience is bad
- **content collections** — projects/faqs/testimonials live as json under `src/content/`
- **typescript** — `src/scripts/main.ts` does all the animation/interaction wiring, no framework, no bundler config to fight
- **lenis** — for smooth scrolling (and other stuff)
- **node-vibrant** — pulls a hue/saturation from the hero wallpaper and re-hues `colors.css` into a matching palette (`src/scripts/generate-tinted-palette.mjs`), material-you style
- **css** — split into one file per section (base, colors, big-text, nav, hero, projects, testimonials, faq, pitch, contact, panels, buttons, hover states) 

---

## running it locally

```bash
npm install
npm run dev
```

if it doesn't work, that's (again) your problem.

---

## building

```bash
npm run build
npm run preview
```

output goes to `dist/`. deploy it wherever. i use vercel because it's free and i'm broke.

---

## project structure

```
src/
  components/          # Hero, Nav, Panels, Pitch, Projects, FAQ, Testimonials, Contact
  content/
    projects/          # one json per project
    faqs/               # one json per faq
    testimonials/       # one json per testimonial
  content.config.ts     # zod schemas so astro yells at me instead of prod
  layouts/
    Layout.astro        # one layout. just one.
  pages/
    index.astro          # that's it.
  scripts/
    main.ts             # the beast, now in typescript
    generate-tinted-palette.mjs  # re-hues colors.css from the hero wallpaper
  styles/               # one file per section instead of one giant blob
  assets/
    images/             # avif, imported so astro can optimize them
public/
  fonts/                # custom fonts i definitely have a license for
  images/                # avif, used raw where optimization doesn't matter
  videos/                # webm (+ mp4 fallback) because safari is safari
  lenis/                 # smooth scroll library
```

---

## credits

- fonts: stack sans notch, tan moonlight, google sans code, poppins
- smooth scroll: [lenis](https://lenis.darkroom.engineering)
- made by [twixxty](https://github.com/twixxty)
- inspiration: i was bored

---

## license

do whatever you want with it. if it breaks something that's still your problem.
