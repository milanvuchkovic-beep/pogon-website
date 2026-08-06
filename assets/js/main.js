(() => {
  const supportedLanguages = ["sr", "en", "it"];
  const documentLanguage = document.documentElement.lang.toLowerCase().split("-")[0];
  const lang = supportedLanguages.includes(documentLanguage) ? documentLanguage : "sr";
  const menuButton = document.querySelector(".menu-toggle");
  const panel = document.querySelector("#primary-menu");
  const menuText = menuButton?.querySelector(".sr-only");
  const menuLabels = {
    sr: { open: "Otvori meni", close: "Zatvori meni" },
    en: { open: "Open menu", close: "Close menu" },
    it: { open: "Apri menu", close: "Chiudi menu" }
  };

  function setMenu(open, restoreFocus = false) {
    if (!menuButton || !panel) return;
    panel.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    if (menuText) menuText.textContent = open ? menuLabels[lang].close : menuLabels[lang].open;
    if (!open && restoreFocus) menuButton.focus();
  }

  if (menuButton && panel) {
    menuButton.addEventListener("click", () => {
      setMenu(!panel.classList.contains("open"));
    });

    panel.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        setMenu(false);
      }
    });

    document.addEventListener("click", (event) => {
      if (!panel.classList.contains("open")) return;
      if (event.target instanceof Node && panel.contains(event.target)) return;
      if (event.target instanceof Node && menuButton.contains(event.target)) return;
      setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel.classList.contains("open")) {
        setMenu(false, true);
      }
    });

    const desktopQuery = window.matchMedia("(min-width: 1081px)");
    const handleDesktop = () => {
      if (desktopQuery.matches) setMenu(false);
    };
    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", handleDesktop);
    } else if (typeof desktopQuery.addListener === "function") {
      desktopQuery.addListener(handleDesktop);
    }
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const backToTopLabels = {
    sr: "Povratak na vrh",
    en: "Back to top",
    it: "Torna all'inizio"
  };
  const backToTopButton = document.createElement("button");
  backToTopButton.type = "button";
  backToTopButton.className = "back-to-top";
  backToTopButton.setAttribute("aria-label", backToTopLabels[lang]);
  backToTopButton.setAttribute("title", backToTopLabels[lang]);
  backToTopButton.setAttribute("aria-hidden", "true");
  backToTopButton.tabIndex = -1;
  backToTopButton.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5M6.5 10.5 12 5l5.5 5.5"/></svg>';
  document.body.append(backToTopButton);

  let backToTopUpdatePending = false;
  const updateBackToTopVisibility = () => {
    const isVisible = window.scrollY > 560;
    backToTopButton.classList.toggle("is-visible", isVisible);
    backToTopButton.setAttribute("aria-hidden", String(!isVisible));
    backToTopButton.tabIndex = isVisible ? 0 : -1;
    backToTopUpdatePending = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (backToTopUpdatePending) return;
      backToTopUpdatePending = true;
      window.requestAnimationFrame(updateBackToTopVisibility);
    },
    { passive: true }
  );
  updateBackToTopVisibility();

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  });

  if (!prefersReducedMotion) {
    document.documentElement.classList.add("motion-ready");
    const revealTargets = document.querySelectorAll(
      ".section, .page-hero, .factory-frame, .process-flow, .info-card"
    );

    revealTargets.forEach((element) => {
      element.classList.add("reveal");
    });

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -40px 0px"
        }
      );

      revealTargets.forEach((element) => revealObserver.observe(element));
    } else {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
    }
  }

  const messages = {
    sr: {
      missing: "Popunite obavezna polja.",
      contact: "Online slanje trenutno nije dostupno. Pišite nam na contact@pogon.io.",
      portal: "Prijava trenutno nije dostupna. Za pristup kontaktirajte podršku."
    },
    en: {
      missing: "Please complete the required fields.",
      contact: "Online submission is currently unavailable. Please email us at contact@pogon.io.",
      portal: "Sign-in is currently unavailable. Please contact support for access."
    },
    it: {
      missing: "Compila i campi obbligatori.",
      contact: "L'invio online non è al momento disponibile. Scrivici a contact@pogon.io.",
      portal: "L'accesso non è al momento disponibile. Contatta l'assistenza."
    }
  };

  document.querySelectorAll("[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = form.querySelector(".form-status");
      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) {
          status.textContent = messages[lang].missing;
          status.classList.add("error");
        }
        return;
      }
      if (status) {
        status.classList.remove("error");
        status.textContent = form.dataset.demoForm === "portal" ? messages[lang].portal : messages[lang].contact;
      }
      form.reset();
    });
  });
})();
