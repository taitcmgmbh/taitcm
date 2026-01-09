(function () {
  "use strict";

  // =========================
  // 0) Helpers
  // =========================
  function safeRemoveListener(el, type, fn, opts) {
    if (!el) return;
    try { el.removeEventListener(type, fn, opts); } catch (e) {}
  }

  // ✅ 计算站点 basePath（兼容 GitHub Pages project: /taitcm/ 以及根域名）
  function getBasePath() {
    // 例：
    // /taitcm/index.html           -> /taitcm/
    // /taitcm/en/index.html        -> /taitcm/
    // /en/index.html               -> /
    // /index.html                  -> /
    const parts = window.location.pathname.split("/").filter(Boolean);

    if (parts.length === 0) return "/";

    const first = parts[0];

    // ✅ 根站点语言目录：/en/xxx -> base "/"
    if (first === "en") return "/";

    // ✅ 根站点：/index.html
    if (first.endsWith(".html")) return "/";

    // ✅ GitHub Pages project：/taitcm/...
    return "/" + first + "/";
  }

  // ✅ 判断是否在英文目录（兼容 /en/xxx 与 /taitcm/en/xxx）
  function isEnglishPath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    // ["en","index.html"] 或 ["taitcm","en","index.html"]
    return (parts[0] === "en") || (parts[1] === "en");
  }

  // ✅ 获取当前文件名（无 query/hash）
  function getCurrentFile() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "index.html";
    return last.split("?")[0].split("#")[0];
  }

  // =========================
  // 1) Hamburger menu
  // =========================
  function initHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const nav = header.querySelector("#navMenu");
    const toggleBtn = header.querySelector(".menu-toggle");
    if (!nav || !toggleBtn) return;

    function openMenu() {
      nav.classList.add("show-menu");
      toggleBtn.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      nav.classList.remove("show-menu");
      toggleBtn.setAttribute("aria-expanded", "false");
    }

    function onToggleClick(e) {
      e.stopPropagation();
      nav.classList.contains("show-menu") ? closeMenu() : openMenu();
    }

    function onNavClick(e) {
      e.stopPropagation();
    }

    function onDocClick() {
      closeMenu();
    }

    function onAnyNavLinkClick() {
      closeMenu();
    }

    // ✅ 防止重复 init 导致监听叠加：用 dataset 标记
    if (header.dataset.headerInited === "1") return;
    header.dataset.headerInited = "1";

    toggleBtn.addEventListener("click", onToggleClick);
    nav.addEventListener("click", onNavClick);
    document.addEventListener("click", onDocClick);

    nav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", onAnyNavLinkClick);
    });
  }

  // =========================
  // 2) Active highlight
  // =========================
  function highlightCurrentPage() {
    const currentPage = document.body.dataset.page;
    if (!currentPage) return;

    document.querySelectorAll("nav a[data-page]").forEach(link => {
      link.classList.toggle("active", link.dataset.page === currentPage);
    });
  }

  // =========================
  // 3) Language switch mapping
  // =========================
  function updateLangSwitchLinks() {
    const switchEl = document.querySelector(".lang-switch");
    if (!switchEl) return;

    const links = switchEl.querySelectorAll("a");
    const deA = links[0]; // 第一个 a = DE
    const enA = links[1]; // 第二个 a = EN
    if (!deA || !enA) return;

    const base = getBasePath();        // "/" 或 "/taitcm/"
    const isEN = isEnglishPath();      // true/false
    const file = getCurrentFile();     // "kontakt.html" / "contact.html" / "index.html"

    // 德语 -> 英文 对应表
    const deToEn = {
      "index.html": "index.html",
      "behandlungskosten.html": "costs.html",
      "ueber-mich.html": "about.html",
      "kontakt.html": "contact.html",
      "faq.html": "faq.html",
      "impressum.html": "imprint.html",
      "datenschutz.html": "privacy.html",
      "barrierefreiheit.html": "accessibility.html"
    };

    // 英文 -> 德语（反转映射）
    const enToDe = Object.fromEntries(
      Object.entries(deToEn).map(([de, en]) => [en, de])
    );

    if (!isEN) {
      // 当前是德语页：EN 跳到对应英文页；DE 保持当前页
      const enFile = deToEn[file] || "index.html";
      deA.href = base + file;
      enA.href = base + "en/" + enFile;
    } else {
      // 当前是英文页：DE 跳到对应德语页；EN 保持当前页
      const deFile = enToDe[file] || "index.html";
      deA.href = base + deFile;
      enA.href = base + "en/" + file;
    }
  }

  // =========================
  // 4) Public entry (call after header fetched)
  // =========================
  window.initSiteHeader = function () {
    initHeader();
    highlightCurrentPage();
    updateLangSwitchLinks();
  };
})();
