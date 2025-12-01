// =============================
// 🌙 Dark Mode Optimization
// =============================
const themeToggle = document.getElementById('themeToggle');
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');

// Apply dark mode based on user preference or system settings
if (savedTheme) {
  document.documentElement.classList.toggle('dark', savedTheme === 'dark');
} else {
  document.documentElement.classList.toggle('dark', prefersDarkMode);
}

// Toggle theme and save preference
themeToggle?.addEventListener('click', () => {
  const isDarkMode = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});


// =============================
// 📏 Progress Bar Optimization
// =============================
const progressBar = document.getElementById('progressBar');
let progressBarTicking = false;

function updateProgressBar() {
  if (!progressBarTicking) {
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      // Clamp progress between 0% and 100%
      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1) * 100;
      progressBar.style.width = progress + '%';
      progressBarTicking = false;
    });
    progressBarTicking = true;
  }
}

// Use passive event listeners to improve scrolling performance
window.addEventListener('scroll', updateProgressBar, { passive: true });


// =============================
// ⬆️ Back to Top Button Optimization
// =============================
const backToTopButton = document.getElementById('back-to-top');
let backToTopTicking = false;

function checkScroll() {
  if (!backToTopTicking) {
    requestAnimationFrame(() => {
      if (window.scrollY > 300) {
        backToTopButton.classList.remove('hidden');
      } else {
        backToTopButton.classList.add('hidden');
      }
      backToTopTicking = false;
    });
    backToTopTicking = true;
  }
}

window.addEventListener('scroll', checkScroll, { passive: true });

backToTopButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


