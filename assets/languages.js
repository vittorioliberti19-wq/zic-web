(() => {
  const languages = ["es", "en", "it", "fr"];
  const dictionary = window.zicTranslations;
  const normalize = (text) => text.replace(/\s+/g, " ").trim();
  const selector = document.getElementById("language-select");
  const nodes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, [translate="no"], [data-counter]')) continue;
    const original = node.nodeValue;
    if (dictionary[normalize(original)]) nodes.push({ node, original });
  }
  const attributes = [];
  document.querySelectorAll("[alt], [aria-label], [title], [placeholder]").forEach((node) => {
    ["alt", "aria-label", "title", "placeholder"].forEach((name) => {
      if (node.hasAttribute(name)) attributes.push({ node, name, original: node.getAttribute(name) });
    });
  });
  // Keep the submitted project category stable across display languages.
  document.querySelectorAll("form option").forEach((option) => {
    if (!option.hasAttribute("value")) option.value = option.textContent;
  });
  const originalTitle = document.title;
  const description = document.querySelector('meta[name="description"]');
  const originalDescription = description.content;
  const titles = {
    es: originalTitle,
    en: "ZIC | Industrial Construction in Venezuela since 1973",
    it: "ZIC | Costruzioni industriali in Venezuela dal 1973",
    fr: "ZIC | Construction industrielle au Venezuela depuis 1973",
  };
  const descriptions = {
    es: originalDescription,
    en: "ZIC, C.A. — Heavy industrial construction in Venezuela since 1973. Over 450 civil, mechanical, electrical, EPC, pipeline and marine projects.",
    it: "ZIC, C.A. — Costruzioni industriali pesanti in Venezuela dal 1973. Oltre 450 progetti civili, meccanici, elettrici, EPC, di condotte e opere marittime.",
    fr: "ZIC, C.A. — Construction industrielle lourde au Venezuela depuis 1973. Plus de 450 projets civils, mécaniques, électriques, EPC, de canalisations et maritimes.",
  };
  function translate(text, language) {
    if (language === "es") return text;
    const translated = dictionary[normalize(text)]?.[languages.indexOf(language) - 1];
    if (translated) return text.match(/^\s*/)[0] + translated + text.match(/\s*$/)[0];
    if (text.endsWith(" — cliente ZIC")) {
      return text.replace(" — cliente ZIC", { en: " — ZIC client", it: " — cliente ZIC", fr: " — client ZIC" }[language]);
    }
    return text;
  }
  function apply(language) {
    document.documentElement.lang = language;
    selector.value = language;
    nodes.forEach(({ node, original }) => { node.nodeValue = translate(original, language); });
    attributes.forEach(({ node, name, original }) => node.setAttribute(name, translate(original, language)));
    document.title = titles[language];
    description.content = descriptions[language];
    document.querySelector('meta[property="og:locale"]').content = { es: "es_VE", en: "en_US", it: "it_IT", fr: "fr_FR" }[language];
    document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach((meta) => { meta.content = titles[language]; });
    document.querySelectorAll('meta[property="og:description"], meta[name="twitter:description"]').forEach((meta) => { meta.content = descriptions[language]; });
    document.querySelectorAll("[data-counter]").forEach((node) => {
      // Unseen counters still animate when their section enters the viewport.
      if (node.textContent.trim() === "0") return;
      const decimals = Number(node.dataset.decimals || 0);
      node.textContent = Number(node.dataset.counter).toLocaleString(language, {
        minimumFractionDigits: decimals, maximumFractionDigits: decimals,
      });
    });
  }
  let stored;
  try { stored = localStorage.getItem("zic-language"); } catch { /* Storage may be disabled. */ }
  const requested = new URL(location.href).searchParams.get("lang");
  apply(languages.includes(requested) ? requested : languages.includes(stored) ? stored : "es");
  selector.addEventListener("change", () => {
    const language = selector.value;
    apply(language);
    try { localStorage.setItem("zic-language", language); } catch { /* Language still works without storage. */ }
    const url = new URL(location.href);
    if (language === "es") url.searchParams.delete("lang");
    else url.searchParams.set("lang", language);
    history.replaceState(null, "", url);
  });
  const menuButton = document.getElementById("menu-toggle");
  const menu = document.getElementById("site-nav");
  function closeMenu() {
    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }
  menuButton.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  menu.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
      menuButton.focus();
    }
  });
})();
