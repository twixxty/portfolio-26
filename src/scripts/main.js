import Lenis from "lenis";
const urlParams = new URLSearchParams(window.location.search),
    wokeStatus = urlParams.get("w");
"0" === wokeStatus ? localStorage.setItem("wokeDisabled", "true") : "1" === wokeStatus && localStorage.removeItem("wokeDisabled");
const isWokeDisabled = "true" === localStorage.getItem("wokeDisabled"),
    _rawTestimonials = JSON.parse(document.getElementById("testimonialContent")?.dataset.testimonials || "[]"),
    testimonialData = _rawTestimonials.map(e => ({
        ...e,
        quote: isWokeDisabled && e.quoteWoke || e.quote
    })),
    lenis = new Lenis,
    heroTitle = document.querySelector(".hero-title"),
    letters = heroTitle ? Array.from(heroTitle.querySelectorAll("span")) : [],
    topNav = document.getElementById("topNav"),
    navTitle = document.querySelector(".nav-title"),
    reversedLetters = [...letters].reverse(),
    pitchSection = document.querySelector(".pitch-section"),
    pitchWrapper = document.querySelector(".pitch-action-wrapper"),
    pitchWords = document.querySelectorAll(".pitch-word-mask"),
    contactSection = document.querySelector(".contact-section"),
    contentContainer = document.getElementById("testimonialContent"),
    indexEl = document.getElementById("testimonialIndex"),
    progressWrapper = document.querySelector(".testimonial-progress-wrapper"),
    activeCards = new Set;

function updateCardParallax(e) {
    const t = e.querySelector(".project-image");
    if (!t) return;
    const n = .12 * e.getBoundingClientRect().top;
    t.style.transform = `translateY(${n}px) scale(1.05)`
}

function onScrollParallax() {
    for (const e of activeCards) updateCardParallax(e)
}
const cardVisibilityObserver = new IntersectionObserver(e => {
        e.forEach(e => {
            if (e.isIntersecting) activeCards.add(e.target);
            else {
                activeCards.delete(e.target);
                const t = e.target.querySelector(".project-image");
                t && (t.style.transform = "translateY(0px) scale(1.05)")
            }
        })
    }, {
        rootMargin: "100px 0px 100px 0px"
    }),
    cardObserver = new IntersectionObserver(e => {
        e.forEach(e => {
            e.target.classList.toggle("in-view", e.isIntersecting)
        })
    }, {
        threshold: .45
    });
document.querySelectorAll(".project-card, .project-media").forEach(e => {
        cardVisibilityObserver.observe(e), cardObserver.observe(e)
    }),
    lenis.on("scroll", onScrollParallax);
let currentTestimonialIndex = 0,
    testimonialTimeout = null,
    progressAnimationInterval = null,
    isTransitioning = !1,
    triggered = !1;
const triggerThreshold = Math.min(.2 * window.innerHeight, 150);

function splitText(e) {
    if (!e || e.dataset.splitDone) return;
    const t = e.textContent.match(/\S+|\s+/g) || [];
    e.innerHTML = t.map(e => "" === e.trim() ? e : `<span class="word">${e}</span>`).join(""), e.dataset.splitDone = "true"
}

function animateWords(e, t = 0) {
    e.querySelectorAll(".word").forEach((e, n) => {
        e.style.transitionDelay = `${t+60*n}ms`, e.classList.add("show")
    })
}
navTitle?.addEventListener("click", () => {
    lenis.scrollTo(0, {
        duration: .5,
        easing: e => 1 - Math.pow(1 - e, 3)
    })
});
let isPageLoaded = false;
setTimeout(() => {
    isPageLoaded = true;
}, 300);

