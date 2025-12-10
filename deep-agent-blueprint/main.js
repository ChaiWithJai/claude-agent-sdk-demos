import { PageFlip } from 'page-flip';

// Initialize flipbook
const flipbookElement = document.getElementById('flipbook');
const pages = document.querySelectorAll('.page');
const totalPages = pages.length;

// Calculate responsive dimensions based on viewport
function getResponsiveDimensions() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw <= 480;
  const isTablet = vw <= 768 && vw > 480;

  // Calculate available space
  const padding = isMobile ? 16 : isTablet ? 24 : 32;
  const navHeight = isMobile ? 90 : isTablet ? 110 : 130;

  const availableWidth = vw - (padding * 2);
  const availableHeight = vh - navHeight;

  // Maintain aspect ratio (550:733 = 0.75)
  const aspectRatio = 550 / 733;

  let width, height;

  // On mobile, prioritize fitting height
  if (availableWidth / availableHeight > aspectRatio) {
    // Height constrained
    height = Math.min(availableHeight, 733);
    width = height * aspectRatio;
  } else {
    // Width constrained
    width = Math.min(availableWidth, 550);
    height = width / aspectRatio;
  }

  return {
    width: Math.floor(width),
    height: Math.floor(height),
    minWidth: isMobile ? 280 : 315,
    maxWidth: isMobile ? 400 : isTablet ? 500 : 550,
    minHeight: isMobile ? 373 : 420,
    maxHeight: isMobile ? 533 : isTablet ? 667 : 733
  };
}

const dims = getResponsiveDimensions();

// PageFlip configuration
const pageFlip = new PageFlip(flipbookElement, {
  width: dims.width,
  height: dims.height,
  size: 'stretch',
  minWidth: dims.minWidth,
  maxWidth: dims.maxWidth,
  minHeight: dims.minHeight,
  maxHeight: dims.maxHeight,
  drawShadow: true,
  flippingTime: 500,
  usePortrait: true,
  startZIndex: 0,
  autoSize: true,
  maxShadowOpacity: 0.4,
  showCover: true,
  mobileScrollSupport: true,
  swipeDistance: 20,
  clickEventForward: true,
  useMouseEvents: true,
  disableFlipByClick: false
});

// Handle resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const newDims = getResponsiveDimensions();
    pageFlip.updateFromHtml(pages);
  }, 250);
});

// Load pages from HTML
pageFlip.loadFromHTML(pages);

// Navigation elements
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const currentPageSpan = document.querySelector('.current-page');
const totalPagesSpan = document.querySelector('.total-pages');
const progressFill = document.querySelector('.progress-fill');

// Update display
totalPagesSpan.textContent = totalPages;

function updateUI() {
  const currentPage = pageFlip.getCurrentPageIndex() + 1;
  currentPageSpan.textContent = currentPage;

  // Update progress bar
  const progress = (currentPage / totalPages) * 100;
  progressFill.style.width = `${progress}%`;

  // Update button states
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage >= totalPages;

  // Track page views
  trackEvent('page_viewed', { page_number: currentPage });
}

// Navigation handlers
prevBtn.addEventListener('click', () => {
  pageFlip.flipPrev();
});

nextBtn.addEventListener('click', () => {
  pageFlip.flipNext();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    pageFlip.flipPrev();
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    pageFlip.flipNext();
    e.preventDefault();
  }
});

// Page flip events
pageFlip.on('flip', (e) => {
  updateUI();
});

pageFlip.on('changeState', (e) => {
  // Handle state changes if needed
});

// Initial UI update
updateUI();

// === Interactive Elements ===

// Quiz functionality (Page 9)
const quizOptions = document.querySelectorAll('.quiz-option');
quizOptions.forEach(option => {
  option.addEventListener('click', () => {
    // Remove selection from all options
    quizOptions.forEach(opt => opt.classList.remove('selected'));
    // Add selection to clicked option
    option.classList.add('selected');

    // Track quiz interaction
    trackEvent('quiz_answered', {
      page: 9,
      answer: option.dataset.value
    });

    // Store for later use
    localStorage.setItem('gtm_stage', option.dataset.value);
  });
});

// Self-assessment checklist (Page 19)
const checkboxes = document.querySelectorAll('#self-assessment input[type="checkbox"]');
const scoringResult = document.getElementById('scoring-result');
const scoreMessage = document.querySelector('.score-message');

