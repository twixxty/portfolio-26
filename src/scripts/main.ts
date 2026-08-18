import Lenis from "lenis";

interface Testimonial {
  quote: string;
  quoteWoke?: string;
  avatar: string;
  name: string;
  company: string;
  duration: number;
}

const urlParams = new URLSearchParams(window.location.search);
const wokeStatus = urlParams.get("w");

if (wokeStatus === "0") {
  localStorage.setItem("wokeDisabled", "true");
} else if (wokeStatus === "1") {
  localStorage.removeItem("wokeDisabled");
}

const isWokeDisabled = localStorage.getItem("wokeDisabled") === "true";

const testimonialContentEl = document.getElementById("testimonialContent");
const rawTestimonials: Testimonial[] = JSON.parse(
  testimonialContentEl?.dataset.testimonials || "[]"
);
const testimonialData: Testimonial[] = rawTestimonials.map((t) => ({
  ...t,
  quote: (isWokeDisabled && t.quoteWoke) || t.quote,
}));

const lenis = new Lenis();

const heroTitle = document.querySelector<HTMLElement>(".hero-title");
const letters: HTMLElement[] = heroTitle
  ? Array.from(heroTitle.querySelectorAll<HTMLElement>("span"))
  : [];
const reversedLetters = [...letters].reverse();

const topNav = document.getElementById("topNav");
const navTitle = document.querySelector<HTMLElement>(".nav-title");

const pitchSection = document.querySelector<HTMLElement>(".pitch-section");
const pitchWrapper = document.querySelector<HTMLElement>(".pitch-action-wrapper");
const pitchStatement = pitchSection?.querySelector<HTMLElement>(".pitch-statement") ?? null;
const pitchWords = document.querySelectorAll<HTMLElement>(".pitch-word-mask");

const contactSection = document.querySelector<HTMLElement>(".contact-section");
const faqSection = document.querySelector<HTMLElement>(".faq-section");

const contentContainer = document.getElementById("testimonialContent");
const indexEl = document.getElementById("testimonialIndex");
const progressWrapper = document.querySelector<HTMLElement>(".testimonial-progress-wrapper");
const prevTestimonialBtn = document.getElementById("prevTestimonial") as HTMLButtonElement | null;
const nextTestimonialBtn = document.getElementById("nextTestimonial") as HTMLButtonElement | null;

const activeCards = new Set<Element>();
const cardImageCache = new WeakMap<Element, HTMLElement | null>();

function getCardImage(card: Element): HTMLElement | null {
  if (cardImageCache.has(card)) {
    return cardImageCache.get(card) ?? null;
  }
  const img = card.querySelector<HTMLElement>(".project-image");
  cardImageCache.set(card, img);
  return img;
}

function isInViewport(el: HTMLElement | null): boolean {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

function onScrollParallax(): void {
  if (!activeCards.size) return;
  const reads: Array<[HTMLElement, number]> = [];
  for (const card of activeCards) {
    const img = getCardImage(card);
    if (img) reads.push([img, 0.12 * card.getBoundingClientRect().top]);
  }
  for (const [img, y] of reads) {
    img.style.transform = `translateY(${y}px) scale(1.05)`;
  }
}

const cardVisibilityObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        activeCards.add(entry.target);
      } else {
        activeCards.delete(entry.target);
        const img = getCardImage(entry.target);
        if (img) img.style.transform = "translateY(0px) scale(1.05)";
      }
    }
  },
  { rootMargin: "100px 0px 100px 0px" }
);

const cardObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      entry.target.classList.toggle("in-view", entry.isIntersecting);
    }
  },
  { threshold: 0.45 }
);

document.querySelectorAll(".project-card, .project-media").forEach((el) => {
  cardVisibilityObserver.observe(el);
  cardObserver.observe(el);
});

lenis.on("scroll", onScrollParallax);

let currentTestimonialIndex = 0;
let testimonialTimeout: ReturnType<typeof setTimeout> | undefined;
let progressAnimationInterval: ReturnType<typeof setTimeout> | undefined;
let isTransitioning = false;
let triggered = false;
let navFreezeActive = false;
let closeAllUI: (() => void) | undefined;
const triggerThreshold = Math.min(0.2 * window.innerHeight, 150);