const baitSwitchObserver = new IntersectionObserver((e, t) => {
        e.forEach(e => {
            if (!isPageLoaded || !e.isIntersecting) return;
            const n = e.target,
                o = n.querySelector(".reveal-wrapper"),
                i = n.querySelector(".fake-word"),
                s = n.querySelector(".real-word"),
                r = n.querySelectorAll(".word");
            if (r.forEach((e, t) => {
                    setTimeout(() => e.classList.add("show"), isWokeDisabled ? 0 : 150 * t)
                }), i && s && o) {
                const e = i.textContent.trim().split("");
                i.innerHTML = "";
                const t = ["#df3454", "#ff9037", "#fddf43", "#85e88d", "#1a85b9", "#8648b5"],
                    n = e.map((e, n) => {
                        const o = document.createElement("span");
                        return o.className = "fake-letter", o.textContent = e, o.style.color = isWokeDisabled ? "inherit" : t[n % t.length], i.appendChild(o), o
                    });
                if (isWokeDisabled) {
                    const e = 0 * r.length + 0;
                    setTimeout(() => {
                        o.classList.add("open-mode"), i.style.opacity = "0", n.forEach((e, t) => {
                            setTimeout(() => e.classList.add("pop"), 0 * t)
                        })
                    }, e), setTimeout(() => {
                        i.style.display = "none", o.classList.remove("open-mode"), s.classList.add("show")
                    }, e + 0 * n.length)
                } else {
                    const e = 150 * r.length + 500;
                    setTimeout(() => {
                        o.classList.add("open-mode"), i.style.opacity = "1", n.forEach((e, t) => {
                            setTimeout(() => e.classList.add("pop"), 120 * t)
                        })
                    }, e), setTimeout(() => {
                        i.style.display = "none", o.classList.remove("open-mode"), s.classList.add("show")
                    }, e + 100 * n.length)
                }
            }
            t.unobserve(n)
        })
    }, {
        threshold: .9
    }),
    heroObserver = new IntersectionObserver((e, t) => {
        e.forEach(e => {
            if (!e.isIntersecting) return;
            setTimeout(() => animateWords(e.target, 0), 800);
            t.unobserve(e.target);
        })
    }, {
        threshold: .7
    });

function updateNavScroll(e, t, n) {
    if (!heroTitle || !topNav) return;
    const o = t && t.top <= 10 && t.bottom > 0,
        i = n && n.top <= 10,
        s = e < triggerThreshold && !o && !i;
    s && !triggered ? (triggered = !0, topNav.classList.add("show"), heroTitle.classList.add("up"), letters.forEach((e, t) => e.style.transitionDelay = 35 * t + "ms"), navTitle?.classList.add("show")) : !s && triggered && (triggered = !1, navTitle?.classList.remove("show"), heroTitle.classList.remove("up"), reversedLetters.forEach((e, t) => e.style.transitionDelay = 35 * t + "ms"), topNav.classList.remove("show"))
}

function splitNavTitle() {
    navTitle && !navTitle.dataset.splitDone && (navTitle.innerHTML = [...navTitle.textContent.trim()].map((e, t) => " " === e ? " " : `<span style="transition-delay:${40*t}ms">${e}</span>`).join(""), navTitle.dataset.splitDone = "true")
}

function updatePitchAndContact() {
    if (!pitchSection) return;
    const e = pitchSection.getBoundingClientRect(),
        t = e.height,
        n = -e.top,
        o = n / (t - window.innerHeight),
        i = pitchSection.querySelector(".pitch-statement");
    if (i && pitchWrapper) {
        let o = 120;
        e.top <= 0 && e.bottom >= 0 ? o = 120 + -.22 * n : e.bottom < 0 && (o = 120 + -.22 * (t - window.innerHeight)), i.style.transform = `translateY(${o}px)`, pitchWrapper.style.transform = `translateY(${o}px)`
    }
    pitchWords.forEach((e, t) => {
        e.classList.toggle("reveal", o >= .05 + .06 * t)
    }), pitchWrapper && pitchWrapper.classList.toggle("reveal", o >= .75);
    const s = Math.max(0, Math.min(1, 1 - e.bottom / window.innerHeight));
    pitchSection.style.transform = `scale(${(1-.1*s).toFixed(4)})`;
    pitchSection.style.transformOrigin = "center top";
    if (contactSection) {
        const t = Math.max(0, Math.min(1, -e.top / (e.height - window.innerHeight)));
        contactSection.style.transform = `translateY(${Math.round(250*t)}px)`
    }
}
let pitchNearViewport = !1;
const pitchObserver = new IntersectionObserver(e => {
    pitchNearViewport = e[0].isIntersecting
}, {
    rootMargin: "200px 0px 200px 0px"
});

function splitTextIntoLines(e) {
    const t = e.split(" "),
        n = [];
    let o = "";
    const i = window.innerWidth < 768 ? 26 : 42;
    return t.forEach(e => {
        (o + e).length > i ? (n.push(o.trim()), o = e + " ") : o += e + " "
    }), o && n.push(o.trim()), n
}

