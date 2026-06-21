/* ─── CONFIG ─── */
const FRAME_COUNT = 193;
const FRAME_PATH = 'frames/frame_';
const FRAME_EXT = '.webp';
const IMAGE_SCALE = 0.86;
const FRAME_SPEED = 2.0;
const STATS_ENTER = 0.58;
const STATS_LEAVE = 0.72;

/* ─── ELEMENTS ─── */
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPercent = document.getElementById('loader-percent');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWrap = document.getElementById('canvas-wrap');
const darkOverlay = document.getElementById('dark-overlay');
const scrollContainer = document.getElementById('scroll-container');
const heroSection = document.getElementById('hero');
const marqueeWrap = document.getElementById('marquee-wrap');
const header = document.querySelector('.site-header');

/* ─── STATE ─── */
const frames = new Array(FRAME_COUNT);
let loadedCount = 0;
let currentFrame = 0;
let bgColor = '#0d0d0d';
let resizeTimer;

/* ─── CANVAS RESIZE ─── */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);
  drawFrame(currentFrame);
}

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeCanvas, 150);
});

/* ─── BG COLOR SAMPLER ─── */
function sampleBgColor(img) {
  const tmpCanvas = document.createElement('canvas');
  const tmpCtx = tmpCanvas.getContext('2d');
  tmpCanvas.width = 4;
  tmpCanvas.height = 4;
  tmpCtx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, 4, 4);
  const d = tmpCtx.getImageData(0, 0, 1, 1).data;
  bgColor = `rgb(${d[0]},${d[1]},${d[2]})`;
}

/* ─── DRAW FRAME ─── */
function drawFrame(index) {
  const img = frames[index];
  if (!img) return;

  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

/* ─── FRAME LOADER ─── */
function padIndex(i) {
  return String(i + 1).padStart(4, '0');
}

function loadFrames() {
  const firstBatch = Math.min(10, FRAME_COUNT);

  function loadOne(i) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        frames[i] = img;
        loadedCount++;
        if (i % 20 === 0) sampleBgColor(img);
        const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
        loaderBar.style.width = pct + '%';
        loaderPercent.textContent = pct + '%';
        resolve();
      };
      img.onerror = () => { loadedCount++; resolve(); };
      img.src = FRAME_PATH + padIndex(i) + FRAME_EXT;
    });
  }

  const firstBatchPromises = [];
  for (let i = 0; i < firstBatch; i++) firstBatchPromises.push(loadOne(i));

  Promise.all(firstBatchPromises).then(() => {
    resizeCanvas();
    drawFrame(0);
    for (let i = firstBatch; i < FRAME_COUNT; i++) loadOne(i);
    waitForAllFrames();
  });
}

function waitForAllFrames() {
  const check = setInterval(() => {
    if (loadedCount >= FRAME_COUNT) {
      clearInterval(check);
      loader.classList.add('hidden');
      initSite();
    }
  }, 80);
}

/* ─── LENIS ─── */
function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ─── HERO WORD REVEAL ─── */
function initHeroReveal() {
  const words = document.querySelectorAll('.hero-word');
  gsap.from(words, {
    y: 60,
    opacity: 0,
    stagger: 0.12,
    duration: 1.1,
    ease: 'power3.out',
    delay: 0.2,
  });
  gsap.from('.hero-tagline', { opacity: 0, y: 20, duration: 0.8, delay: 0.8, ease: 'power2.out' });
  gsap.from('.section-label', { opacity: 0, duration: 0.6, delay: 0.3, ease: 'power2.out' });
}

/* ─── HERO → CANVAS TRANSITION ─── */
function initHeroTransition() {
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      heroSection.style.opacity = Math.max(0, 1 - p * 18);

      const wipeProgress = Math.min(1, Math.max(0, (p - 0.01) / 0.07));
      const radius = wipeProgress * 80;
      canvasWrap.style.clipPath = `circle(${radius}% at 50% 50%)`;

      header.classList.toggle('on-dark', p > 0.05);
    },
  });
}

/* ─── FRAME → SCROLL BINDING ─── */
function initFrameScroll() {
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
      const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
      if (index !== currentFrame) {
        currentFrame = index;
        requestAnimationFrame(() => drawFrame(currentFrame));
      }
    },
  });
}

/* ─── DARK OVERLAY ─── */
function initDarkOverlay() {
  const fadeRange = 0.04;
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      let opacity = 0;
      const enter = STATS_ENTER;
      const leave = STATS_LEAVE;
      if (p >= enter - fadeRange && p <= enter) {
        opacity = (p - (enter - fadeRange)) / fadeRange;
      } else if (p > enter && p < leave) {
        opacity = 0.9;
      } else if (p >= leave && p <= leave + fadeRange) {
        opacity = 0.9 * (1 - (p - leave) / fadeRange);
      }
      darkOverlay.style.opacity = opacity;
    },
  });
}