// =============================
// 📋 FAQ Accordion Functionality
// =============================
function initFAQAccordions() {
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  faqTriggers.forEach((trigger) => {
    trigger.addEventListener('click', function () {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      const content = document.getElementById(this.getAttribute('aria-controls'));
      const icon = this.querySelector('.faq-icon');

      // Toggle this accordion
      this.setAttribute('aria-expanded', !isExpanded);

      if (isExpanded) {
        // Collapse
        content.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
      } else {
        // Expand
        content.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
      }
    });

    // Keyboard navigation support
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
}

// Initialize FAQ accordions when DOM is loaded
document.addEventListener('DOMContentLoaded', initFAQAccordions);

// Re-initialize if content is dynamically loaded
if (typeof window.reinitializeComponents === 'undefined') {
  window.reinitializeComponents = function () {
    initFAQAccordions();
    initLightbox();
  };
}


// =============================
// 🖼️ Accessible Lightbox Functionality
// =============================
function initLightbox() {
  const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
  let currentImageIndex = 0;
  let images = [];
  let isZoomed = false;
  let isDragging = false;
  let startX, startY, translateX = 0, translateY = 0;

  if (lightboxTriggers.length === 0) return;

  // Create lightbox overlay if it doesn't exist
  let lightboxOverlay = document.getElementById('lightbox-overlay');
  if (!lightboxOverlay) {
    lightboxOverlay = createLightboxOverlay();
    document.body.appendChild(lightboxOverlay);
  }

  const lightboxContent = lightboxOverlay.querySelector('.lightbox-content');
  const lightboxImage = lightboxOverlay.querySelector('.lightbox-image');
  const lightboxClose = lightboxOverlay.querySelector('.lightbox-close');
  const lightboxPrev = lightboxOverlay.querySelector('.lightbox-prev');
  const lightboxNext = lightboxOverlay.querySelector('.lightbox-next');
  const lightboxCounter = lightboxOverlay.querySelector('.lightbox-counter');

  // Collect all images
  images = Array.from(lightboxTriggers).map(trigger => ({
    src: trigger.src,
    alt: trigger.alt
  }));

  // Add click listeners to triggers
  lightboxTriggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => {
      currentImageIndex = index;
      openLightbox();
    });

    // Add keyboard support
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        currentImageIndex = index;
        openLightbox();
      }
    });
  });

  // Lightbox controls
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPreviousImage);
  lightboxNext.addEventListener('click', showNextImage);

  // Image zoom and pan functionality
  lightboxImage.addEventListener('click', handleImageClick);
  lightboxImage.addEventListener('dblclick', handleImageDoubleClick);
  lightboxImage.addEventListener('mousedown', handleMouseDown);
  lightboxImage.addEventListener('mousemove', handleMouseMove);
  lightboxImage.addEventListener('mouseup', handleMouseUp);
  lightboxImage.addEventListener('mouseleave', handleMouseUp);
  lightboxImage.addEventListener('wheel', handleWheel, { passive: false });

  // Touch events for mobile
  lightboxImage.addEventListener('touchstart', handleTouchStart, { passive: false });
  lightboxImage.addEventListener('touchmove', handleTouchMove, { passive: false });
  lightboxImage.addEventListener('touchend', handleTouchEnd);

  // Overlay click to close - only on overlay background
  lightboxOverlay.addEventListener('click', (e) => {
    // Close only if clicking on the dark overlay background
    if (e.target === lightboxOverlay) {
      closeLightbox();
    }
  });

  // Content area click to close - but not on image or controls
  lightboxContent.addEventListener('click', (e) => {
    // Close if clicking on content area but not on image, controls, or their children
    if (e.target === lightboxContent) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightboxOverlay.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        if (!isZoomed) showPreviousImage();
        break;
      case 'ArrowRight':
        if (!isZoomed) showNextImage();
        break;
    }
  });

  function openLightbox() {
    updateLightboxImage();
    lightboxOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus management for accessibility
    lightboxClose.focus();

    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Image ${currentImageIndex + 1} of ${images.length} opened in lightbox. Use arrow keys to navigate, escape to close.`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }

  function closeLightbox() {
    lightboxOverlay.classList.remove('active');
    document.body.style.overflow = '';

    // Reset zoom and pan when closing
    resetImageTransform();

    // Return focus to the trigger that opened the lightbox
    if (lightboxTriggers[currentImageIndex]) {
      lightboxTriggers[currentImageIndex].focus();
    }
  }

  function showPreviousImage() {
    if (isZoomed) return; // Don't navigate when zoomed
    currentImageIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    updateLightboxImage();
  }

  function showNextImage() {
    if (isZoomed) return; // Don't navigate when zoomed
    currentImageIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    updateLightboxImage();
  }

  function updateLightboxImage() {
    const currentImage = images[currentImageIndex];
    lightboxImage.src = currentImage.src;
    lightboxImage.alt = currentImage.alt;
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;

    // Reset zoom and pan when changing images
    resetImageTransform();

    // Update navigation button visibility
    lightboxPrev.style.display = images.length > 1 ? 'flex' : 'none';
    lightboxNext.style.display = images.length > 1 ? 'flex' : 'none';
  }

  function handleImageClick(e) {
    e.stopPropagation();

    // Only toggle zoom if we're not in the middle of a drag operation
    if (!isDragging) {
      toggleImageZoom();
    }
  }

  function handleImageDoubleClick(e) {
    e.stopPropagation();
    e.preventDefault();

    // Double-click always toggles zoom, regardless of drag state
    toggleImageZoom();
  }

  function handleWheel(e) {
    e.preventDefault();
    e.stopPropagation();

    // Scroll to zoom in/out
    const delta = e.deltaY > 0 ? -1 : 1;

    if (delta > 0 && !isZoomed) {
      // Zoom in
      zoomIn();
    } else if (delta < 0 && isZoomed) {
      // Zoom out
      zoomOut();
    }
  }

  function toggleImageZoom() {
    if (isZoomed) {
      zoomOut();
    } else {
      zoomIn();
    }
  }

  function zoomIn() {
    isZoomed = true;
    lightboxImage.classList.add('zoomed');
    lightboxContent.classList.add('zoomed');
    updateImageTransform();

    // Announce to screen readers
    announceToScreenReader('Image zoomed in. Use mouse wheel to zoom, drag to pan, or click to zoom out.');
  }

  function zoomOut() {
    isZoomed = false;
    translateX = 0;
    translateY = 0;
    lightboxImage.classList.remove('zoomed');
    lightboxContent.classList.remove('zoomed');
    lightboxImage.style.transform = '';

    // Announce to screen readers
    announceToScreenReader('Image zoomed out. Click or scroll to zoom in.');
  }

  function resetImageTransform() {
    isZoomed = false;
    translateX = 0;
    translateY = 0;
    lightboxImage.classList.remove('zoomed');
    lightboxContent.classList.remove('zoomed');
    lightboxImage.style.transform = '';
  }

  function updateImageTransform() {
    if (isZoomed) {
      lightboxImage.style.transform = `scale(2) translate(${translateX / 2}px, ${translateY / 2}px)`;
    }
  }

  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }

  // Mouse drag handlers
  function handleMouseDown(e) {
    if (!isZoomed) return;

    isDragging = false; // Reset drag state
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;

    // Set a small timeout to distinguish between click and drag
    setTimeout(() => {
      if (e.buttons === 1) { // Left mouse button still pressed
        isDragging = true;
      }
    }, 100);

    e.preventDefault();
  }

  function handleMouseMove(e) {
    if (!isZoomed) return;

    // Only start dragging if mouse has moved significantly
    const deltaX = Math.abs(e.clientX - startX - translateX);
    const deltaY = Math.abs(e.clientY - startY - translateY);

    if ((deltaX > 5 || deltaY > 5) && e.buttons === 1) {
      isDragging = true;
    }

    if (!isDragging) return;

    e.preventDefault();
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;

    // Apply constraints to prevent dragging too far
    const maxTranslate = 300;
    translateX = Math.max(-maxTranslate, Math.min(maxTranslate, translateX));
    translateY = Math.max(-maxTranslate, Math.min(maxTranslate, translateY));

    updateImageTransform();
  }

  function handleMouseUp(e) {
    // Small delay to allow click event to fire if it wasn't a drag
    setTimeout(() => {
      isDragging = false;
    }, 50);
  }

  // Touch handlers for mobile
  function handleTouchStart(e) {
    if (!isZoomed) return;

    const touch = e.touches[0];
    isDragging = false;
    startX = touch.clientX - translateX;
    startY = touch.clientY - translateY;
    e.preventDefault();
  }

  function handleTouchMove(e) {
    if (!isZoomed) return;

    e.preventDefault();
    const touch = e.touches[0];

    // Check if touch has moved significantly
    const deltaX = Math.abs(touch.clientX - startX - translateX);
    const deltaY = Math.abs(touch.clientY - startY - translateY);

    if (deltaX > 10 || deltaY > 10) {
      isDragging = true;
    }

    if (!isDragging) return;

    translateX = touch.clientX - startX;
    translateY = touch.clientY - startY;

    // Apply constraints
    const maxTranslate = 300;
    translateX = Math.max(-maxTranslate, Math.min(maxTranslate, translateX));
    translateY = Math.max(-maxTranslate, Math.min(maxTranslate, translateY));

    updateImageTransform();
  }

  function handleTouchEnd(e) {
    setTimeout(() => {
      isDragging = false;
    }, 50);
  }
}

function createLightboxOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image preview');

  overlay.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-close" aria-label="Close lightbox">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
          <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
        </svg>
      </button>
      
      <button class="lightbox-nav lightbox-prev" aria-label="Previous image">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
          <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
        </svg>
      </button>
      
      <button class="lightbox-nav lightbox-next" aria-label="Next image">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
          <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
        </svg>
      </button>
      
      <img class="lightbox-image" src="" alt="" />
      
      <div class="lightbox-counter" aria-live="polite"></div>
    </div>
  `;

  return overlay;
}