function lockMaxContentHeight() {
    if (!contentContainer) return;
    let e = 0;
    const t = document.createElement("div");
    Object.assign(t.style, {
        position: "absolute",
        visibility: "hidden",
        width: `${contentContainer.clientWidth}px`,
        display: "flex",
        flexDirection: "column",
        gap: "0.3rem"
    }), document.body.appendChild(t), testimonialData.forEach(n => {
        t.innerHTML = "", splitTextIntoLines(n.quote).forEach(e => {
            const n = document.createElement("div");
            n.className = "testimonial-line-box";
            const o = document.createElement("div");
            o.className = "testimonial-line-text in", o.textContent = e, n.appendChild(o), t.appendChild(n)
        });
        const o = document.createElement("div");
        o.className = "testimonial-author-zone", o.innerHTML = '\n <div class="testimonial-author-inner in">\n <div style="height:56px; width:56px;"></div>\n <div><div>M</div><div>C</div></div>\n </div>', t.appendChild(o), e = Math.max(e, t.getBoundingClientRect().height)
    }), document.body.removeChild(t), contentContainer.style.height = `${e}px`
}

function createAndStartNewProgressBar(e) {
    const t = document.createElement("div");
    return t.className = "testimonial-progress-bar", progressWrapper.appendChild(t), requestAnimationFrame(() => {
        t.style.transition = `transform ${e-400}ms linear`, t.style.transform = "scaleX(1)", progressAnimationInterval = setTimeout(() => triggerBarCollapseSequence(t), e - 400)
    }), t
}

function triggerBarCollapseSequence(e) {
    e && (e.style.transition = "none", e.style.transformOrigin = "right center", e.style.transform = "scaleX(1)", requestAnimationFrame(() => {
        e.style.transition = "transform 350ms cubic-bezier(0.4, 0, 0.2, 1)", e.style.transform = "scaleX(0)", setTimeout(() => e.remove(), 350)
    }))
}

function displayTestimonial(e) {
    isTransitioning = !0;
    const t = testimonialData[e];
    indexEl && (indexEl.textContent = `${String(e+1).padStart(2,"0")}/${String(testimonialData.length).padStart(2,"0")}`);
    const n = contentContainer?.querySelector(".testimonial-slide-group");
    clearTimeout(testimonialTimeout);
    let o = 0;
    if (n) {
        const e = n.querySelectorAll(".testimonial-line-text"),
            t = n.querySelector(".testimonial-author-inner"),
            i = n;
        e.forEach((e, t) => {
            setTimeout(() => {
                e.classList.remove("in"), e.classList.add("out")
            }, 45 * t)
        }), t && setTimeout(() => {
            t.classList.remove("in"), t.classList.add("out")
        }, 45 * e.length), o = 45 * e.length + 200, setTimeout(() => i.remove(), o + 100)
    }
    setTimeout(() => renderNewContent(t), Math.max(0, o - 150))
}

function renderNewContent(e) {
    if (!contentContainer) return;
    const t = document.createElement("div");
    t.className = "testimonial-slide-group", splitTextIntoLines(e.quote).forEach(e => {
        const n = document.createElement("div");
        n.className = "testimonial-line-box";
        const o = document.createElement("div");
        o.className = "testimonial-line-text", o.textContent = e, n.appendChild(o), t.appendChild(n)
    });
    const n = document.createElement("div");
    n.className = "testimonial-author-zone", n.innerHTML = `\n <div class="testimonial-author-inner">\n <img src="${e.avatar}" alt="${e.name}" class="testimonial-avatar">\n <div class="testimonial-meta">\n <div class="testimonial-name">${e.name}</div>\n <div class="testimonial-company">${e.company}</div>\n </div>\n </div>\n `, t.appendChild(n), contentContainer.appendChild(t), createAndStartNewProgressBar(e.duration), requestAnimationFrame(() => {
        const e = t.querySelectorAll(".testimonial-line-text");
        e.forEach((e, t) => setTimeout(() => e.classList.add("in"), 45 * t));
        const n = t.querySelector(".testimonial-author-inner");
        n && setTimeout(() => {
            n.classList.add("in"), isTransitioning = !1
        }, 45 * e.length + 50)
    }), testimonialTimeout = setTimeout(() => {
        currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonialData.length, displayTestimonial(currentTestimonialIndex)
    }, e.duration)
}

function navigateTestimonial(e) {
    if (isTransitioning) return;
    isTransitioning = !0, clearTimeout(testimonialTimeout), clearTimeout(progressAnimationInterval);
    let t = (currentTestimonialIndex + e + testimonialData.length) % testimonialData.length;
    const n = progressWrapper.querySelectorAll(".testimonial-progress-bar"),
        o = n[n.length - 1];
    o ? (o.style.transition = "transform 80ms ease-out", o.style.transform = "scaleX(1)", setTimeout(() => {
        triggerBarCollapseSequence(o), currentTestimonialIndex = t, isTransitioning = !1, displayTestimonial(currentTestimonialIndex)
    }, 80)) : (currentTestimonialIndex = t, isTransitioning = !1, displayTestimonial(currentTestimonialIndex))
}

