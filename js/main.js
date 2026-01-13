/* js/main.js
    - Mobile hamburger menu
    - Active nav highlight
    - Language switch DE <-> EN keeping same page
    - Works for:
      1) GitHub Pages project site: /taitcm/...
      2) Custom domain root site: /...
    - Google Tag dynamic injection (NEW)
*/
(function () {
  "use strict";

  // ---- 0) helpers ----
  function join(base, path) {
    const b = base.endsWith("/") ? base : base + "/";
    const s = path.startsWith("/") ? path.slice(1) : path;
    return b + s;
  }

  // ✅ auto-detect base path
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
    if (p.endsWith("/")) return "index.html";
    const last = (p.split("/").pop() || "index.html").split("?")[0].split("#")[0];
    if (!last.includes(".")) return "index.html";
    return last;
  }

  function isEnglishPage() {
    const base = getBasePath();
    return window.location.pathname.startsWith(join(base, "en/"));
  }

  // ---- 1) hamburger menu ----
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
    nav.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", closeMenu);
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  }

  // ---- 2) active nav highlight ----
  function highlightCurrentPage() {
    const currentPage = document.body.dataset.page;
    if (!currentPage) return;
    document.querySelectorAll("#navMenu a[data-page]").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === currentPage);
    });
  }

  // ---- 3) force rewrite nav links + logo link ----
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
    nav.querySelectorAll("a[data-page]").forEach((a) => {
      const key = a.dataset.page;
      if (!key || !map[key]) return;
      a.href = join(base, map[key]);
    });
    const logoLink = header.querySelector(".logo-link");
    if (logoLink) logoLink.href = join(base, en ? "en/index.html" : "index.html");
  }

  // ---- 4) language switch links ----
  function updateLangSwitchLinks() {
    const switchEl = document.querySelector(".lang-switch");
    if (!switchEl) return;
    const links = switchEl.querySelectorAll("a");
    const deA = links[0];
    const enA = links[1];
    if (!deA || !enA) return;
    const base = getBasePath();
    const en = isEnglishPage();
    const file = getCurrentFile();
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
    const enToDe = Object.fromEntries(Object.entries(deToEn).map(([de, en]) => [en, de]));
    if (!en) {
      const enFile = deToEn[file] || "index.html";
      deA.href = join(base, file);
      enA.href = join(base, "en/" + enFile);
    } else {
      const deFile = enToDe[file] || "index.html";
      deA.href = join(base, deFile);
      enA.href = join(base, "en/" + file);
    }
    [deA, enA].forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = a.href;
        if (target && target !== "#") window.location.href = target;
      });
    });
  }

  // ---- 5) 新增：Google Tag 动态注入 ----
  function injectGoogleTag() {
    // 防止重复注入
    if (window.gtag_injected) return;
    window.gtag_injected = true;

    const GA_ID = 'G-Q7RWQDS859';
    
    // 插入外部脚本
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(script);

    // 初始化数据层
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag; // 暴露到全局

    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  // ---- public entry ----
  window.initSiteHeader = function () {
    initHeaderMenu();
    highlightCurrentPage();
    normalizeHeaderNavLinks();
    updateLangSwitchLinks();
    injectGoogleTag(); // ✅ 在初始化时调用注入逻辑
  };
})();