function splitText(el: HTMLElement | null | undefined): void {
  if (!el || el.dataset.splitDone) return;
  const parts = el.textContent?.match(/\S+|\s+/g) || [];
  el.innerHTML = parts
    .map((part) => (part.trim() === "" ? part : `<span class="word">${part}</span>`))
    .join("");
  el.dataset.splitDone = "true";
}

function animateWords(container: HTMLElement, baseDelay = 0): void {
  container.querySelectorAll<HTMLElement>(".word").forEach((word, i) => {
    word.style.transitionDelay = `${baseDelay + 60 * i}ms`;
    word.classList.add("show");
  });
}

navTitle?.addEventListener("click", () => {
  closeAllUI?.();
  lenis.start();
  lenis.scrollTo(0, {
    duration: 0.5,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
});

let isPageLoaded = false;
setTimeout(() => {
  isPageLoaded = true;
}, 300);

const baitSwitchObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!isPageLoaded || !entry.isIntersecting) return;
      const target = entry.target as HTMLElement;
      const revealWrapper = target.querySelector<HTMLElement>(".reveal-wrapper");
      const fakeWord = target.querySelector<HTMLElement>(".fake-word");
      const realWord = target.querySelector<HTMLElement>(".real-word");
      const words = target.querySelectorAll<HTMLElement>(".word");

      words.forEach((word, i) => {
        setTimeout(() => word.classList.add("show"), isWokeDisabled ? 0 : 150 * i);
      });

      if (fakeWord && realWord && revealWrapper) {
        const chars = (fakeWord.textContent ?? "").trim().split("");
        fakeWord.innerHTML = "";
        const colors = ["#df3454", "#ff9037", "#fddf43", "#85e88d", "#1a85b9", "#8648b5"];
        const letterEls = chars.map((ch, i) => {
          const span = document.createElement("span");
          span.className = "fake-letter";
          span.textContent = ch;
          span.style.color = isWokeDisabled ? "inherit" : colors[i % colors.length];
          fakeWord.appendChild(span);
          return span;
        });

        const revealDelay = isWokeDisabled ? 0 : 150 * words.length + 500;
        const popStagger = isWokeDisabled ? 0 : 120;
        const hideExtra = isWokeDisabled ? 0 : 100;

        setTimeout(() => {
          revealWrapper.classList.add("open-mode");
          fakeWord.style.opacity = isWokeDisabled ? "0" : "1";
          letterEls.forEach((letter, i) => {
            setTimeout(() => letter.classList.add("pop"), popStagger * i);
          });
        }, revealDelay);

        setTimeout(() => {
          fakeWord.style.display = "none";
          revealWrapper.classList.remove("open-mode");
          realWord.classList.add("show");
        }, revealDelay + hideExtra * letterEls.length);
      }

      observer.unobserve(target);
    });
  },
  { threshold: 0.9 }
);

const heroObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target as HTMLElement;
      setTimeout(() => animateWords(target, 0), 800);
      observer.unobserve(target);
    });
  },
  { threshold: 0.7 }
);

function updateNavScroll(
  heroBottom: number | undefined,
  pitchRect: DOMRect | null,
  contactRect: DOMRect | null
): void {
  if (!heroTitle || !topNav) return;
  const pitchOverlapsTop = !!(pitchRect && pitchRect.top <= 10 && pitchRect.bottom > 0);
  const contactOverlapsTop = !!(contactRect && contactRect.top <= 10);
  const shouldShowNav =
    heroBottom !== undefined &&
    heroBottom < triggerThreshold &&
    !pitchOverlapsTop &&
    !contactOverlapsTop;

  if (shouldShowNav && !triggered) {
    triggered = true;
    topNav.classList.add("show");
    heroTitle.classList.add("up");
    letters.forEach((letter, i) => {
      letter.style.transitionDelay = `${35 * i}ms`;
    });
    navTitle?.classList.add("show");
  } else if (!shouldShowNav && triggered) {
    triggered = false;
    navTitle?.classList.remove("show");
    heroTitle.classList.remove("up");
    reversedLetters.forEach((letter, i) => {
      letter.style.transitionDelay = `${35 * i}ms`;
    });
    topNav.classList.remove("show");
    topNav.dispatchEvent(new CustomEvent("navhide"));
  }
}

