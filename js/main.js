(function () {
  // ---------- 1) 汉堡菜单 + 点击空白关闭 ----------
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

    function toggleMenu(e) {
      e.stopPropagation();
      nav.classList.contains("show-menu") ? closeMenu() : openMenu();
    }

    // 先移除旧监听（避免某些页面重复 init 导致叠加）
    toggleBtn.onclick = null;

    toggleBtn.addEventListener("click", toggleMenu);
    nav.addEventListener("click", e => e.stopPropagation());
    document.addEventListener("click", closeMenu);

    // 点任意菜单链接后自动关闭（手机体验）
    nav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", closeMenu);
    });
  }

  // ---------- 2) 当前页面高亮 ----------
  function highlightCurrentPage() {
    const currentPage = document.body.dataset.page;
    if (!currentPage) return;

    document.querySelectorAll("nav a[data-page]").forEach(link => {
      link.classList.toggle("active", link.dataset.page === currentPage);
    });
  }

  // ---------- 3) 语言切换：保持在对应页面 ----------
  function updateLangSwitchLinks() {
    const switchEl = document.querySelector(".lang-switch");
    if (!switchEl) return;

    const links = switchEl.querySelectorAll("a");
    const deA = links[0]; // 约定：第一个 a = DE
    const enA = links[1]; // 约定：第二个 a = EN
    if (!deA || !enA) return;

    const path = window.location.pathname; // e.g. /kontakt.html 或 /en/contact.html
    const isEN = path.startsWith("/en/");

    // 当前文件名（无 query/hash）
    const file = (path.split("/").pop() || "index.html")
      .split("?")[0]
      .split("#")[0];

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
      deA.href = "/" + file;
      enA.href = "/en/" + enFile;
    } else {
      // 当前是英文页：DE 跳到对应德语页；EN 保持当前页
      const deFile = enToDe[file] || "index.html";
      deA.href = "/" + deFile;
      enA.href = "/en/" + file;
    }
  }

  // ===== 对外入口（header 是 fetch 进来的，所以必须在 header 插入后调用）=====
  window.initSiteHeader = function () {
    initHeader();
    highlightCurrentPage();
    updateLangSwitchLinks();
  };
})();
