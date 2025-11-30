
/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy Parameters (Updated)
 */
const parameters = {
  count: 48900,
  size: 0.1,
  radius: 18.81,
  branches: 3,
  spin: 2.38,
  randomness: 2,
  randomnessPower: 3.58,
  insideColor: '#f2f2f2',
  outsideColor: '#d8ddee',
  transitionDuration: 4,   // Retained for animation logic
  affectedPercentage: 0.2, // Retained for animation logic
};

let geometry = null;
let material = null;
let points = null;
let transitionStartTimes = [];
let affectedParticles = []; // Array to track affected particles

const generateGalaxy = () => {
  /**
   * Destroy Old Galaxy
   */
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  /**
   * Geometry
   */
  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  transitionStartTimes = new Float32Array(parameters.count);
  affectedParticles = new Uint8Array(parameters.count);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Initial color
    const initialColor = Math.random() < 0.5 ? colorInside : colorOutside;
    colors[i3] = initialColor.r;
    colors[i3 + 1] = initialColor.g;
    colors[i3 + 2] = initialColor.b;

    // Set initial transition start time
    transitionStartTimes[i] = Math.random() * parameters.transitionDuration;

    // Randomly mark some particles as affected
    affectedParticles[i] = Math.random() < parameters.affectedPercentage ? 1 : 0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  /**
   * Material
   */
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexColors: true,
  });

  /**
   * Points
   */
  points = new THREE.Points(geometry, material);
  scene.add(points);
};

// Theme Colors
const themeColors = {
  light: {
    bg: new THREE.Color('white'),
    inside: '#f2f2f2',
    outside: '#d8ddee',
  },
  dark: {
    bg: new THREE.Color('#080705'),
    inside: '#3d60e2', // savoyBlue
    outside: '#000022', // oxfordBlue
  }
};

// Function to update background and particles based on theme
const updateTheme = () => {
  const isDark = document.documentElement.classList.contains('dark');
  const theme = isDark ? themeColors.dark : themeColors.light;

  scene.background = theme.bg;

  // Update parameters
  parameters.insideColor = theme.inside;
  parameters.outsideColor = theme.outside;

  // Regenerate galaxy with new colors
  generateGalaxy();
};

// Initial set
updateTheme();

// Watch for theme changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class') {
      updateTheme();
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class'],
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  // height: 1000
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(52, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 3;
camera.position.y = 1.5;
camera.position.z = 3;
scene.add(camera);

/**
 * Controls
 */
const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enableRotate = false; // Disable rotation via touch or mouse
controls.enablePan = false;    // Disable panning via touch or mouse

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Rotate galaxy
  points.rotation.y = elapsedTime * 0.05;

  // Smooth color transitions for affected particles
  const colors = geometry.attributes.color.array;
  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    if (!affectedParticles[i]) continue; // Skip unaffected particles

    const i3 = i * 3;
    const timeSinceTransition = elapsedTime - transitionStartTimes[i];

    // Determine transition phase (0 to 1 over transition duration)
    const phase = (timeSinceTransition % parameters.transitionDuration) / parameters.transitionDuration;

    // Interpolate between inside and outside colors
    const interpolatedColor = colorInside
      .clone()
      .lerp(colorOutside, Math.abs(Math.sin(phase * Math.PI)));

    colors[i3] = interpolatedColor.r;
    colors[i3 + 1] = interpolatedColor.g;
    colors[i3 + 2] = interpolatedColor.b;

    // Reset transition start time if necessary
    if (timeSinceTransition > parameters.transitionDuration) {
      transitionStartTimes[i] = elapsedTime;
    }
  }

  geometry.attributes.color.needsUpdate = true;

  // Update controls (though interactions are disabled)
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

/**
 * GSAP Animations
 */
gsap.to('.services_gategory-heading', {
  scrollTrigger: {
    trigger: '.services_right-col',
    start: '30% top',
    end: '40% top',
    toggleActions: 'restart none reverse',
  },
  yPercent: -100,
  duration: 0.5,
  ease: 'power2.inOut',
});

gsap.from('.slide', {
  scrollTrigger: {
    trigger: '.services_right-col',
    start: '-25% top',
    end: '80% top',
    scrub: true,
    toggleActions: 'restart none reverse',
  },
  x: '+=5rem',
  opacity: 0,
  duration: 0.5,
  stagger: 0.2,
  ease: 'power4.out',
});

function initStackingNav() {
  const cards = document.querySelectorAll('.stacking-card');
  if (!cards) return;

  cards.forEach((card) => {
    const previousCard = card.previousElementSibling;

    gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 65%',
        end: 'top top',
        scrub: 0.5,
      },
    })
      .fromTo(previousCard, { scale: 1 }, { scale: 0.85, duration: 0.5 })
      .to(
        card,
        { filter: 'drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.2))', duration: 0.5 },
        '<'
      );
  });
}
initStackingNav();
