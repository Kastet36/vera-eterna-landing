const dialog = document.querySelector('#visit-form');
const form = document.querySelector('#lead-form');
const firstField = form.querySelector('input');
const priceDialog = document.querySelector("#price-form");
const priceFirstField = priceDialog.querySelector("input");
const quickActions = document.querySelector("[data-quick-actions]");
const quickActionsTrigger = document.querySelector("[data-quick-actions-trigger]");
const hero = document.querySelector("#concept-1");

const setQuickActions = (isOpen) => {
  quickActions.classList.toggle("is-open", isOpen);
  quickActionsTrigger.setAttribute("aria-expanded", String(isOpen));
};

const setQuickActionsVisibility = (isVisible) => {
  quickActions.classList.toggle("is-visible", isVisible);
  quickActions.inert = !isVisible;
  quickActions.setAttribute("aria-hidden", String(!isVisible));
  if (!isVisible) setQuickActions(false);
};

setQuickActionsVisibility(false);
new IntersectionObserver(([entry]) => {
  setQuickActionsVisibility(!entry.isIntersecting);
}, { threshold: 0 }).observe(hero);

quickActionsTrigger.addEventListener("click", () => {
  setQuickActions(!quickActions.classList.contains("is-open"));
});

document.addEventListener("click", (event) => {
  if (!quickActions.contains(event.target)) setQuickActions(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setQuickActions(false);
});

quickActions.querySelectorAll("[data-open-form], [data-open-price-form]").forEach((button) => {
  button.addEventListener("click", () => setQuickActions(false));
});


const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('[data-gallery]').forEach((gallery) => {
  const track = gallery.querySelector('[data-gallery-track]');
  const controls = gallery.querySelector('[data-gallery-controls]');
  const previous = gallery.querySelector('[data-gallery-prev]');
  const next = gallery.querySelector('[data-gallery-next]');
  const current = gallery.querySelector('[data-gallery-current]');
  const total = gallery.querySelector('[data-gallery-total]');
  const items = track ? Array.from(track.children) : [];
  const usesWindowNavigation = gallery.hasAttribute('data-gallery-window');
  let activeIndex = 0;
  let scrollFrame = 0;
  let programmaticUntil = 0;

  if (!track || !controls || !previous || !next || items.length === 0) return;

  if (total) total.textContent = String(items.length);

  const itemPosition = (item) => (
    item.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft
  );

  const itemOffset = (item) => itemPosition(item) - itemPosition(items[0]);
  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const targetForIndex = (index) => Math.min(itemOffset(items[index]), maxScroll());

  const windowLimit = () => items.reduce((closest, item, index) => (
    Math.abs(targetForIndex(index) - maxScroll()) < Math.abs(targetForIndex(closest) - maxScroll())
      ? index
      : closest
  ), 0);

  const navigationLimit = () => usesWindowNavigation ? windowLimit() : items.length - 1;

  const nearestIndex = () => {
    if (track.scrollLeft <= 2) return 0;
    if (!usesWindowNavigation && track.scrollLeft >= maxScroll() - 2) return items.length - 1;

    const limit = navigationLimit();
    const candidates = items.slice(0, limit + 1);

    return candidates.reduce((closest, item, index) => (
      Math.abs(targetForIndex(index) - track.scrollLeft) < Math.abs(targetForIndex(closest) - track.scrollLeft)
        ? index
        : closest
    ), 0);
  };

  const renderState = () => {
    const hasOverflow = track.scrollWidth > track.clientWidth + 2;
    controls.hidden = !hasOverflow;
    if (current) current.textContent = String(activeIndex + 1);
    previous.disabled = !hasOverflow || activeIndex === 0;
    next.disabled = !hasOverflow || activeIndex >= navigationLimit();
  };

  const goTo = (index) => {
    activeIndex = Math.max(0, Math.min(index, navigationLimit()));
    programmaticUntil = performance.now() + 500;
    renderState();
    track.scrollTo({
      left: targetForIndex(activeIndex),
      behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
    });
    window.setTimeout(() => {
      activeIndex = nearestIndex();
      renderState();
    }, 520);
  };

  previous.addEventListener('click', () => goTo(activeIndex - 1));
  next.addEventListener('click', () => goTo(activeIndex + 1));

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
  });

  track.addEventListener('scroll', () => {
    if (performance.now() < programmaticUntil || scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      activeIndex = nearestIndex();
      renderState();
      scrollFrame = 0;
    });
  }, { passive: true });

  const resizeObserver = new ResizeObserver(() => {
    activeIndex = nearestIndex();
    renderState();
  });
  resizeObserver.observe(track);
  renderState();
});


