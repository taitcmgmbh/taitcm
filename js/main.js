/* js/main.js
   - Mobile hamburger menu
   - Active nav highlight
   - Language switch DE <-> EN keeping the same page
   - Works for:
     1) GitHub Pages project site: /taitcm/...
     2) Custom domain root site: /...
*/
(function () {
  "use strict";

  // ---------- A) Detect base path ----------
  function getBasePath() {
    const p = window.location.pathname; // e.g. /taitcm/en/costs.html or /en/costs.html or /index.html
    // ✅ Project-site base (GitHub Pages repo name)
    if (p.startsWith("/taitcm/")) return "/taitcm/";
    // ✅ Custom domain root
    return "/";
  }

  // Normalize path join (avoid double slashes)
  function join(base, path) {
    const b = base.endsWith("/") ? base : base + "/";
    const s = path.startsWith("/") ? path.slice(1) : path;
    return b + s;
  }

  // ✅ Robust: get current page filename
  // Handles:
  // - /taitcm/en/index.html
  // - /taitcm/en/
  // - /en/
  // - /taitcm/
  function getCurrentFile() {
    const base = getBasePath();
    let p = window.location.pathname;

    // Strip base prefix
    if (p.startsWith(base)) p = p.slice(base.length); // e.g. "en/index.html" or "index.html" or "en/"
    p = p.replace(/^\/+/, ""); // remove leading slashes if any

    // If ends with "/" -> treat as index.html
    if (p === "" || p.endsWith("/")) return "index.html";

    const last = p.split("/").pop() || "index.html";

    // If last segment has no ".html" (rare, but can happen) => treat as index.html
    if (!last.includes(".")) return "index.html";

    return last.split("?")[0].split("#")[0];
  }

  // ✅ Robust: is current in EN folder?
  function isEnglishPage() {
    const base = getBasePath();
    return window.location.pathname.startsWith(join(base, "en/"));
  }

  // ---------- B) Hamburger menu ----------
  function initHeaderMenu() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const nav = header.querySelector("#navMenu");
    const toggleBtn = header.querySelector(".menu-toggle");
    if (!nav || !toggleBtn) return;

    // Prevent duplicate listeners (if init called more than once)
    if (toggleBtn.dataset.bound === "1") return;
    toggleBtn.dataset.bound = "1";

    function openMenu() {
      nav.classList.add("show-menu");
      toggleBtn.setAttribute("aria-expanded", "true");
    }
    function closeMenu() {
      nav.classList.remove("show-menu");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
    function toggleMenu(e) {
      e.stopPropagation();
      nav.classList.contains("show-menu") ? closeMenu() : openMenu();
    }

    toggleBtn.addEventListener("click", toggleMenu);
    nav.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", closeMenu);

    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeMenu);
    });
  }

  // ---------- C) Active nav highlight ----------
  function highlightCurrentPage() {
    const currentPage = document.body.dataset.page; // home/costs/about/contact/faq/...
    if (!currentPage) return;

    document.querySelectorAll("#navMenu a[data-page]").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === currentPage);
    });
  }

  // ---------- D) Force rewrite header nav + logo ----------
  function normalizeHeaderNavLinks() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const nav = header.querySelector("#navMenu");
    if (!nav) return;

    const base = getBasePath();
    const isEN = isEnglishPage();

    // Map logical pages -> filenames
    const map = isEN
      ? {
          home: "en/index.html",
          costs: "en/costs.html",
          about: "en/about.html",
          contact: "en/contact.html",
          faq: "en/faq.html",
        }
      : {
          home: "index.html",
          costs: "behandlungskosten.html",
          about: "ueber-mich.html",
          contact: "kontakt.html",
          faq: "faq.html",
        };

    // Force rewrite nav links (ignore whatever is in header.html)
    nav.querySelectorAll("a[data-page]").forEach((a) => {
      const key = a.dataset.page;
      if (!key || !map[key]) return;
      a.href = join(base, map[key]);
    });

    // Force rewrite logo link
    const logoLink = header.querySelector(".logo-link");
    if (logoLink) {
      logoLink.href = join(base, isEN ? "en/index.html" : "index.html");
    }
  }

  // ---------- E) Language switch (DE <-> EN keep same page) ----------
  function updateLangSwitchLinks() {
    const switchEl = document.querySelector(".lang-switch");
    if (!switchEl) return;

    const links = switchEl.querySelectorAll("a");
    const deA = links[0];
    const enA = links[1];
    if (!deA || !enA) return;

    const base = getBasePath();
    const isEN = isEnglishPage();
    const file = getCurrentFile(); // ✅ always "index.html" / "costs.html" etc.

    // DE -> EN mapping
    const deToEn = {
      "index.html": "index.html",
      "behandlungskosten.html": "costs.html",
      "ueber-mich.html": "about.html",
      "kontakt.html": "contact.html",
      "faq.html": "faq.html",
      "impressum.html": "imprint.html",
      "datenschutz.html": "privacy.html",
      "barrierefreiheit.html": "accessibility.html",
    };

    // EN -> DE mapping
    const enToDe = Object.fromEntries(Object.entries(deToEn).map(([de, en]) => [en, de]));

    if (!isEN) {
      // On DE page
      const enFile = deToEn[file] || "index.html";
      deA.href = join(base, file);
      enA.href = join(base, "en/" + enFile);
    } else {
      // On EN page
      const deFile = enToDe[file] || "index.html";
      deA.href = join(base, deFile);
      enA.href = join(base, "en/" + file);
    }

    // If header.html uses href="#" keep it overridden
    if (deA.getAttribute("href") === "#") deA.setAttribute("href", deA.href);
    if (enA.getAttribute("href") === "#") enA.setAttribute("href", enA.href);
  }

  // ---------- Public entry ----------
  window.initSiteHeader = function () {
    initHeaderMenu();
    highlightCurrentPage();
    normalizeHeaderNavLinks();
    updateLangSwitchLinks();
  };
})();
