(function () {
  "use strict";

  function join(base, path) {
    const b = base.endsWith("/") ? base : base + "/";
    const s = path.startsWith("/") ? path.slice(1) : path;
    return b + s;
  }

  function getBasePath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "/";
    if (parts[0] === "en") return "/";
    if (parts[0].endsWith(".html")) return "/";
    if (parts.length >= 2 && parts[1] === "en") return "/" + parts[0] + "/";
    if (parts.length >= 2 && parts[1].endsWith(".html")) return "/" + parts[0] + "/";
    return "/" + parts[0] + "/";
  }

  function getCurrentFile() {
    const p = window.location.pathname;
    const last = p.split("/").filter(Boolean).pop() || "index.html";
    if (!last.includes(".")) return "index.html";
    return last.split("?")[0].split("#")[0];
  }

  function isEnglishPage() {
    const base = getBasePath();
    return window.location.pathname.startsWith(join(base, "en/"));
  }

  /* =============================================
     1) FETCH HEADER
  ============================================= */
  function loadHeader() {
    const el = document.getElementById("header-placeholder");
    if (!el) return;

    fetch("./components/header.html")
      .then(r => {
        if (!r.ok) throw new Error(`Header fetch failed: ${r.status}`);
        return r.text();
      })
      .then(html => {
        el.innerHTML = html;
        // ✅ header 加载完才初始化，确保可见
        el.style.opacity = "1";
        el.style.transform = "none";
        initSiteHeader();
      })
      .catch(err => {
        console.error("Error loading header:", err);
        el.innerHTML = "";
      });
  }

  /* =============================================
     2) FETCH FOOTER
  ============================================= */
  function loadFooter() {
    const el = document.getElementById("footer-placeholder");
    if (!el) return;

    fetch("./components/footer.html")
      .then(r => {
        if (!r.ok) throw new Error(`Footer fetch failed: ${r.status}`);
        return r.text();
      })
      .then(html => {
        el.innerHTML = html;
        // ✅ footer 加载完确保可见
        el.style.opacity = "1";
        el.style.transform = "none";
      })
      .catch(err => {
        console.error("Error loading footer:", err);
        el.innerHTML = "";
      });
  }

  /* =============================================
     3) HAMBURGER MENU
  ============================================= */
  function initHeaderMenu() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const nav = header.querySelector("#navMenu");
    const toggleBtn = header.querySelector(".menu-toggle");
    if (!nav || !toggleBtn) return;

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
    nav.addEventListener("click", e => e.stopPropagation());
    document.addEventListener("click", closeMenu);
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  }

  /* =============================================
     4) ACTIVE NAV HIGHLIGHT
  ============================================= */
  function highlightCurrentPage() {
    const currentPage = document.body.dataset.page;
    if (!currentPage) return;
    document.querySelectorAll("#navMenu a[data-page]").forEach(link => {
      link.classList.toggle("active", link.dataset.page === currentPage);
    });
  }

  /* =============================================
     5) NORMALIZE NAV LINKS
  ============================================= */
  function normalizeHeaderNavLinks() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const nav = header.querySelector("#navMenu");
    if (!nav) return;

    const base = getBasePath();
    const en = isEnglishPage();
    const map = en
      ? { home: "en/index.html", costs: "en/costs.html", about: "en/about.html", contact: "en/contact.html", faq: "en/faq.html" }
      : { home: "index.html", costs: "behandlungskosten.html", about: "ueber-mich.html", contact: "kontakt.html", faq: "faq.html" };

    nav.querySelectorAll("a[data-page]").forEach(a => {
      const key = a.dataset.page;
      if (!key || !map[key]) return;
      a.href = join(base, map[key]);
    });

    const logoLink = header.querySelector(".logo-link");
    if (logoLink) logoLink.href = join(base, en ? "en/index.html" : "index.html");
  }

  /* =============================================
     6) LANGUAGE SWITCH
  ============================================= */
  function updateLangSwitchLinks() {
    const switchEl = document.querySelector(".lang-switch");
    if (!switchEl) return;

    if (switchEl.dataset.bound === "1") return;
    switchEl.dataset.bound = "1";

    const links = switchEl.querySelectorAll("a");
    const deA = links[0];
    const enA = links[1];
    if (!deA || !enA) return;

    const base = getBasePath();
    const en = isEnglishPage();
    const file = getCurrentFile();

    const deToEn = {
      "index.html":            "index.html",
      "behandlungskosten.html":"costs.html",
      "ueber-mich.html":       "about.html",
      "kontakt.html":          "contact.html",
      "faq.html":              "faq.html",
      "impressum.html":        "imprint.html",
      "datenschutz.html":      "privacy.html",
      "barrierefreiheit.html": "accessibility.html",
    };
    const enToDe = Object.fromEntries(
      Object.entries(deToEn).map(([de, enf]) => [enf, de])
    );

    if (!en) {
      const enFile = deToEn[file] || "index.html";
      deA.href = join(base, file);
      enA.href = join(base, "en/" + enFile);
    } else {
      const deFile = enToDe[file] || "index.html";
      deA.href = join(base, deFile);
      enA.href = join(base, "en/" + file);
    }

    [deA, enA].forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        const target = a.href;
        if (target && target !== "#") window.location.href = target;
      });
    });
  }

  /* =============================================
     7) GOOGLE ANALYTICS
  ============================================= */
  function injectGoogleTag() {
    if (window.gtag_injected) return;
    window.gtag_injected = true;

    const GA_ID = "G-Q7RWQDS859";

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID);

    setTimeout(function () {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
      document.head.appendChild(script);
    }, 1000);
  }

  /* =============================================
     8) FAQ ACCORDION
  ============================================= */
  function initFaqAccordion() {
    document.querySelectorAll(".faq-question").forEach(btn => {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.setAttribute("aria-expanded", "false");

      btn.addEventListener("click", () => {
        const isOpen = btn.parentElement.classList.toggle("open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    });
  }

  /* =============================================
     9) SCROLL REVEAL
     ✅ 排除 header/footer placeholder
  ============================================= */
  function initScrollReveal() {
    const selectors = [
      ".feature-box",
      ".card",
      ".clinic-photo",
      ".cert-item",
      ".price-row",
      ".faq-item",
      ".uebermich-section",
      ".spezial-wrapper",
      ".footer-box",
      ".kontakt-container",
    ];

    selectors.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el, i) {
        // ✅ 确保不影响 header/footer placeholder
        if (el.id === "header-placeholder" || el.id === "footer-placeholder") return;
        if (el.closest("#header-placeholder") || el.closest("#footer-placeholder")) return;

        el.classList.add("reveal");
        const delay = Math.min(i * 0.1, 0.4);
        el.style.transitionDelay = delay + "s";
      });
    });

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(function(el) {
      observer.observe(el);
    });
  }

  /* =============================================
     10) PUBLIC ENTRY
  ============================================= */
  window.initSiteHeader = function () {
    initHeaderMenu();
    highlightCurrentPage();
    normalizeHeaderNavLinks();
    updateLangSwitchLinks();
    injectGoogleTag();
  };

  /* =============================================
     11) AUTO-INIT
  ============================================= */
  document.addEventListener("DOMContentLoaded", function () {
    loadHeader();
    loadFooter();
    initFaqAccordion();
    initScrollReveal();
  });

})();
