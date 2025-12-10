# Deep Agent Blueprint - Maintenance & Extension Guide

**Live URL**: https://deep-agent-blueprint.netlify.app
**Repository**: `/Users/shambhavi/Documents/projects/claude-agent-sdk-demos/deep-agent-blueprint`

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Development Setup](#development-setup)
4. [Adding New Pages](#adding-new-pages)
5. [Modifying Content](#modifying-content)
6. [Branding & Colors](#branding--colors)
7. [Interactive Elements](#interactive-elements)
8. [Deployment](#deployment)
9. [Analytics Integration](#analytics-integration)
10. [Social Sharing & Meta Tags](#social-sharing--meta-tags)
11. [CSS Classes Reference](#css-classes-reference)
12. [JavaScript Events](#javascript-events)
13. [Testing](#testing)
14. [Troubleshooting](#troubleshooting)

---

## Project Overview

The Deep Agent Blueprint is a 20-page interactive HTML5 flipbook built for Princeton Idea Exchange (PIE). It showcases the Deep Agent framework through an instructionally-designed journey:

- **Pages 1-4**: Problem awareness (pain points → promises)
- **Pages 5-12**: The 4 principles with case studies
- **Pages 13-16**: Social proof (metrics, portfolio, testimonials)
- **Pages 17-20**: Conversion path (journey map, self-assessment, CTA)

### Tech Stack
- **Build Tool**: Vite 6.0.3
- **Flipbook Library**: page-flip 2.0.7
- **Fonts**: Inter + JetBrains Mono (Google Fonts CDN)
- **Deployment**: Netlify

---

## File Structure

```
deep-agent-blueprint/
├── index.html          # All 20 pages + navigation
├── main.js             # Flipbook logic, interactivity, analytics
├── style.css           # All styles including responsive breakpoints
├── vite.config.js      # Vite build configuration
├── netlify.toml        # Netlify deployment settings
├── package.json        # Dependencies and scripts
├── .gitignore          # Git ignore patterns
└── dist/               # Production build output (generated)
```

---

## Development Setup

### Prerequisites
- Node.js 20+
- npm

### Install & Run

```bash
cd /Users/shambhavi/Documents/projects/claude-agent-sdk-demos/deep-agent-blueprint

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:3000` (or next available port).

---

## Adding New Pages

### Step 1: Add HTML in index.html

Insert a new `<div class="page">` inside `#flipbook`:

```html
<!-- Page 21: New Content -->
<div class="page" data-density="soft">
  <div class="page-content">
    <h2 class="page-headline">Your Headline</h2>
    <p>Your content here...</p>
  </div>
</div>
```

### Step 2: Choose Page Type

Use existing page classes for consistent styling:

| Page Type | Class | Use Case |
|-----------|-------|----------|
| Cover | `page-cover` | First/last pages with dark background |
| Divider | `divider-page` | Section separators |
| Principle | `principle-page` | Framework principles |
| Story | `story-page` | Case studies |
| Metrics | `metrics-page` | Numbers/stats |
| Interactive | `interactive-page` | Quiz/checklist |

### Step 3: Update Total Pages

The JavaScript automatically counts pages, but update the meta if needed.

---

## Modifying Content

### Edit Text Content

All content is in `index.html`. Find the page by searching for its headline:

```html
<!-- Page 2: Pain Points -->
<h2 class="page-headline">Sound familiar?</h2>
```

### Change Pain Points (Page 2)

```html
<ul class="pain-points">
  <li>
    <span class="pain-icon">💨</span>
    <span>Your new pain point text here</span>
  </li>
</ul>
```

### Update Metrics (Page 14)

```html
<div class="metric-card">
  <span class="metric-number">5</span>
  <span class="metric-label">Working Agents</span>
  <span class="metric-subtext">Across sales, research, learning, GTM</span>
</div>
```

---

## Branding & Colors

### CSS Variables (style.css lines 1-15)

```css
:root {
  --primary: #1A1A2E;        /* Dark navy - backgrounds */
  --accent: #E94560;         /* PIE red - CTAs, highlights */
  --accent-hover: #D63D56;   /* Darker red - hover states */
  --success: #059669;        /* Green - positive states */
  --warning: #DC2626;        /* Red - alerts, pain points */
  --background: #FAFAF9;     /* Off-white - page background */
  --text-primary: #1A1A1A;   /* Near black - headings */
  --text-secondary: #6B7280; /* Gray - body text */
  --text-muted: #9CA3AF;     /* Light gray - captions */
}
```

### Change Logo

In `index.html`, find the logo elements:

```html
<div class="logo">
  <div class="logo-mark">PIE</div>
  <span class="logo-text">PRINCETON IDEA EXCHANGE</span>
</div>
```

---

## Interactive Elements

### Quiz (Page 9)

```html
<div class="quiz-options" id="gtm-quiz">
  <button class="quiz-option" data-value="option1">Option 1</button>
  <button class="quiz-option" data-value="option2">Option 2</button>
</div>
```

### Self-Assessment Checklist (Page 19)

```html
<div class="checklist" id="self-assessment">
  <label class="checklist-item">
    <input type="checkbox" name="assessment" value="item1">
    <span class="checkmark"></span>
    <span>Checklist item text</span>
  </label>
</div>
```

### Share Buttons (Page 20)

```html
<div class="share-buttons">
  <button class="share-btn" data-platform="linkedin">Share on LinkedIn</button>
  <button class="share-btn" data-platform="twitter">Share on X</button>
  <button class="share-btn" data-platform="copy">Copy Link</button>
</div>
```

---

## Deployment

### Manual Deploy

```bash
npm run build
netlify deploy --prod --dir=dist
```

### First-Time Setup

```bash
netlify login
netlify sites:create --name your-site-name
netlify link
```

---

## Analytics Integration

### PostHog

Add to `index.html` before `</head>`:

```html
<script>
  posthog.init('YOUR_POSTHOG_KEY', {api_host: 'https://app.posthog.com'})
</script>
```

Update `main.js` trackEvent:

```javascript
function trackEvent(eventName, properties = {}) {
  if (window.posthog) {
    window.posthog.capture(eventName, properties);
  }
}
```

### Tracked Events

| Event | Trigger |
|-------|---------|
| `flipbook_opened` | Page load |
| `page_viewed` | Each flip |
| `quiz_answered` | Quiz selection |
| `assessment_completed` | Checklist change |
| `share_clicked` | Share button click |
| `session_ended` | Page unload |

---

## Social Sharing & Meta Tags

### Open Graph (index.html)

```html
<meta property="og:title" content="Deep Agent Blueprint | Princeton Idea Exchange">
<meta property="og:description" content="The framework for AI that ships artifacts, not advice">
<meta property="og:image" content="https://deep-agent-blueprint.netlify.app/og-image.png">
```

### Create og-image.png

Specs: 1200x630px PNG. Place in project root.

### Update Calendly Link

In Page 20:

```html
<a href="https://calendly.com/YOUR_LINK" class="cta-button primary">
  Book Discovery Call
</a>
```

---

## CSS Classes Reference

### Page Types
- `.page-cover` - Dark background covers
- `.divider-page` - Section dividers
- `.principle-page` - Framework principles
- `.metrics-page` - Statistics pages
- `.interactive-page` - Quiz/checklist
- `.cta-page` - Call-to-action page

### Components
- `.pain-points` - Red-bordered list
- `.promise-list` - Green-bordered list
- `.comparison` - Side-by-side grid
- `.metric-card` - Number cards
- `.testimonial-card` - Quote cards
- `.quiz-option` - Quiz buttons
- `.checklist-item` - Checkbox rows

### Responsive Breakpoints
- `@media (max-width: 768px)` - Tablet
- `@media (max-width: 480px)` - Mobile
- `@media (max-width: 360px)` - Small mobile

---

## JavaScript Events

### PageFlip Methods

```javascript
pageFlip.flipNext();           // Next page
pageFlip.flipPrev();           // Previous page
pageFlip.turnToPage(5);        // Jump to page 6
pageFlip.getCurrentPageIndex(); // Get current page
```

### URL Parameters

| Parameter | Purpose |
|-----------|---------|
| `?page=5` | Deep link to page 5 |
| `?ref=linkedin` | Track referral source |

---

## Testing

### Device Checklist
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (390x844)
- [ ] Small mobile (375x667)

### Functionality Checklist
- [ ] Page flipping (click, swipe, keyboard)
- [ ] Quiz selection
- [ ] Assessment scoring
- [ ] Share buttons
- [ ] Deep linking (?page=N)

---

## Troubleshooting

### Build Fails
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Mobile Layout Issues
Check viewport meta tag:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## Quick Commands

```bash
npm run dev          # Development
npm run build        # Production build
netlify deploy --prod --dir=dist  # Deploy
```

---

*Last updated: December 2024*
