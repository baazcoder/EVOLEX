// === DOM Elements ===
const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;

let isLightTheme = false; // Start in dark mode

// === Update Theme Based on Mode ===
function updateTheme(isLight) {
  if (isLight) {
    body.classList.add('light-theme');
  } else {
    body.classList.remove('light-theme');
  }
  // Save preference
  localStorage.setItem('light-theme', isLight);
}

// === Toggle Theme on Click ===
toggleBtn.addEventListener('click', () => {
  isLightTheme = !isLightTheme;
  updateTheme(isLightTheme);
});

// === Initialize Theme on Load (from localStorage or default) ===
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('light-theme');
  isLightTheme = saved === 'true';
  updateTheme(isLightTheme);
});

// === Three.js Ripple Background ===
let scene, camera, renderer, uniforms;

function initRipple() {
  const container = document.getElementById('ripple-bg');
  if (!container) return;

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

  // Handle resize
  window.addEventListener('resize', () => {
    uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// === Smooth Scrolling for Anchor Links ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// === Mobile Menu Toggle (Improved) ===
const mobileMenuButton = document.querySelector('nav button.md\\:hidden');
if (mobileMenuButton) {
  mobileMenuButton.addEventListener('click', () => {
    console.warn("Mobile menu not implemented — would toggle mobile navigation.");
    // You can add mobile menu logic here later
  });
}

// === Initialize on Load ===
document.addEventListener('DOMContentLoaded', () => {
  updateTheme(isLightTheme); // Apply theme
  initRipple();             // Start ripple effect
});