/* script.js — interactive features (cleaned version):
   - typing intro for title
   - smooth scroll + active nav + progress
   - reveal-on-scroll + stagger
   - skill fills + counters
   - modal lightbox (prev/next + keyboard)
   - project thumbnail to modal
   - cursor dot effect
   - particles background canvas
*/

(() => {
  /* ---------- Utilities ---------- */
  const q = (sel, ctx = document) => ctx.querySelector(sel);
  const qa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, a=0, b=100) => Math.max(a, Math.min(b, v));

  /* ---------- Typed subtitle (non-intrusive) ---------- */
  const typedStrings = ["Web Production Analyst", "Content Designer", "Product-minded Frontend", "Always Learning"];
  const titleEl = q('#title');
  // simple subtle cycle for subtitle via title attribute (no aggressive animation)
  function startSubCycle() {
    let idx = 0;
    const subLoop = () => {
      titleEl.setAttribute('data-sub', typedStrings[idx]);
      idx = (idx + 1) % typedStrings.length;
      setTimeout(subLoop, 2200);
    };
    subLoop();
  }

  /* ---------- Smooth scroll + active nav + progress ---------- */
  const navLinks = qa('.nav-link');
  const sections = navLinks.map(l => document.querySelector(l.getAttribute('href')));
  navLinks.forEach(link => link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveNav(link);
  }));
  function setActiveNav(link){
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  }
  function onScrollNav(){
    const pos = window.scrollY + (window.innerHeight * 0.33);
    let idx = 0;
    sections.forEach((s, i) => { if (!s) return; if (pos >= s.offsetTop) idx = i; });
    if (navLinks[idx]) setActiveNav(navLinks[idx]);
    const progress = Math.min(100, Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100));
    const progressBar = q('#nav-progress > div');
    if (progressBar) progressBar.style.width = progress + '%';
  }
  window.addEventListener('scroll', onScrollNav, {passive:true});
  onScrollNav();

  /* ---------- Sticky header shadow ---------- */
  const siteTop = q('.site-top');
  function headerShadow(){ siteTop.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', headerShadow, {passive:true});
  headerShadow();

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  const sectionsToReveal = qa('.section');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        io.unobserve(en.target);
      }
    });
  }, {threshold: 0.12});
  sectionsToReveal.forEach(s => io.observe(s));

  /* ---------- Skill fills + counters ---------- */
  const skillRows = qa('.skill-row');
  const skillsObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const row = en.target;
      const level = clamp(Number(row.dataset.level) || 0);
      const fill = q('.skill-fill', row);
      const percent = q('.skill-percent', row);
      if (fill) fill.style.width = level + '%';
      if (percent) {
        let cur = 0;
        const step = Math.max(1, Math.floor(level / 20));
        const iv = setInterval(() => {
          cur += step;
          if (cur >= level) { cur = level; clearInterval(iv); }
          percent.textContent = cur + '%';
        }, 30);
      }
      skillsObs.unobserve(row);
    });
  }, {threshold:0.25});
  skillRows.forEach(r => skillsObs.observe(r));

  /* ---------- Modal (lightbox) ---------- */
  const modal = q('#modal');
  const modalContent = q('.modal-content');
  const modalClose = q('.modal-close');
  const modalPrev = q('.modal-prev');
  const modalNext = q('.modal-next');
  const thumbs = qa('.project-thumb');
  let currentThumbs = thumbs;
  let currentIndex = 0;
  const openModal = (index) => {
    currentIndex = index;
    const thumb = currentThumbs[currentIndex];
    const large = thumb.dataset.large || thumb.src;
    modalContent.innerHTML = `<img src="${large}" alt="" style="width:100%;height:auto;display:block;border-radius:8px">`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalContent.innerHTML = '';
    document.body.style.overflow = '';
  };
  thumbs.forEach((t,i) => t.addEventListener('click', () => openModal(i)));
  modalClose.addEventListener('click', closeModal);
  modalPrev && modalPrev.addEventListener('click', () => { currentIndex = (currentIndex - 1 + currentThumbs.length) % currentThumbs.length; openModal(currentIndex); });
  modalNext && modalNext.addEventListener('click', () => { currentIndex = (currentIndex + 1) % currentThumbs.length; openModal(currentIndex); });
  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('open')) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') modalPrev && modalPrev.click();
      if (e.key === 'ArrowRight') modalNext && modalNext.click();
    }
  });

  /* ---------- Cursor dot effect ---------- */
  const cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  document.body.appendChild(cursorDot);
  document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
  });
  document.addEventListener('mouseenter', () => cursorDot.style.opacity = '1');
  document.addEventListener('mouseleave', () => cursorDot.style.opacity = '0');

  /* ---------- Particles background canvas ---------- */
  const canvas = q('#bg-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resizeCanvas(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  function initParticles(count=60){
    particles = [];
    for (let i=0;i<count;i++){
      particles.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        r: Math.random()*2 + 0.8,
        vx: (Math.random()-0.5)*0.3,
        vy: (Math.random()-0.5)*0.3,
        hue: 200 + Math.random()*80
      });
    }
  }
  initParticles(Math.floor(window.innerWidth/20));
  function renderParticles(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.fillStyle = `rgba(38,86,179,${0.06 + (p.r-0.8)/4})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(renderParticles);
  }
  renderParticles();

  /* ---------- Start subtle subtitle cycle ---------- */
  startSubCycle();

  /* ---------- Accessibility: ensure first nav active ---------- */
  if (navLinks && navLinks.length) setActiveNav(navLinks[0]);

  /* ---------- Reduced motion respect ---------- */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    particles = [];
    ctx.clearRect(0,0,canvas.width,canvas.height);
    cursorDot.style.display = 'none';
  }

})(); // IIFE end
