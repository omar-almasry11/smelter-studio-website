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
    trigger.addEventListener('click', function() {
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
    trigger.addEventListener('keydown', function(e) {
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
  window.reinitializeComponents = function() {
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