function splitNavTitle(): void {
  if (!navTitle || navTitle.dataset.splitDone) return;
  const text = navTitle.textContent?.trim() ?? "";
  navTitle.innerHTML = [...text]
    .map((ch, i) => (ch === " " ? " " : `<span style="transition-delay:${40 * i}ms">${ch}</span>`))
    .join("");
  navTitle.dataset.splitDone = "true";
}

let lastPitchTransform = "";
let lastWrapperTransform = "";
let lastScaleTransform = "";
let lastContactTransform = "";

function updatePitchAndContact(precomputedRect?: DOMRect): void {
  if (!pitchSection) return;
  const rect = precomputedRect ?? pitchSection.getBoundingClientRect();
  const height = rect.height;
  const scrolled = -rect.top;
  const progress = scrolled / (height - window.innerHeight);

  if (pitchStatement && pitchWrapper) {
    let offset = 120;
    if (rect.top <= 0 && rect.bottom >= 0) {
      offset = 120 + -0.22 * scrolled;
    } else if (rect.bottom < 0) {
      offset = 120 + -0.22 * (height - window.innerHeight);
    }
    const transform = `translateY(${offset}px)`;
    if (transform !== lastPitchTransform) {
      pitchStatement.style.transform = transform;
      lastPitchTransform = transform;
    }
    if (transform !== lastWrapperTransform) {
      pitchWrapper.style.transform = transform;
      lastWrapperTransform = transform;
    }
  }

  pitchWords.forEach((word, i) => {
    word.classList.toggle("reveal", progress >= 0.05 + 0.06 * i);
  });
  pitchWrapper?.classList.toggle("reveal", progress >= 0.75);

  const scaleProgress = Math.max(0, Math.min(1, 1 - rect.bottom / window.innerHeight));
  const scaleTransform = `scale(${(1 - 0.1 * scaleProgress).toFixed(4)})`;
  if (scaleTransform !== lastScaleTransform) {
    pitchSection.style.transform = scaleTransform;
    pitchSection.style.transformOrigin = "center top";
    lastScaleTransform = scaleTransform;
  }

  if (contactSection) {
    const contactProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
    const contactTransform = `translateY(${Math.round(250 * contactProgress)}px)`;
    if (contactTransform !== lastContactTransform) {
      contactSection.style.transform = contactTransform;
      lastContactTransform = contactTransform;
    }
  }
}

let pitchNearViewport = false;
const pitchObserver = new IntersectionObserver(
  (entries) => {
    pitchNearViewport = entries[0].isIntersecting;
  },
  { rootMargin: "200px 0px 200px 0px" }
);