function raf(e) {
    lenis.raf(e);
    const heroRect = heroTitle ? heroTitle.getBoundingClientRect() : null;
    const pitchRect = pitchSection ? pitchSection.getBoundingClientRect() : null;
    const contactRect = contactSection ? contactSection.getBoundingClientRect() : null;
    updateNavScroll(heroRect?.bottom, pitchRect, contactRect);
    if (pitchNearViewport) updatePitchAndContact();
    requestAnimationFrame(raf);
}

pitchSection && pitchObserver.observe(pitchSection), document.getElementById("nextTestimonial")?.addEventListener("click", () => navigateTestimonial(1)), document.getElementById("prevTestimonial")?.addEventListener("click", () => navigateTestimonial(-1)), document.querySelectorAll(".faq-trigger").forEach(e => {
    e.addEventListener("click", () => {
        const t = e.parentElement,
            n = t.classList.contains("active");
        document.querySelectorAll(".faq-item").forEach(e => e.classList.remove("active")), n || t.classList.add("active")
    })
});
document.addEventListener("DOMContentLoaded", () => {
    const e = document.querySelector(".hero-subtext"),
        t = document.getElementById("baitSwitchText"),
        n = document.getElementById("menuBtn"),
        o = document.getElementById("menuOverlay"),
        b = document.getElementById("menuBackdrop"),
        s = document.querySelectorAll(".about-trigger"),
        r = document.getElementById("aboutPanel"),
        a = document.getElementById("panelClose"),
        l = document.getElementById("panelOverlay"),
        c = document.querySelectorAll(".about-word-mask"),
        d = document.querySelectorAll(".contact-trigger"),
        m = document.getElementById("contactPanel"),
        u = document.getElementById("contactClose"),
        p = document.querySelectorAll(".scroll-to-top-trigger");

    let uiHistoryPushed = false;
    const pushUIHistory = () => {
        if (!uiHistoryPushed) {
            history.pushState({ uiOpen: true }, "");
            uiHistoryPushed = true;
        }
    };

    const closeMobileMenu = () => {
        o.classList.remove("open");
        b?.classList.remove("open");
        n?.classList.remove("open");
        n?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open", "mobile-nav-open");
        document.documentElement.style.setProperty("--page-shift-y", "0px");
    };
    const openMobileMenu = () => {
        o.classList.add("open");
        b?.classList.add("open");
        n?.classList.add("open");
        n?.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open", "mobile-nav-open");
        document.documentElement.style.setProperty("--page-shift-y", "50px");
        pushUIHistory();
    };

    let panelCloseTimeout = null;
    const clearAboutPanelContent = () => {
        c.forEach(el => el.querySelectorAll(".word").forEach(w => {
            w.style.transition = "none";
            w.classList.remove("show");
        }));
        r?.querySelectorAll('.panel-img-wipe').forEach(el => {
            el.style.transition = 'none';
            el.style.transitionDelay = '';
            el.classList.remove('visible');
        });
    };

    const v = () => {
        document.documentElement.style.setProperty("--page-shift", "0px");
        r?.classList.remove("open");
        l?.classList.remove("active");
        document.body.classList.remove("menu-open");
        clearTimeout(panelCloseTimeout);
        panelCloseTimeout = setTimeout(clearAboutPanelContent, 850);
    };

    const y = () => {
        document.documentElement.style.setProperty("--page-shift", "0px");
        m?.classList.remove("open");
        r?.classList.contains("open") || l?.classList.remove("active");
        document.body.classList.remove("menu-open");
    };

    const requestCloseAllUI = () => {
        if (uiHistoryPushed) {
            uiHistoryPushed = false;
            history.back();
        } else {
            closeMobileMenu();
            r?.classList.contains("open") && v();
            m?.classList.contains("open") && y();
        }
    };

    window.addEventListener("popstate", () => {
        uiHistoryPushed = false;
        closeMobileMenu();
        r?.classList.contains("open") && v();
        m?.classList.contains("open") && y();
    });

    splitText(e), splitNavTitle(), e && heroObserver.observe(e), t && baitSwitchObserver.observe(t), lockMaxContentHeight(), displayTestimonial(currentTestimonialIndex), document.querySelectorAll('a[href^="#"]').forEach(e => {
        e.addEventListener("click", t => {
            const n = document.querySelector(e.getAttribute("href"));
            n && (t.preventDefault(), lenis.scrollTo(n, {
                duration: 1.2,
                easing: e => 1 - Math.pow(1 - e, 4)
            }), requestCloseAllUI())
        })
    }), n?.addEventListener("click", () => {
        o.classList.contains("open") ? requestCloseAllUI() : openMobileMenu()
    }),
    b?.addEventListener("click", requestCloseAllUI),
    c.forEach(e => {
        splitText(e), e.querySelectorAll(".word").forEach(e => {
            const t = document.createElement("span");
            t.className = "word-wrapper", e.parentNode.insertBefore(t, e), t.appendChild(e)
        })
    });

    const h = e => {
            e && e.preventDefault();
            closeMobileMenu();
            document.documentElement.style.setProperty("--page-shift", "-80px");
            clearTimeout(panelCloseTimeout);
            const panelContent = r?.querySelector('.panel-content');
            if (panelContent) panelContent.scrollTop = 0;
            r?.classList.add("open");
            l?.classList.add("active");
            pushUIHistory();
            c.forEach(el => {
                el.querySelectorAll(".word").forEach(w => {
                    w.style.transition = "none";
                    w.style.transitionDelay = "0ms";
                    w.classList.remove("show");
                });
            });
            r?.querySelectorAll('.panel-img-wipe').forEach(el => {
                el.style.transition = 'none';
                el.style.transitionDelay = '';
                el.classList.remove('visible');
            });
            requestAnimationFrame(() => {
                let t = 0;
                c.forEach(el => {
                    el.querySelectorAll(".word").forEach(w => {
                        w.style.transition = "transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)";
                        w.style.transitionDelay = `${100 + 18 * t++}ms`;
                        w.classList.add("show");
                    });
                });
                r?.querySelectorAll('.panel-img-wipe').forEach((el, i) => {
                    el.style.transition = '';
                    el.style.transitionDelay = `${220 + i * 180}ms`;
                    el.classList.add('visible');
                });
            });
        };
    s.forEach(e => e.addEventListener("click", h)), a?.addEventListener("click", requestCloseAllUI), l?.addEventListener("click", requestCloseAllUI);

    const g = e => {
        e && e.preventDefault();
        closeMobileMenu();
        document.documentElement.style.setProperty("--page-shift", "-80px");
        m?.classList.add("open");
        l?.classList.add("active");
        pushUIHistory();
    };
    d.forEach(e => e.addEventListener("click", g)), u?.addEventListener("click", requestCloseAllUI), window.addEventListener("keydown", e => {
        "Escape" === e.key && (o.classList.contains("open") || r?.classList.contains("open") || m?.classList.contains("open")) && requestCloseAllUI()
    }), p.forEach(e => {
        e.addEventListener("click", e => {
            e.preventDefault();
            document.documentElement.style.setProperty("--page-shift", "0px");
            document.getElementById("contactPanel")?.classList.remove("open");
            document.getElementById("aboutPanel")?.classList.remove("open");
            document.getElementById("panelOverlay")?.classList.remove("active");
            closeMobileMenu();
            if (uiHistoryPushed) { uiHistoryPushed = false; history.back(); }
            lenis.scrollTo(0, {
                duration: 1.5,
                easing: e => Math.min(1, 1.001 - Math.pow(2, -10 * e))
            })
        })
    });
});

