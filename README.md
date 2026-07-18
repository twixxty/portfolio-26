# twixxty's portfolio

> making sites nobody asked for

live at [twixxt.vercel.app](https://twixxt.vercel.app) (if it's down that's your problem)

---

## what is this

my personal portfolio. it has:

- a uhh hero with cool animations on it
- projects section
- other cool stuff

---

## stack

- **astro** — because i felt like convenience is bad
- **content collections** — projects/faqs/testimonials live as json, astro validates them so i stop typo-ing my own data
- **lenis** — for smooth scrolling (and other stuff)
- **vanilla js** — yes really
- **css** — approximately 33,000 bytes of it. don't ask

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
  components/         # Hero, Nav, Panels, Pitch, Projects, FAQ, Testimonials, Contact
  content/
    projects/         # one json per project
    faqs/              # one json per faq
    testimonials/      # one json per testimonial
  content.config.ts    # schemas so astro yells at me instead of prod
  layouts/             # one layout. just one.
  pages/               # index.astro. that's it.
  scripts/
    main.js            # the beast
  styles/
    global.css         # the other beast
  assets/
    images/            # avif, imported so astro can optimize them
public/
  fonts/               # custom fonts i definitely have a license for
  images/              # avif, used raw where optimization doesn't matter
  videos/              # webm (+ mp4 fallback) because safari is safari
  lenis/               # smooth scroll library
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