function updateScoring() {
  const checked = document.querySelectorAll('#self-assessment input:checked').length;

  let message = '';
  if (checked >= 3) {
    message = "Perfect fit. Let's talk.";
  } else if (checked === 2) {
    message = "Worth exploring. Discovery call will clarify.";
  } else {
    message = "Maybe not the right time. Bookmark this for later.";
  }

  if (checked > 0) {
    scoringResult.classList.add('visible');
    scoreMessage.textContent = message;

    // Track assessment completion
    trackEvent('assessment_completed', {
      score: checked,
      message: message
    });
  } else {
    scoringResult.classList.remove('visible');
  }

  // Store assessment data for pre-filling discovery call
  const values = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
  localStorage.setItem('assessment_values', JSON.stringify(values));
}

checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', updateScoring);
});

// Share buttons (Page 20)
const shareButtons = document.querySelectorAll('.share-btn');
const shareUrl = window.location.href;
const shareTitle = 'Deep Agent Blueprint | Princeton Idea Exchange';
const shareText = 'The framework for AI that ships artifacts, not advice';

shareButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const platform = btn.dataset.platform;

    switch (platform) {
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => {
            btn.textContent = 'Copy Link';
          }, 2000);
        });
        break;
    }

    trackEvent('share_clicked', { platform });
  });
});

// Explore agents button - show gate
const exploreBtn = document.getElementById('explore-agents');
if (exploreBtn) {
  exploreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Book a discovery call first to unlock hands-on access to all 5 agents!');
    trackEvent('gated_content_clicked', { content: 'portfolio' });
  });
}

// === Analytics ===
function trackEvent(eventName, properties = {}) {
  // Add common properties
  const eventData = {
    ...properties,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    referrer: document.referrer,
    source: new URLSearchParams(window.location.search).get('ref') || 'direct'
  };

  // Log to console in development
  console.log(`[Analytics] ${eventName}`, eventData);

  // Send to analytics platform (Mixpanel, PostHog, etc.)
  // Example for PostHog:
  // if (window.posthog) {
  //   window.posthog.capture(eventName, eventData);
  // }

  // Example for Mixpanel:
  // if (window.mixpanel) {
  //   window.mixpanel.track(eventName, eventData);
  // }
}

// Track initial page view
trackEvent('flipbook_opened', {
  total_pages: totalPages,
  user_agent: navigator.userAgent
});

// Track session start
const sessionStart = Date.now();
window.addEventListener('beforeunload', () => {
  const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
  trackEvent('session_ended', {
    duration_seconds: sessionDuration,
    pages_viewed: pageFlip.getCurrentPageIndex() + 1
  });
});

// === URL Parameters ===
const urlParams = new URLSearchParams(window.location.search);

// Handle page parameter (deep linking)
const pageParam = urlParams.get('page');
if (pageParam) {
  const targetPage = parseInt(pageParam, 10) - 1;
  if (targetPage >= 0 && targetPage < totalPages) {
    setTimeout(() => {
      pageFlip.turnToPage(targetPage);
    }, 500);
  }
}

// Handle ref parameter for tracking
const refParam = urlParams.get('ref');
if (refParam) {
  localStorage.setItem('referral_source', refParam);
  trackEvent('referral_landed', { source: refParam });
}

// === Accessibility ===
// Add focus indicators for keyboard navigation
pages.forEach((page, index) => {
  page.setAttribute('tabindex', '0');
  page.setAttribute('role', 'article');
  page.setAttribute('aria-label', `Page ${index + 1} of ${totalPages}`);
});

// Announce page changes to screen readers
const liveRegion = document.createElement('div');
liveRegion.setAttribute('aria-live', 'polite');
liveRegion.setAttribute('aria-atomic', 'true');
liveRegion.className = 'sr-only';
liveRegion.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;';
document.body.appendChild(liveRegion);

pageFlip.on('flip', (e) => {
  liveRegion.textContent = `Page ${e.data + 1} of ${totalPages}`;
});

// === Touch gestures ===
let touchStartX = 0;
let touchEndX = 0;

flipbookElement.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

flipbookElement.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      pageFlip.flipNext();
    } else {
      pageFlip.flipPrev();
    }
  }
}

// === Preload images for smoother experience ===
function preloadNextPages() {
  const currentPage = pageFlip.getCurrentPageIndex();
  const pagesToPreload = [currentPage + 1, currentPage + 2];

  pagesToPreload.forEach(pageIndex => {
    if (pageIndex < totalPages) {
      const page = pages[pageIndex];
      const images = page.querySelectorAll('img[data-src]');
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
      });
    }
  });
}

pageFlip.on('flip', preloadNextPages);

console.log('Deep Agent Blueprint initialized successfully!');