function splitTextIntoLines(text: string): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  const maxLen = window.innerWidth < 768 ? 26 : 42;
  for (const word of words) {
    if ((current + word).length > maxLen) {
      lines.push(current.trim());
      current = word + " ";
    } else {
      current += word + " ";
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

function lockMaxContentHeight(): void {
  if (!contentContainer) return;
  let maxHeight = 0;
  const measurer = document.createElement("div");
  Object.assign(measurer.style, {
    position: "absolute",
    visibility: "hidden",
    width: `${contentContainer.clientWidth}px`,
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  });
  document.body.appendChild(measurer);

  for (const item of testimonialData) {
    const fragment = document.createDocumentFragment();
    for (const line of splitTextIntoLines(item.quote)) {
      const lineBox = document.createElement("div");
      lineBox.className = "testimonial-line-box";
      const lineText = document.createElement("div");
      lineText.className = "testimonial-line-text in";
      lineText.textContent = line;
      lineBox.appendChild(lineText);
      fragment.appendChild(lineBox);
    }
    const authorZone = document.createElement("div");
    authorZone.className = "testimonial-author-zone";
    authorZone.innerHTML = `
      <div class="testimonial-author-inner in">
        <div style="height:56px; width:56px;"></div>
        <div><div>M</div><div>C</div></div>
      </div>`;
    fragment.appendChild(authorZone);

    measurer.innerHTML = "";
    measurer.appendChild(fragment);
    maxHeight = Math.max(maxHeight, measurer.getBoundingClientRect().height);
  }

  document.body.removeChild(measurer);
  contentContainer.style.height = `${maxHeight}px`;
}

function getCurrentScaleX(el: HTMLElement): number {
  const transform = getComputedStyle(el).transform;
  if (transform === "none") return 0;
  const match = transform.match(/matrix\(([^,]+),/);
  return match ? parseFloat(match[1]) : 1;
}

function createAndStartNewProgressBar(duration: number): HTMLElement | undefined {
  if (!progressWrapper) return undefined;
  const existingBars = progressWrapper.querySelectorAll<HTMLElement>(".testimonial-progress-bar");
  existingBars.forEach((oldBar, i) => {
    if (i < existingBars.length - 1) oldBar.remove();
  });

  const bar = document.createElement("div");
  bar.className = "testimonial-progress-bar";
  progressWrapper.appendChild(bar);
  requestAnimationFrame(() => {
    bar.style.transition = `transform ${duration - 400}ms linear`;
    bar.style.transform = "scaleX(1)";
    progressAnimationInterval = setTimeout(() => triggerBarCollapseSequence(bar), duration - 400);
  });
  return bar;
}

function triggerBarCollapseSequence(bar: HTMLElement | null | undefined): void {
  if (!bar || !progressWrapper) return;
  const scale = getCurrentScaleX(bar);
  const wrapperWidth = progressWrapper.clientWidth;

  bar.style.transition = "none";
  bar.style.transformOrigin = "left center";
  bar.style.transform = `scaleX(${scale})`;
  void bar.offsetWidth;

  requestAnimationFrame(() => {
    bar.style.transition = "transform 380ms cubic-bezier(0.4, 0, 0.2, 1)";
    bar.style.transform = `translateX(${wrapperWidth}px) scaleX(${scale})`;
    setTimeout(() => bar.remove(), 380);
  });
}

function setTransitioning(value: boolean): void {
  isTransitioning = value;
  if (prevTestimonialBtn) prevTestimonialBtn.disabled = value;
  if (nextTestimonialBtn) nextTestimonialBtn.disabled = value;
}

function displayTestimonial(index: number): void {
  if (isTransitioning) return;
  setTransitioning(true);
  const next = testimonialData[index];
  if (indexEl) {
    indexEl.textContent = `${String(index + 1).padStart(2, "0")}/${String(
      testimonialData.length
    ).padStart(2, "0")}`;
  }
  const staleGroups = contentContainer?.querySelectorAll<HTMLElement>(".testimonial-slide-group");
  clearTimeout(testimonialTimeout);
  let outroDuration = 0;

  staleGroups?.forEach((currentGroup) => {
    const lineTexts = currentGroup.querySelectorAll<HTMLElement>(".testimonial-line-text");
    const authorInner = currentGroup.querySelector<HTMLElement>(".testimonial-author-inner");

    lineTexts.forEach((line, i) => {
      setTimeout(() => {
        line.classList.remove("in");
        line.classList.add("out");
      }, 45 * i);
    });

    if (authorInner) {
      setTimeout(() => {
        authorInner.classList.remove("in");
        authorInner.classList.add("out");
      }, 45 * lineTexts.length);
    }

    outroDuration = Math.max(outroDuration, 45 * lineTexts.length + 200);
    setTimeout(() => currentGroup.remove(), 45 * lineTexts.length + 300);
  });

  setTimeout(() => renderNewContent(next), Math.max(0, outroDuration - 150));
}

function renderNewContent(item: Testimonial): void {
  if (!contentContainer) return;
  const group = document.createElement("div");
  group.className = "testimonial-slide-group";
  const fragment = document.createDocumentFragment();

  for (const line of splitTextIntoLines(item.quote)) {
    const lineBox = document.createElement("div");
    lineBox.className = "testimonial-line-box";
    const lineText = document.createElement("div");
    lineText.className = "testimonial-line-text";
    lineText.textContent = line;
    lineBox.appendChild(lineText);
    fragment.appendChild(lineBox);
  }

  const authorZone = document.createElement("div");
  authorZone.className = "testimonial-author-zone";
  authorZone.innerHTML = `
    <div class="testimonial-author-inner">
      <img src="${item.avatar}" alt="${item.name}" class="testimonial-avatar">
      <div class="testimonial-meta">
        <div class="testimonial-name">${item.name}</div>
        <div class="testimonial-company">${item.company}</div>
      </div>
    </div>
  `;
  fragment.appendChild(authorZone);
  group.appendChild(fragment);
  contentContainer.appendChild(group);

  createAndStartNewProgressBar(item.duration);

  requestAnimationFrame(() => {
    const lineTexts = group.querySelectorAll<HTMLElement>(".testimonial-line-text");
    lineTexts.forEach((line, i) => setTimeout(() => line.classList.add("in"), 45 * i));
    const authorInner = group.querySelector<HTMLElement>(".testimonial-author-inner");
    if (authorInner) {
      setTimeout(() => {
        authorInner.classList.add("in");
        setTransitioning(false);
      }, 45 * lineTexts.length + 50);
    }
  });

  testimonialTimeout = setTimeout(() => {
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonialData.length;
    displayTestimonial(currentTestimonialIndex);
  }, item.duration);
}

function navigateTestimonial(direction: 1 | -1): void {
  if (isTransitioning || !progressWrapper) return;
  clearTimeout(testimonialTimeout);
  clearTimeout(progressAnimationInterval);

  const nextIndex =
    (currentTestimonialIndex + direction + testimonialData.length) % testimonialData.length;
  const bars = progressWrapper.querySelectorAll<HTMLElement>(".testimonial-progress-bar");
  const lastBar = bars[bars.length - 1];

  if (lastBar) {
    triggerBarCollapseSequence(lastBar);
  }

  currentTestimonialIndex = nextIndex;
  displayTestimonial(currentTestimonialIndex);
}

function raf(time: number): void {
  lenis.raf(time);

  const heroRect = heroTitle ? heroTitle.getBoundingClientRect() : null;
  const pitchRect = pitchSection ? pitchSection.getBoundingClientRect() : null;
  const contactRect = contactSection ? contactSection.getBoundingClientRect() : null;

  if (!navFreezeActive) {
    updateNavScroll(heroRect?.bottom, pitchRect, contactRect);
  }
  if (pitchNearViewport && pitchRect) updatePitchAndContact(pitchRect);

  requestAnimationFrame(raf);
}

if (pitchSection) pitchObserver.observe(pitchSection);

document.getElementById("nextTestimonial")?.addEventListener("click", () => navigateTestimonial(1));
document.getElementById("prevTestimonial")?.addEventListener("click", () => navigateTestimonial(-1));

document.querySelectorAll<HTMLElement>(".faq-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const item = trigger.parentElement;
    const isActive = item?.classList.contains("active") ?? false;
    document.querySelectorAll(".faq-item").forEach((el) => el.classList.remove("active"));
    if (!isActive) item?.classList.add("active");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const heroSubtext = document.querySelector<HTMLElement>(".hero-subtext");
  const baitSwitchText = document.getElementById("baitSwitchText");
  const menuBtn = document.getElementById("menuBtn");
  const menuOverlay = document.getElementById("menuOverlay");
  const menuBackdrop = document.getElementById("menuBackdrop");
  const aboutTriggers = document.querySelectorAll<HTMLElement>(".about-trigger");
  const aboutPanel = document.getElementById("aboutPanel");
  const panelClose = document.getElementById("panelClose");
  const panelOverlay = document.getElementById("panelOverlay");
  const aboutWordMasks = document.querySelectorAll<HTMLElement>(".about-word-mask");
  const contactTriggers = document.querySelectorAll<HTMLElement>(".contact-trigger");
  const contactPanel = document.getElementById("contactPanel");
  const contactClose = document.getElementById("contactClose");
  const scrollToTopTriggers = document.querySelectorAll<HTMLElement>(".scroll-to-top-trigger");

  if (!menuOverlay) return;

  const pauseLenis = (): void => {
    if (isInViewport(pitchSection) || isInViewport(faqSection)) {
      return;
    }
    lenis.stop();
    navFreezeActive = true;
  };

  const resumeLenisIfAllClosed = (): void => {
    const anyOpen =
      menuOverlay.classList.contains("open") ||
      aboutPanel?.classList.contains("open") ||
      contactPanel?.classList.contains("open");
    navFreezeActive = anyOpen;
    if (!anyOpen) lenis.start();
  };

  let uiHistoryPushed = false;
  const pushUIHistory = (): void => {
    if (!uiHistoryPushed) {
      history.pushState({ uiOpen: true }, "");
      uiHistoryPushed = true;
    }
  };

  const closeMobileMenu = (): void => {
    menuOverlay.classList.remove("open");
    menuBackdrop?.classList.remove("open");
    menuBtn?.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open", "mobile-nav-open");
    document.documentElement.style.setProperty("--page-shift-y", "0px");
    resumeLenisIfAllClosed();
  };

  const openMobileMenu = (): void => {
    pauseLenis();
    menuOverlay.classList.add("open");
    menuBackdrop?.classList.add("open");
    menuBtn?.classList.add("open");
    menuBtn?.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open", "mobile-nav-open");
    document.documentElement.style.setProperty("--page-shift-y", "50px");
    pushUIHistory();
  };

  let panelCloseTimeout: ReturnType<typeof setTimeout> | undefined;

  const clearAboutPanelContent = (): void => {
    aboutWordMasks.forEach((el) =>
      el.querySelectorAll<HTMLElement>(".word").forEach((word) => {
        word.style.transition = "none";
        word.classList.remove("show");
      })
    );
    aboutPanel?.querySelectorAll<HTMLElement>(".panel-img-wipe").forEach((el) => {
      el.style.transition = "none";
      el.style.transitionDelay = "";
      el.classList.remove("visible");
    });
  };

  const closeAboutPanel = (): void => {
    document.documentElement.style.setProperty("--page-shift", "0px");
    aboutPanel?.classList.remove("open");
    panelOverlay?.classList.remove("active");
    document.body.classList.remove("menu-open");
    clearTimeout(panelCloseTimeout);
    panelCloseTimeout = setTimeout(clearAboutPanelContent, 850);
    resumeLenisIfAllClosed();
  };

  const closeContactPanel = (): void => {
    document.documentElement.style.setProperty("--page-shift", "0px");
    contactPanel?.classList.remove("open");
    if (!aboutPanel?.classList.contains("open")) {
      panelOverlay?.classList.remove("active");
    }
    document.body.classList.remove("menu-open");
    resumeLenisIfAllClosed();
  };

  const requestCloseAllUI = (): void => {
    if (uiHistoryPushed) {
      uiHistoryPushed = false;
      history.back();
    } else {
      closeMobileMenu();
      if (aboutPanel?.classList.contains("open")) closeAboutPanel();
      if (contactPanel?.classList.contains("open")) closeContactPanel();
    }
  };
  closeAllUI = requestCloseAllUI;

  window.addEventListener("popstate", () => {
    uiHistoryPushed = false;
    closeMobileMenu();
    if (aboutPanel?.classList.contains("open")) closeAboutPanel();
    if (contactPanel?.classList.contains("open")) closeContactPanel();
  });

  splitText(heroSubtext);
  splitNavTitle();
  if (heroSubtext) heroObserver.observe(heroSubtext);
  if (baitSwitchText) baitSwitchObserver.observe(baitSwitchText);
  lockMaxContentHeight();
  displayTestimonial(currentTestimonialIndex);

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      const target = href ? document.querySelector<HTMLElement>(href) : null;
      if (target) {
        e.preventDefault();
        lenis.start();
        lenis.scrollTo(target, {
          duration: 1.2,
          easing: (t) => 1 - Math.pow(1 - t, 4),
        });
        requestCloseAllUI();
      }
    });
  });

  menuBtn?.addEventListener("click", () => {
    menuOverlay.classList.contains("open") ? requestCloseAllUI() : openMobileMenu();
  });
  menuBackdrop?.addEventListener("click", requestCloseAllUI);

  topNav?.addEventListener("navhide", () => {
    if (!menuOverlay.classList.contains("open")) return;
    if (uiHistoryPushed) {
      uiHistoryPushed = false;
      history.replaceState(null, "");
    }
    closeMobileMenu();
  });

  aboutWordMasks.forEach((el) => {
    splitText(el);
    el.querySelectorAll<HTMLElement>(".word").forEach((word) => {
      const wrapper = document.createElement("span");
      wrapper.className = "word-wrapper";
      word.parentNode?.insertBefore(wrapper, word);
      wrapper.appendChild(word);
    });
  });

  const openAboutPanel = (e?: Event): void => {
    e?.preventDefault();
    closeMobileMenu();
    pauseLenis();
    document.documentElement.style.setProperty("--page-shift", "-80px");
    clearTimeout(panelCloseTimeout);
    const panelContent = aboutPanel?.querySelector<HTMLElement>(".panel-content");
    if (panelContent) panelContent.scrollTop = 0;
    aboutPanel?.classList.add("open");
    panelOverlay?.classList.add("active");
    pushUIHistory();

    aboutWordMasks.forEach((el) => {
      el.querySelectorAll<HTMLElement>(".word").forEach((word) => {
        word.style.transition = "none";
        word.style.transitionDelay = "0ms";
        word.classList.remove("show");
      });
    });
    aboutPanel?.querySelectorAll<HTMLElement>(".panel-img-wipe").forEach((el) => {
      el.style.transition = "none";
      el.style.transitionDelay = "";
      el.classList.remove("visible");
    });

    requestAnimationFrame(() => {
      let i = 0;
      aboutWordMasks.forEach((el) => {
        el.querySelectorAll<HTMLElement>(".word").forEach((word) => {
          word.style.transition = "transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)";
          word.style.transitionDelay = `${100 + 18 * i++}ms`;
          word.classList.add("show");
        });
      });
      aboutPanel?.querySelectorAll<HTMLElement>(".panel-img-wipe").forEach((el, i) => {
        el.style.transition = "";
        el.style.transitionDelay = `${220 + i * 180}ms`;
        el.classList.add("visible");
      });
    });
  };

  aboutTriggers.forEach((el) => el.addEventListener("click", openAboutPanel));
  panelClose?.addEventListener("click", requestCloseAllUI);
  panelOverlay?.addEventListener("click", requestCloseAllUI);

  const openContactPanel = (e?: Event): void => {
    e?.preventDefault();
    closeMobileMenu();
    pauseLenis();
    document.documentElement.style.setProperty("--page-shift", "-80px");
    contactPanel?.classList.add("open");
    panelOverlay?.classList.add("active");
    pushUIHistory();
  };

  contactTriggers.forEach((el) => el.addEventListener("click", openContactPanel));
  contactClose?.addEventListener("click", requestCloseAllUI);

  window.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      (menuOverlay.classList.contains("open") ||
        aboutPanel?.classList.contains("open") ||
        contactPanel?.classList.contains("open"))
    ) {
      requestCloseAllUI();
    }
  });

  scrollToTopTriggers.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      document.documentElement.style.setProperty("--page-shift", "0px");
      contactPanel?.classList.remove("open");
      aboutPanel?.classList.remove("open");
      panelOverlay?.classList.remove("active");
      closeMobileMenu();
      if (uiHistoryPushed) {
        uiHistoryPushed = false;
        history.back();
      }
      lenis.scrollTo(0, {
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    });
  });
});