const projectCards = document.querySelectorAll(".project-card");
const projectVideos = Array.from(projectCards, (card) =>
    card.querySelector(".project-video")
).filter(Boolean);

const visibleProjectCards = new Set;
const projectVideoObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) visibleProjectCards.add(entry.target);
            else visibleProjectCards.delete(entry.target);
        });

        clearTimeout(projectVideoObserver._pauseTimer);
        if (visibleProjectCards.size > 0) {
            projectVideos.forEach((video) => {
                if (video.paused) video.play().catch(() => {});
            });
        } else {
            projectVideoObserver._pauseTimer = setTimeout(() => {
                if (visibleProjectCards.size === 0) {
                    projectVideos.forEach((video) => video.pause());
                }
            }, 150);
        }
    }, {
        threshold: 0.15
    }
);

projectCards.forEach((card) => projectVideoObserver.observe(card));

const heroOverlayVideo = document.querySelector(".hero-overlay-video");
if (heroOverlayVideo) {
    const heroVideoObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                clearTimeout(heroOverlayVideo._playTimer);
                if (entry.isIntersecting) {
                    heroOverlayVideo._playTimer = setTimeout(() => {
                        heroOverlayVideo.play().catch(() => {});
                    }, 150);
                } else {
                    heroOverlayVideo.pause();
                }
            });
        }, {
            threshold: 0.15
        }
    );
    heroVideoObserver.observe(heroOverlayVideo);
}

window.addEventListener("load", () => {
    setTimeout(() => lenis.resize(), 500);
});

requestAnimationFrame(raf);
