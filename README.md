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
  components/    # hero, nav, projects, faq, etc.
  layouts/       # one layout. just one.
  pages/         # index.astro. that's it.
public/
  fonts/         # custom fonts i definitely have a license for
  images/        # avif because i care about performance (sometimes)
  videos/        # webm because i also care about your storage (sometimes)
  lenis/         # smooth scroll library
  styles.css     # the beast
  scripts.js     # also the beast
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
