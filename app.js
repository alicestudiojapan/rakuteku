(function () {
  const STORE_KEYS = [
    { key: "amazon", name: "Amazon" },
    { key: "rakuten", name: "楽天" },
    { key: "a8", name: "A8" },
    { key: "moshimo", name: "もしも" }
  ];

  function filled(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function isPublic(product) {
    return product && product.status === "公開";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function storeButton(product, store) {
    const url = product[store.key];
    const clickable = isPublic(product) && filled(url);
    if (clickable) {
      return (
        '<a class="store" href="' + escapeHtml(url.trim()) + '" rel="nofollow sponsored noopener" target="_blank">' +
          '<span class="store__name">' + escapeHtml(store.name) + "</span>" +
        "</a>"
      );
    }
    return (
      '<span class="store store--soon" aria-disabled="true">' +
        '<span class="store__name">' + escapeHtml(store.name) + "</span>" +
        '<span class="store__label"></span>' +
      "</span>"
    );
  }

  function renderProduct(product) {
    const live = isPublic(product);
    const badgeClass = live ? "badge badge--live" : "badge";
    const status = product.status || "準備中";
    return (
      '<article class="card" id="' + escapeHtml(product.id || "") + '">' +
        '<div class="card__top">' +
          "<h3 class=\"card__title\">" + escapeHtml(product.title || "") + "</h3>" +
          '<span class="' + badgeClass + '">' + escapeHtml(status) + "</span>" +
        "</div>" +
        '<p class="card__desc">' + escapeHtml(product.description || "") + "</p>" +
        '<div class="stores">' +
          STORE_KEYS.map(function (store) { return storeButton(product, store); }).join("") +
        "</div>" +
      "</article>"
    );
  }

  function applySite(data) {
    const site = data.site || {};
    if (site.name) {
      document.getElementById("site-name").textContent = site.name;
      document.title = site.name + " リンク集";
    }
    if (site.handle) document.getElementById("site-handle").textContent = site.handle;
    if (site.tagline) document.getElementById("site-tagline").textContent = site.tagline;
  }

  function applyBanner(products) {
    const banner = document.getElementById("preparing-banner");
    if (!banner) return;
    const stillPreparing = (products || []).some(function (p) { return !isPublic(p); });
    banner.hidden = !stillPreparing;
  }

  function applyFooter(data, products) {
    const footer = data.footer || {};
    const affiliate = document.getElementById("footer-affiliate");
    const amazon = document.getElementById("footer-amazon");
    affiliate.textContent = footer.affiliate || "";
    const hasClickableAmazon = (products || []).some(function (p) {
      return isPublic(p) && filled(p.amazon);
    });
    if (hasClickableAmazon && footer.amazon_associate) {
      amazon.textContent = footer.amazon_associate;
      amazon.hidden = false;
    } else {
      amazon.textContent = "";
      amazon.hidden = true;
    }
  }

  function render(data) {
    applySite(data);
    const products = Array.isArray(data.products) ? data.products : [];
    document.getElementById("products").innerHTML = products.map(renderProduct).join("");
    applyBanner(products);
    applyFooter(data, products);
  }

  fetch("./links.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("links.json を読み込めませんでした");
      return res.json();
    })
    .then(render)
    .catch(function (err) {
      document.getElementById("products").innerHTML =
        '<p class="section-title">リンク情報を表示できませんでした。時間をおいて、もう一度お試しください。</p>';
      console.error(err);
    });
})();
