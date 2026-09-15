// Shared behavior for every page. Pieces that only exist on the homepage
// (scroll-spy, in-page anchors) simply no-op elsewhere.

// Strip UTM params from the address bar — but only after the page has
// fully loaded, so the async Ahrefs analytics script has already
// captured the original URL for attribution.
window.addEventListener("load", () => {
  if (location.search.includes("utm_")) {
    const params = new URLSearchParams(location.search);
    [...params.keys()]
      .filter((k) => k.startsWith("utm_"))
      .forEach((k) => params.delete(k));
    const qs = params.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
  }
});

// A fresh click on a link should land at the top of the new page. Chrome will
// otherwise restore whatever scroll position it remembers for that URL, so
// following "All services" from a deep page can drop you mid-page. Back and
// forward are deliberately left alone — restoring position there is correct.
const navEntry = performance.getEntriesByType("navigation")[0];
if (navEntry && navEntry.type === "navigate" && !location.hash) {
  window.scrollTo(0, 0);
}

// Set current year in footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const headerEl = document.querySelector(".site-header");

// Scroll-spy runs over the section nav (in-page links). The header nav now
// carries page-level links only, so anything with a "#" in it there — just
// Contact — joins in too and highlights like any other section.
const navLinks = document.querySelectorAll(
  '.section-nav a[href^="#"], .site-nav a[href^="#"]'
);
const sectionNav = document.querySelector(".section-nav");
const sections = Array.from(navLinks)
  .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
  .filter(Boolean);

function smoothScrollTo(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const headerOffset = headerEl.offsetHeight + 12;
  const elementPosition = target.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: elementPosition - headerOffset,
    behavior: "smooth",
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const id = this.getAttribute("href").slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    smoothScrollTo(id);
  });
});

// Shrink header + highlight current section on scroll (throttled)
let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    if (window.scrollY > 40) {
      headerEl.classList.add("site-header-scrolled");
    } else {
      headerEl.classList.remove("site-header-scrolled");
    }

    const marker = headerEl.offsetHeight + 40;

    let currentSection = null;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom >= marker) {
        currentSection = section;
        break;
      }
    }

    navLinks.forEach((link) => {
      link.classList.remove("nav-link-active", "section-nav-link-active");
    });
    if (currentSection) {
      document
        .querySelectorAll(`a[href="#${currentSection.id}"]`)
        .forEach((link) => {
          link.classList.add(
            link.classList.contains("section-nav-link")
              ? "section-nav-link-active"
              : "nav-link-active"
          );
        });
    }

    scrollTicking = false;
  });
});

// Scroll-triggered fade-in animations
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".fade-in").forEach((el) => fadeObserver.observe(el));

// Mobile menu toggle
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

function closeMobileMenu() {
  mobileMenuToggle.classList.remove("active");
  mobileMenuToggle.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("active");
  document.body.style.overflow = "";
}

if (mobileMenuToggle && mobileMenu) {
  mobileMenuToggle.addEventListener("click", () => {
    if (mobileMenu.classList.contains("active")) {
      closeMobileMenu();
    } else {
      mobileMenuToggle.classList.add("active");
      mobileMenuToggle.setAttribute("aria-expanded", "true");
      mobileMenu.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  });

  // Close mobile menu when clicking a link; scroll if it's a same-page target
  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      closeMobileMenu();
      if (href.startsWith("#") && document.getElementById(href.slice(1))) {
        e.preventDefault();
        smoothScrollTo(href.slice(1));
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
      closeMobileMenu();
    }
  });
}

// GhostChat trigger
const ghostchatTrigger = document.getElementById("ghostchat-trigger");
if (ghostchatTrigger) {
  ghostchatTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    const bubble = document.getElementById("ghostchat-bubble");
    if (bubble) bubble.click();
  });
}

// Reveal the section nav once the reader reaches the first section. Driven by
// IntersectionObserver rather than the scroll handler so it does not depend on
// scroll events firing. Note the first section must come from the section nav
// itself: `sections` is in DOM order, and the header nav (carrying #contact)
// precedes the section nav, so sections[0] is not the top of the page.
if (sectionNav) {
  const firstLink = sectionNav.querySelector('a[href^="#"]');
  const firstTarget =
    firstLink && document.getElementById(firstLink.getAttribute("href").slice(1));

  if (firstTarget) {
    const reveal = new IntersectionObserver(
      ([entry]) => {
        sectionNav.classList.toggle(
          "section-nav-visible",
          entry.boundingClientRect.top <= 90
        );
      },
      { rootMargin: "-90px 0px 0px 0px", threshold: 0 }
    );
    reveal.observe(firstTarget);
  }
}
