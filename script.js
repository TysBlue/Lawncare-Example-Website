// ============================================================
//  UNDERGROUND HERO — scroll animation
// ============================================================

const UG = {
  section:    document.getElementById('ug-section'),
  sticky:     document.getElementById('ug-sticky'),
  sky:        document.getElementById('ug-sky'),
  ground:     document.getElementById('ug-ground'),
  roots:      document.getElementById('ug-roots'),
  grass:      document.getElementById('ug-grass'),
  content:    document.getElementById('ug-content'),
  label:      document.getElementById('ug-label'),
  scrollHint: document.getElementById('scroll-hint'),
  depthFill:  document.getElementById('depth-fill'),
  depthLabel: document.getElementById('depth-label'),
  sun:        document.getElementById('sun'),
  cloud1:     document.getElementById('cloud1'),
  cloud2:     document.getElementById('cloud2'),
  cloud3:     document.getElementById('cloud3'),
};

// Generate grass blades
(function buildGrass() {
  const container = document.getElementById('grass-blades');
  const colors = ['#3a7d1e','#4a9a2a','#2d6518','#56b830','#3d8522','#68cc3a','#2a5c15','#4e8f25'];
  for (let i = 0; i < 120; i++) {
    const b = document.createElement('div');
    b.className = 'blade';
    const h = 28 + Math.random() * 52;
    const x = (i / 120) * 100 + (Math.random() - .5) * 1.2;
    b.style.cssText = `
      left:${x}%;
      height:${h}px;
      background:linear-gradient(180deg,${colors[Math.floor(Math.random()*colors.length)]} 0%,#1a3d0a 100%);
      animation-duration:${1.4 + Math.random() * 1.8}s;
      animation-delay:${-Math.random() * 2}s;
      transform-origin:bottom center;
      width:${2 + Math.random() * 3}px;
    `;
    container.appendChild(b);
  }
})();

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function easeInOut(t) { return t < .5 ? 2*t*t : -1+(4-2*t)*t; }

const depthLabels = ['Surface','5 cm','10 cm','20 cm','Root Zone','Deep Soil','Bedrock'];

function onScroll() {
  const rect = UG.section.getBoundingClientRect();
  const total = UG.section.offsetHeight - window.innerHeight;
  const raw = clamp(-rect.top / total, 0, 1);
  const p = easeInOut(raw);

  // Sky color shift: bright blue → deep brown darkness
  const skyColors = [
    `linear-gradient(180deg,#4a90d9 0%,#74b9e8 30%,#a8d8ea 60%,#c8ecd5 85%,#8bc34a 100%)`,
    `linear-gradient(180deg,#2c5f8a 0%,#4a7a9b 30%,#6a9aab 60%,#7aaa85 85%,#3d6b20 100%)`,
    `linear-gradient(180deg,#1a3a55 0%,#2a5070 30%,#3a6060 60%,#2a4a30 85%,#1a3010 100%)`,
    `linear-gradient(180deg,#0d1f30 0%,#152535 30%,#1a2a25 60%,#101a10 85%,#080e05 100%)`,
  ];
  const skyIdx = clamp(Math.floor(p * 3), 0, 2);
  const skyBlend = (p * 3) - skyIdx;
  UG.sky.style.background = skyColors[Math.min(skyIdx + (skyBlend > .5 ? 1 : 0), 3)];

  // Sun fades and moves up as we go underground
  const sunOpacity = clamp(1 - p * 3, 0, 1);
  UG.sun.style.opacity = sunOpacity;
  UG.sun.style.transform = `translateY(${p * -80}px)`;

  // Clouds fade and drift up
  [UG.cloud1, UG.cloud2, UG.cloud3].forEach((c, i) => {
    c.style.opacity = clamp(1 - p * 4, 0, 1);
    c.style.transform = `translateY(${p * -60}px)`;
  });

  // Grass surface moves up (camera going underground)
  const grassShift = p * 160; // vh units represented as %
  UG.grass.style.transform = `translateY(${-p * 100}%)`;

  // Roots appear from 20% onwards, fade in
  const rootOpacity = clamp((p - .15) / .25, 0, 1);
  UG.roots.style.opacity = rootOpacity;
  UG.roots.style.transform = `translateY(${-p * 80}%)`;

  // Ground layers shift up with parallax
  UG.ground.style.transform = `translateY(${-p * 60}%)`;

  // Hero content: fade out as we scroll past 30%
  const contentOpacity = clamp(1 - (p - .05) / .25, 0, 1);
  UG.content.style.opacity = contentOpacity;
  UG.content.style.transform = `translateY(${-p * 40}px) scale(${lerp(1, .95, p)})`;

  // Scroll hint fades out early
  UG.scrollHint.style.opacity = clamp(1 - p * 6, 0, 1);

  // Underground label appears mid-scroll
  const labelVisible = p > .35 && p < .85;
  UG.label.classList.toggle('visible', labelVisible);

  // Depth indicator
  UG.depthFill.style.height = `${p * 100}%`;
  const labelIdx = clamp(Math.floor(p * depthLabels.length), 0, depthLabels.length - 1);
  UG.depthLabel.textContent = depthLabels[labelIdx];
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ============================================================
//  REST OF SITE
// ============================================================

// Sticky nav shadow
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Fade-up / fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up, .fade-in').forEach(el => observer.observe(el));

// Quote form
function handleSubmit(e) {
  e.preventDefault();
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
  e.target.reset();
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