/* ─── MARQUEE ─── */
function initMarquee() {
  const speed = parseFloat(marqueeWrap.dataset.scrollSpeed) || -22;
  gsap.to(marqueeWrap.querySelector('.marquee-text'), {
    xPercent: speed,
    ease: 'none',
    scrollTrigger: {
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      let mOpacity = 0;
      if (p > 0.08 && p < 0.55) {
        mOpacity = Math.min(1, (p - 0.08) / 0.06);
      } else if (p >= 0.55 && p < 0.62) {
        mOpacity = Math.max(0, 1 - (p - 0.55) / 0.07);
      }
      marqueeWrap.style.opacity = mOpacity;
    },
  });
}

/* ─── SECTION POSITIONS ─── */
function positionSections() {
  const totalH = scrollContainer.offsetHeight;
  document.querySelectorAll('.scroll-section').forEach((section) => {
    const enter = parseFloat(section.dataset.enter) / 100;
    const leave = parseFloat(section.dataset.leave) / 100;
    const mid = (enter + leave) / 2;
    section.style.top = mid * totalH + 'px';
    section.style.transform = 'translateY(-50%)';
  });
  const statsSection = document.querySelector('.section-stats');
  if (statsSection) {
    const enter = parseFloat(statsSection.dataset.enter) / 100;
    const leave = parseFloat(statsSection.dataset.leave) / 100;
    const mid = (enter + leave) / 2;
    statsSection.style.top = mid * totalH + 'px';
    statsSection.style.transform = 'translateX(-50%) translateY(-50%)';
    statsSection.style.left = '50%';
  }
}

/* ─── SECTION ANIMATIONS ─── */
function setupSectionAnimation(section) {
  const type = section.dataset.animation;
  const persist = section.dataset.persist === 'true';
  const enter = parseFloat(section.dataset.enter) / 100;
  const leave = parseFloat(section.dataset.leave) / 100;

  const children = Array.from(section.querySelectorAll(
    '.section-label, .section-heading, .section-body, .section-note, .cta-button, .stat, .service-list li, .process-list li, .cta-heading, .cta-phone, .cta-subtext, .quote-form'
  ));

  const tl = gsap.timeline({ paused: true });

  switch (type) {
    case 'fade-up':
      tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' });
      break;
    case 'slide-left':
      tl.from(children, { x: -80, opacity: 0, stagger: 0.14, duration: 0.9, ease: 'power3.out' });
      break;
    case 'slide-right':
      tl.from(children, { x: 80, opacity: 0, stagger: 0.14, duration: 0.9, ease: 'power3.out' });
      break;
    case 'scale-up':
      tl.from(children, { scale: 0.85, opacity: 0, stagger: 0.12, duration: 1.0, ease: 'power2.out' });
      break;
    case 'rotate-in':
      tl.from(children, { y: 40, rotation: 2, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' });
      break;
    case 'stagger-up':
      tl.from(children, { y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' });
      break;
    case 'clip-reveal':
      tl.from(children, { clipPath: 'inset(100% 0 0 0)', opacity: 0, stagger: 0.15, duration: 1.2, ease: 'power4.inOut' });
      break;
  }

  let hasPlayed = false;

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: false,
    onUpdate: (self) => {
      const p = self.progress;
      const isIn = p >= enter && p < leave;

      if (isIn && !hasPlayed) {
        section.classList.add('visible');
        tl.play();
        hasPlayed = true;
      } else if (!isIn && hasPlayed && !persist) {
        section.classList.remove('visible');
        tl.reverse();
        hasPlayed = false;
      } else if (isIn && persist) {
        section.classList.add('visible');
      }
    },
  });
}

/* ─── COUNTER ANIMATIONS ─── */
function initCounters() {
  document.querySelectorAll('.stat-number').forEach((el) => {
    const target = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || '0');
    gsap.from(el, {
      textContent: 0,
      duration: 2.2,
      ease: 'power1.out',
      snap: { textContent: decimals === 0 ? 1 : 0.1 },
      scrollTrigger: {
        trigger: el.closest('.scroll-section'),
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      onUpdate: function () {
        const val = parseFloat(this.targets()[0].textContent);
        el.textContent = decimals > 0 ? val.toFixed(decimals) : Math.round(val);
      },
    });
  });
}

/* ─── MAIN INIT ─── */
function initSite() {
  gsap.registerPlugin(ScrollTrigger);
  initLenis();
  initHeroReveal();
  positionSections();
  initHeroTransition();
  initFrameScroll();
  initDarkOverlay();
  initMarquee();
  document.querySelectorAll('.scroll-section').forEach(setupSectionAnimation);
  initCounters();
  ScrollTrigger.refresh();
}

/* ─── BOOT ─── */
loadFrames();