document.querySelectorAll('dialog.lightbox[data-lightbox]').forEach((lightbox) => {
  const galleryName = lightbox.dataset.lightbox;
  const lightboxTriggers = Array.from(document.querySelectorAll(`[data-lightbox-open="${galleryName}"]`));
  const lightboxImage = lightbox.querySelector('[data-lightbox-image]');
  const lightboxCaption = lightbox.querySelector('[data-lightbox-caption]');
  const lightboxLoading = lightbox.querySelector('[data-lightbox-loading]');
  const lightboxCurrent = lightbox.querySelector('[data-lightbox-current]');
  const lightboxTotal = lightbox.querySelector('[data-lightbox-total]');
  const lightboxPrevious = lightbox.querySelector('[data-lightbox-prev]');
  const lightboxNext = lightbox.querySelector('[data-lightbox-next]');
  const lightboxClose = lightbox.querySelector('[data-lightbox-close]');
  const lightboxStage = lightbox.querySelector('[data-lightbox-stage]');
  const lightboxFigure = lightbox.querySelector('.lightbox__figure');
  const lightboxItems = lightboxTriggers.map((trigger) => {
    const image = trigger.querySelector('img');
    return {
      src: image.getAttribute('src'),
      alt: image.getAttribute('alt')
    };
  });
  let lightboxIndex = 0;
  let lightboxReturnFocus = null;
  let lightboxTouchStartX = 0;
  let lightboxTouchStartY = 0;

  if (lightboxItems.length === 0) return;
  if (lightboxTotal) lightboxTotal.textContent = String(lightboxItems.length);

  const finishLightboxLoading = () => {
    lightboxLoading.hidden = true;
    lightboxImage.classList.add('is-loaded');
  };

  const showLightboxImage = (index) => {
    lightboxIndex = Math.max(0, Math.min(index, lightboxItems.length - 1));
    const item = lightboxItems[lightboxIndex];

    lightboxImage.classList.remove('is-loaded');
    lightboxLoading.hidden = false;
    lightboxLoading.textContent = 'Загрузка фото…';
    lightboxImage.alt = item.alt;
    if (lightboxCaption) lightboxCaption.textContent = item.alt;
    if (lightboxCurrent) lightboxCurrent.textContent = String(lightboxIndex + 1);
    lightboxPrevious.disabled = lightboxIndex === 0;
    lightboxNext.disabled = lightboxIndex === lightboxItems.length - 1;

    lightboxImage.onload = finishLightboxLoading;
    lightboxImage.onerror = () => {
      lightboxLoading.hidden = false;
      lightboxLoading.textContent = 'Не удалось загрузить фото';
    };
    lightboxImage.src = item.src;

    if (lightboxImage.complete && lightboxImage.naturalWidth > 0) {
      window.requestAnimationFrame(finishLightboxLoading);
    }

    [lightboxIndex - 1, lightboxIndex + 1].forEach((nearbyIndex) => {
      if (lightboxItems[nearbyIndex]) {
        const preload = new Image();
        preload.src = lightboxItems[nearbyIndex].src;
      }
    });
  };

  lightboxTriggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => {
      lightboxReturnFocus = trigger;
      showLightboxImage(index);
      lightbox.showModal();
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => lightboxClose.focus(), 0);
    });
  });

  const closeLightbox = () => {
    document.body.style.overflow = '';
    if (lightbox.open) lightbox.close();
    window.setTimeout(() => {
      if (lightboxReturnFocus) lightboxReturnFocus.focus();
    }, 0);
  };

  lightboxPrevious.addEventListener('click', () => showLightboxImage(lightboxIndex - 1));
  lightboxNext.addEventListener('click', () => showLightboxImage(lightboxIndex + 1));
  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeLightbox();
  });

  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showLightboxImage(lightboxIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showLightboxImage(lightboxIndex + 1);
    }
  });

  lightboxStage.addEventListener('click', (event) => {
    if (event.target === lightboxStage || event.target === lightboxFigure) closeLightbox();
  });

  lightboxFigure.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    lightboxTouchStartX = touch.clientX;
    lightboxTouchStartY = touch.clientY;
  }, { passive: true });

  lightboxFigure.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - lightboxTouchStartX;
    const deltaY = touch.clientY - lightboxTouchStartY;

    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    showLightboxImage(lightboxIndex + (deltaX < 0 ? 1 : -1));
  }, { passive: true });

  lightbox.addEventListener('close', () => {
    document.body.style.overflow = '';
    if (lightboxReturnFocus) lightboxReturnFocus.focus();
  });
});

document.querySelectorAll('[data-open-form]').forEach((button) => {
  button.addEventListener('click', () => {
    dialog.showModal();
    window.setTimeout(() => firstField.focus(), 0);
  });
});

document.querySelector('[data-close-form]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelectorAll("[data-open-price-form]").forEach((button) => {
  button.addEventListener("click", () => {
    priceDialog.showModal();
    window.setTimeout(() => priceFirstField.focus(), 0);
  });
});

document.querySelector("[data-close-price-form]").addEventListener("click", () => priceDialog.close());
priceDialog.addEventListener("click", (event) => {
  if (event.target === priceDialog) priceDialog.close();
});
