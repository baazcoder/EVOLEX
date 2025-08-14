// === DOM Elements ===
const slider = document.getElementById('theme-slider');
const icon = document.getElementById('theme-icon');
const starsContainer = document.getElementById('stars');
const body = document.body;
let isDragging = false;



// Call once on page load

    

// === Update Theme Based on Slider Position ===
function updateTheme(percentage) {
  icon.style.left = `${percentage}%`;

  const sun = icon.querySelector('.sun');
  const moon = icon.querySelector('.moon');

  if (percentage < 30) {
    sun.style.opacity = 0;
    moon.style.opacity = 1;
    body.classList.remove('light-theme');
  } else {
    sun.style.opacity = (percentage - 30) / 70;
    moon.style.opacity = 1 - (percentage - 30) / 70;
    body.classList.add('light-theme');
  }
}

// === Drag Events ===
icon.addEventListener('mousedown', (e) => {
  e.preventDefault();
  isDragging = true;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const rect = slider.getBoundingClientRect();
  const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  updateTheme((pos / rect.width) * 100);
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Touch Support
icon.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isDragging = true;
});

document.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const touch = e.touches[0];
  const rect = slider.getBoundingClientRect();
  const pos = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
  updateTheme((pos / rect.width) * 100);
});

document.addEventListener('touchend', () => {
  isDragging = false;
});

// Click on track
slider.addEventListener('click', (e) => {
  const rect = slider.getBoundingClientRect();
  const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  updateTheme((pos / rect.width) * 100);
});

// === Three.js Ripple Background ===
let scene, camera, renderer, uniforms;

function initRipple() {
  const container = document.getElementById('ripple-bg');
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const geometry = new THREE.PlaneGeometry(2, 2);

  uniforms = {
    u_time: { value: 0.0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  };

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 center = uv - 0.5;
        float len = length(center);
        float ripple = 0.03 * sin(40.0 * len - u_time * 4.0);
        float r = 0.5 + 0.5 * cos(6.2831 * ripple + u_time * 0.5);
        float g = 0.5 + 0.5 * sin(6.2831 * ripple + u_time * 0.3);
        float b = 0.5 + 0.5 * cos(6.2831 * ripple + u_time * 0.7);
        gl_FragColor = vec4(r, g, b, 0.4);
      }
    `,
    transparent: true
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  function animate() {
    requestAnimationFrame(animate);
    uniforms.u_time.value += 0.01;
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// === Smooth Scrolling ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// === Mobile Menu (Placeholder) ===
document.querySelector('button.md\\:hidden')?.addEventListener('click', () => {
  alert('Mobile menu would open here');
});

// === Initialize ===
document.addEventListener('DOMContentLoaded', () => {
 
  updateTheme(0); // Start at night
  initRipple();
});