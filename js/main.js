(function () {
  "use strict";

  function showToast(message) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.hidden = true;
    }, 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok ? Promise.resolve() : Promise.reject();
  }

  function fetchXml(url) {
    return fetch(url, { credentials: "same-origin" }).then(function (res) {
      if (!res.ok) throw new Error("XML load failed: " + url);
      return res.text();
    }).then(function (txt) {
      var p = new DOMParser();
      return p.parseFromString(txt, "application/xml");
    });
  }

  function initNavToggle() {
    var btn = document.getElementById("nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initFabScroll() {
    var b = document.getElementById("fab-scroll");
    if (!b) return;
    b.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initMarqueeFromPortfolioXml() {
    var track = document.getElementById("marquee-track");
    if (!track) return;
    fetchXml("data/portfolio.xml").then(function (doc) {
      var imgs = Array.prototype.map.call(doc.getElementsByTagName("marqueeImage"), function (n) {
        return n.textContent.trim();
      }).filter(Boolean);
      if (!imgs.length) return;
      var frag = document.createDocumentFragment();
      function appendRow() {
        imgs.forEach(function (src) {
          var im = document.createElement("img");
          im.src = src;
          im.alt = "";
          im.loading = "lazy";
          frag.appendChild(im);
        });
      }
      appendRow();
      appendRow();
      track.appendChild(frag);
    }).catch(function () {});
  }

  function initHomeFromSiteXml() {
    var intro = document.getElementById("intro-text");
    var cta = document.getElementById("cta-text");
    var foot = document.getElementById("footer-copy");
    if (!intro && !cta && !foot) return;
    fetchXml("data/site.xml").then(function (doc) {
      var introNode = doc.getElementsByTagName("intro")[0];
      var ctaNode = doc.getElementsByTagName("cta")[0];
      var copyNode = doc.getElementsByTagName("copyright")[0];
      if (intro && introNode) intro.textContent = introNode.textContent.trim();
      if (cta && ctaNode) cta.textContent = ctaNode.textContent.trim();
      if (foot && copyNode) foot.textContent = copyNode.textContent.trim();
    }).catch(function () {
      if (intro) {
        intro.textContent =
          "Привет. Добро пожаловать на мой сайт!\n\nВот уже 2,5 года я влюблена в фотографию...";
      }
      if (cta) {
        cta.textContent =
          "Если вам близко мое виденье и вы хотели бы увидеть меня в качестве вашего фотографа, то свяжитесь со мной любым удобным для вас способом.";
      }
      if (foot) foot.textContent = "© 2026 Angelina Telpuk. Все фотографии защищены авторским правом";
    });
  }

  function initQuestionsAccordion() {
    var root = document.getElementById("faq-accordion");
    if (!root) return;
    fetchXml("data/site.xml").then(function (doc) {
      var items = doc.getElementsByTagName("item");
      Array.prototype.forEach.call(items, function (item, idx) {
        var q = item.getElementsByTagName("question")[0];
        var a = item.getElementsByTagName("answer")[0];
        if (!q || !a) return;
        var wrap = document.createElement("div");
        wrap.className = "accordion__item";
        wrap.dataset.index = String(idx);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "accordion__btn";
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = q.textContent.trim();
        var panel = document.createElement("div");
        panel.className = "accordion__panel";
        var inner = document.createElement("div");
        inner.className = "accordion__panel-inner";
        var body = document.createElement("div");
        body.className = "accordion__body";
        body.textContent = a.textContent.trim();
        inner.appendChild(body);
        panel.appendChild(inner);
        btn.addEventListener("click", function () {
          var wasOpen = wrap.classList.contains("is-open");
          Array.prototype.forEach.call(root.querySelectorAll(".accordion__item"), function (el) {
            el.classList.remove("is-open");
            var b = el.querySelector(".accordion__btn");
            if (b) b.setAttribute("aria-expanded", "false");
          });
          if (!wasOpen) {
            wrap.classList.add("is-open");
            btn.setAttribute("aria-expanded", "true");
          }
        });
        wrap.appendChild(btn);
        wrap.appendChild(panel);
        root.appendChild(wrap);
      });
    }).catch(function () {});
  }

  function initPortfolioPage() {
    var grid = document.getElementById("portfolio-grid");
    if (!grid) return;
    fetchXml("data/portfolio.xml").then(function (doc) {
      var nodes = doc.getElementsByTagName("session");
      Array.prototype.forEach.call(nodes, function (node) {
        var title = node.getAttribute("title") || "Фотосессия";
        var coverEl = node.getElementsByTagName("cover")[0];
        var cover = coverEl ? coverEl.textContent.trim() : "";
        var imgs = Array.prototype.map.call(node.getElementsByTagName("image"), function (n) {
          return n.textContent.trim();
        }).filter(Boolean);
        if (!cover && imgs.length) cover = imgs[0];

        var a = document.createElement("a");
        a.className = "portfolio-card";
        a.href = "gallery.html#" + encodeURIComponent(title);
        a.setAttribute("aria-label", "Открыть галерею: " + title);
        var im = document.createElement("img");
        im.className = "portfolio-card__img";
        im.src = cover;
        im.alt = title;
        im.loading = "lazy";
        var ov = document.createElement("div");
        ov.className = "portfolio-card__overlay";
        ov.textContent = title;
        a.appendChild(im);
        a.appendChild(ov);
        grid.appendChild(a);
      });
    }).catch(function () {});
  }

  function initGalleryPage() {
    var lightbox = document.getElementById("lightbox");
    var lbImg = document.getElementById("lightbox-img");
    var lbCap = document.getElementById("lightbox-cap");
    var lbClose = document.getElementById("lightbox-close");
    var lbPrev = document.getElementById("lightbox-prev");
    var lbNext = document.getElementById("lightbox-next");
    var state = { images: [], title: "", ii: 0 };

    function openAt(i) {
      if (!state.images.length || !lbImg || !lbCap || !lightbox) return;
      state.ii = ((i % state.images.length) + state.images.length) % state.images.length;
      lbImg.src = state.images[state.ii];
      lbImg.alt = state.title;
      lbCap.textContent = state.title + " — " + (state.ii + 1) + " / " + state.images.length;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function closeLb() {
      if (!lightbox || !lbImg) return;
      lightbox.hidden = true;
      document.body.style.overflow = "";
      lbImg.removeAttribute("src");
    }

    if (lbClose) lbClose.addEventListener("click", closeLb);
    if (lightbox) {
      lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLb();
      });
    }
    if (lbPrev) lbPrev.addEventListener("click", function () { openAt(state.ii - 1); });
    if (lbNext) lbNext.addEventListener("click", function () { openAt(state.ii + 1); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox || lightbox.hidden) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") openAt(state.ii - 1);
      if (e.key === "ArrowRight") openAt(state.ii + 1);
    });

    function renderGallery(title, imagePaths) {
      var titleEl = document.getElementById("gallery-title");
      var subEl = document.getElementById("gallery-sub");
      var emptyEl = document.getElementById("gallery-empty");
      var masonry = document.getElementById("gallery-masonry");
      if (!titleEl || !masonry) return;

      state.images = imagePaths;
      state.title = title;
      state.ii = 0;

      if (!title || !imagePaths.length) {
        titleEl.textContent = "Галерея";
        if (subEl) {
          subEl.hidden = false;
          subEl.textContent = "Портфолио";
        }
        if (emptyEl) {
          emptyEl.hidden = false;
          emptyEl.innerHTML = 'Выберите фотосессию в разделе <a href="portfolio.html">Портфолио</a>.';
        }
        masonry.innerHTML = "";
        return;
      }

      if (emptyEl) emptyEl.hidden = true;
      if (subEl) subEl.hidden = true;
      titleEl.textContent = title;

      masonry.innerHTML = "";
      var frag = document.createDocumentFragment();
      imagePaths.forEach(function (src, idx) {
        var fig = document.createElement("figure");
        fig.className = "gallery-masonry__item";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gallery-masonry__btn";
        btn.setAttribute("aria-label", "Увеличить фото " + (idx + 1));
        var im = document.createElement("img");
        im.src = src;
        im.alt = title + ", фото " + (idx + 1);
        im.loading = "lazy";
        btn.appendChild(im);
        btn.addEventListener("click", function () {
          openAt(idx);
        });
        fig.appendChild(btn);
        frag.appendChild(fig);
      });
      masonry.appendChild(frag);
    }

    function loadGalleryFromHash() {
      var raw = window.location.hash.replace(/^#/, "");
      if (!raw) {
        renderGallery("", []);
        return;
      }
      var titleKey = decodeURIComponent(raw.replace(/\+/g, " "));
      fetchXml("data/portfolio.xml").then(function (doc) {
        var nodes = doc.getElementsByTagName("session");
        var found = null;
        Array.prototype.forEach.call(nodes, function (node) {
          var t = node.getAttribute("title") || "";
          if (t === titleKey) found = node;
        });
        if (!found) {
          renderGallery("", []);
          var titleEl = document.getElementById("gallery-title");
          var emptyEl = document.getElementById("gallery-empty");
          if (titleEl) titleEl.textContent = "Не найдено";
          if (emptyEl) {
            emptyEl.hidden = false;
            emptyEl.innerHTML = 'Такой фотосессии нет. Вернитесь в <a href="portfolio.html">Портфолио</a>.';
          }
          return;
        }
        var t = found.getAttribute("title") || "Фотосессия";
        var imgs = Array.prototype.map.call(found.getElementsByTagName("image"), function (n) {
          return n.textContent.trim();
        }).filter(Boolean);
        renderGallery(t, imgs);
      }).catch(function () {
        renderGallery("", []);
      });
    }

    loadGalleryFromHash();
    window.addEventListener("hashchange", loadGalleryFromHash);
  }

  function initPhoneCopy() {
    var btn = document.getElementById("phone-copy");
    var hint = document.getElementById("phone-hint");
    if (!btn) return;
    var num = btn.getAttribute("data-phone") || btn.textContent.trim();
    btn.addEventListener("click", function () {
      copyText(num).then(function () {
        showToast("Номер скопирован");
        if (hint) hint.textContent = "Номер скопирован в буфер обмена";
      }).catch(function () {
        showToast("Не удалось скопировать");
      });
    });
  }

  function initNavActive() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    var href =
      page === "home"
        ? "index.html"
        : page === "portfolio"
          ? "portfolio.html"
          : page === "contacts"
            ? "contacts.html"
            : page === "questions"
              ? "questions.html"
              : page === "gallery"
                ? "portfolio.html"
                : null;
    if (!href) return;
    document.querySelectorAll('.site-nav a[href="' + href + '"]').forEach(function (a) {
      a.classList.add("is-active");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initFabScroll();
    initNavActive();
    var page = document.body.getAttribute("data-page");
    if (page === "home") {
      initMarqueeFromPortfolioXml();
      initHomeFromSiteXml();
    }
    if (page === "questions") {
      initQuestionsAccordion();
    }
    if (page === "portfolio") {
      initPortfolioPage();
    }
    if (page === "gallery") {
      initGalleryPage();
    }
    if (page === "contacts") {
      initPhoneCopy();
    }
  });
})();