// Initialize lightbox when DOM is loaded
document.addEventListener('DOMContentLoaded', initLightbox);

// =============================
// 🎨 Dynamic Favicon
// =============================
function initDynamicFavicon() {
  const faviconLink = document.getElementById('dynamic-favicon');
  if (!faviconLink) return;

  const colors = [
    ['#D8DDEE', '#A7B7F1'], // Original: Blue-ish, Gray
    ['#A7B7F1', '#D8DDEE'], // Red-ish, Gray
  ];

  // Helper function to convert hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Helper function to convert RGB to hex
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  // Helper function to interpolate between two colors
  function interpolateColor(color1, color2, t) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const r = rgb1.r + (rgb2.r - rgb1.r) * t;
    const g = rgb1.g + (rgb2.g - rgb1.g) * t;
    const b = rgb1.b + (rgb2.b - rgb1.b) * t;
    return rgbToHex(r, g, b);
  }

  // Easing function for smooth animation (ease-in-out)
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function getSvgContent(color1, color2) {
    return `<svg width="216" height="216" viewBox="0 0 216 216" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="216" height="216" fill="white"/>
<rect x="72.0024" y="72.0024" width="144" height="144" fill="${color1}"/>
<rect width="144" height="144" fill="${color2}"/>
<path d="M53.1035 124.769L75.8848 122.554C77.2559 130.2 80.0244 135.816 84.1904 139.402C88.4092 142.988 94.0781 144.781 101.197 144.781C108.738 144.781 114.407 143.199 118.204 140.035C122.054 136.818 123.979 133.074 123.979 128.803C123.979 126.061 123.161 123.74 121.526 121.842C119.944 119.891 117.149 118.203 113.142 116.779C110.399 115.83 104.15 114.143 94.3945 111.717C81.8438 108.605 73.0371 104.782 67.9746 100.247C60.8555 93.8662 57.2959 86.0879 57.2959 76.9121C57.2959 71.0059 58.957 65.4951 62.2793 60.3799C65.6543 55.2119 70.4795 51.2832 76.7549 48.5938C83.083 45.9043 90.7031 44.5596 99.6152 44.5596C114.17 44.5596 125.112 47.75 132.442 54.1309C139.825 60.5117 143.701 69.0283 144.07 79.6807L120.656 80.709C119.654 74.75 117.492 70.4785 114.17 67.8945C110.9 65.2578 105.97 63.9395 99.3779 63.9395C92.5752 63.9395 87.249 65.3369 83.3994 68.1318C80.9209 69.9248 79.6816 72.3242 79.6816 75.3301C79.6816 78.0723 80.8418 80.4189 83.1621 82.3701C86.1152 84.8486 93.2871 87.4326 104.678 90.1221C116.068 92.8115 124.479 95.6064 129.911 98.5068C135.396 101.354 139.667 105.283 142.726 110.293C145.837 115.25 147.393 121.394 147.393 128.724C147.393 135.368 145.547 141.591 141.855 147.392C138.164 153.192 132.943 157.517 126.193 160.364C119.443 163.159 111.032 164.557 100.96 164.557C86.2998 164.557 75.041 161.182 67.1836 154.432C59.3262 147.629 54.6328 137.741 53.1035 124.769Z" fill="#080705"/>
</svg>`;
  }

  let startTime = Date.now();
  const duration = 2000; // 2 seconds per transition

  function animate() {
    const elapsed = (Date.now() - startTime) % (duration * 2);
    const progress = elapsed / duration;
    
    // Determine which direction we're animating
    let t;
    if (progress < 1) {
      // First half: transition from colors[0] to colors[1]
      t = easeInOut(progress);
      const [color1Start, color2Start] = colors[0];
      const [color1End, color2End] = colors[1];
      const color1 = interpolateColor(color1Start, color1End, t);
      const color2 = interpolateColor(color2Start, color2End, t);
      const svg = getSvgContent(color1, color2);
      const encoded = 'data:image/svg+xml;base64,' + btoa(svg);
      faviconLink.href = encoded;
    } else {
      // Second half: transition from colors[1] back to colors[0]
      t = easeInOut(progress - 1);
      const [color1Start, color2Start] = colors[1];
      const [color1End, color2End] = colors[0];
      const color1 = interpolateColor(color1Start, color1End, t);
      const color2 = interpolateColor(color2Start, color2End, t);
      const svg = getSvgContent(color1, color2);
      const encoded = 'data:image/svg+xml;base64,' + btoa(svg);
      faviconLink.href = encoded;
    }

    requestAnimationFrame(animate);
  }

  animate();
}

document.addEventListener('DOMContentLoaded', initDynamicFavicon);