const videoPlayTimers = new WeakMap<HTMLVideoElement, ReturnType<typeof setTimeout>>();

function schedulePlay(video: HTMLVideoElement, delay: number): void {
  const existing = videoPlayTimers.get(video);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    video.play().catch(() => {});
  }, delay);
  videoPlayTimers.set(video, timer);
}

function cancelPlay(video: HTMLVideoElement): void {
  const existing = videoPlayTimers.get(video);
  if (existing) clearTimeout(existing);
  videoPlayTimers.delete(video);
  video.pause();
}

const projectCards = document.querySelectorAll<HTMLElement>(".project-card");
const projectVideos = Array.from(projectCards, (card) =>
  card.querySelector<HTMLVideoElement>(".project-video")
).filter((video): video is HTMLVideoElement => video !== null);

if (projectCards.length && projectVideos.length) {
  const primeProjectVideos = new IntersectionObserver(
    ([firstEntry], observer) => {
      if (!firstEntry.isIntersecting) return;
      for (const video of projectVideos) {
        video.preload = "auto";
        video.load();
      }
      observer.disconnect();
    },
    { rootMargin: "300px 0px 300px 0px", threshold: 0.01 }
  );
  primeProjectVideos.observe(projectCards[0]);
}

const projectVideoObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const video = (entry.target as HTMLElement).querySelector<HTMLVideoElement>(".project-video");
      if (!video) continue;
      if (entry.isIntersecting) {
        schedulePlay(video, 150);
      } else {
        cancelPlay(video);
      }
    }
  },
  { threshold: 0.15 }
);

projectCards.forEach((card) => projectVideoObserver.observe(card));

const heroOverlayVideo = document.querySelector<HTMLVideoElement>(".hero-overlay-video");
if (heroOverlayVideo) {
  const heroVideoObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          schedulePlay(heroOverlayVideo, 150);
        } else {
          cancelPlay(heroOverlayVideo);
        }
      }
    },
    { threshold: 0.15 }
  );
  heroVideoObserver.observe(heroOverlayVideo);
}

window.addEventListener("load", () => {
  setTimeout(() => lenis.resize(), 500);
});

requestAnimationFrame(raf);