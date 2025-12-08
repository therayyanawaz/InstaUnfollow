// ==UserScript==
// @name         Instagram Unfollowers 
// @namespace    https://instagram.com/
// @version      1.0
// @description  Find accounts that don't follow you back - works with any account by URL
// @author       therayyanawaz
// @match        https://www.instagram.com/*
// @grant        none
// ==/UserScript==

/**
 * ============================================
 * Instagram Unfollowers v1.0
 * ============================================
 * 
 * This userscript allows you to analyze any Instagram account's
 * following/followers data by navigating to:
 * 
 *   https://www.instagram.com/{username}
 * 
 * Features:
 * - Dynamic username detection from URL
 * - Fetch and display followers/following for any public account
 * - Compare who doesn't follow back
 * - Whitelist management
 * - Unfollow functionality (for your own account only)
 * - Beautiful, modern dark UI
 * - Rate limit handling with automatic pausing
 * 
 * Usage:
 * 1. Navigate to instagram.com/{username} for any account
 * 2. The script will automatically detect the username
 * 3. Click "START" to begin scanning
 * 4. For private accounts, you must be following them
 * 
 * @author therayyanawaz
 */

(function () {
  'use strict';

  // ============================================
  // Inject Styles
  // ============================================
  const styles = `
    /* CSS Custom Properties - Terminal/Hacker Theme */
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    
    .iu-app {
      /* Background colors - Deep terminal blacks */
      --color-bg-primary: #000000;
      --color-bg-secondary: #050505;
      --color-bg-tertiary: #0a0a0a;
      --color-bg-elevated: #111111;
      --color-bg-hover: #1a1a1a;
      
      /* Text colors - Terminal greens and grays */
      --color-text-primary: #00ff41;
      --color-text-secondary: #00cc33;
      --color-text-muted: #338833;
      --color-text-highlight: #00ff66;
      
      /* Accent colors - Neon terminal green */
      --color-accent: #00ff41;
      --color-accent-hover: #33ff66;
      --color-accent-subtle: rgba(0, 255, 65, 0.08);
      --color-accent-glow: rgba(0, 255, 65, 0.4);
      
      /* Secondary accent - Dimmer green */
      --color-accent-secondary: #00cc33;
      --color-accent-secondary-subtle: rgba(0, 204, 51, 0.1);
      
      /* Status colors - Green variants */
      --color-success: #00ff41;
      --color-success-subtle: rgba(0, 255, 65, 0.1);
      --color-warning: #ffcc00;
      --color-warning-subtle: rgba(255, 204, 0, 0.1);
      --color-error: #ff3333;
      --color-error-subtle: rgba(255, 51, 51, 0.1);
      --color-info: #00ccff;
      --color-info-subtle: rgba(0, 204, 255, 0.1);
      
      /* Border and shadows - Terminal green glow */
      --color-border: #003311;
      --color-border-hover: #00ff41;
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.8);
      --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.9);
      --shadow-lg: 0 8px 40px rgba(0, 0, 0, 1);
      --shadow-glow: 0 0 20px rgba(0, 255, 65, 0.3);
      --shadow-glow-strong: 0 0 40px rgba(0, 255, 65, 0.5);
      
      /* Spacing - Scaled for larger font */
      --space-xs: 0.35rem;
      --space-sm: 0.625rem;
      --space-md: 1.125rem;
      --space-lg: 1.5rem;
      --space-xl: 1.75rem;
      
      /* Typography - Monospace terminal font */
      --font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
      --transition-fast: 100ms ease;
      --transition-base: 200ms ease;
      
      /* Border radius - Sharp terminal style */
      --radius-sm: 4px;
      --radius-md: 6px;
      --radius-lg: 8px;
      --radius-full: 9999px;

      font-family: var(--font-family);
      background: #000000;
      color: var(--color-text-primary);
      min-height: 100vh;
      box-sizing: border-box;
      font-size: 16px;
      line-height: 1.5;
      letter-spacing: 0.02em;
    }
    
    /* CRT scanline effect overlay */
    .iu-app::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.1) 0px,
        rgba(0, 0, 0, 0.1) 1px,
        transparent 1px,
        transparent 2px
      );
      pointer-events: none;
      z-index: 9999;
      opacity: 0.3;
    }

    .iu-app *, .iu-app *::before, .iu-app *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* Central page container for content */
    .page-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 var(--space-xl);
      width: 100%;
    }

    .iu-header {
      background: linear-gradient(180deg, rgba(13, 13, 13, 0.95) 0%, rgba(0, 0, 0, 0.95) 100%);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-xl);
      position: sticky;
      top: 0;
      z-index: 10;
      width: 100%;
    }

    .iu-header-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: var(--space-lg) var(--space-xl);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-md);
    }

    /* Terminal-style glowing line under header */
    .iu-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--color-accent);
      box-shadow: 0 0 10px var(--color-accent), 0 0 20px var(--color-accent-glow);
      opacity: 0.8;
    }

    .iu-brand {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .iu-logo {
      width: 40px;
      height: 40px;
      background: transparent;
      border: 2px solid var(--color-accent);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      box-shadow: 0 0 15px var(--color-accent-glow);
      color: var(--color-accent);
    }

    .iu-title {
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--color-accent);
      text-shadow: 0 0 10px var(--color-accent-glow);
    }
    
    /* Blinking cursor after title */
    .iu-title::after {
      content: '_';
      animation: blink 1s step-end infinite;
    }
    
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    .iu-subtitle {
      font-size: 0.7rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 400;
    }

    .iu-actions {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .iu-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      padding: 0.5rem var(--space-lg);
      font-family: inherit;
      font-size: 0.8rem;
      font-weight: 500;
      border: 1px solid var(--color-accent);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-base);
      white-space: nowrap;
      position: relative;
      overflow: hidden;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .iu-btn-primary {
      background: transparent;
      color: var(--color-accent);
      border: 1px solid var(--color-accent);
      box-shadow: 0 0 10px var(--color-accent-glow);
    }

    .iu-btn-primary:hover {
      background: var(--color-accent);
      color: #000000;
      box-shadow: 0 0 20px var(--color-accent-glow), 0 0 40px var(--color-accent-glow);
      transform: translateY(-1px);
    }

    .iu-btn-secondary {
      background: transparent;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
    }

    .iu-btn-secondary:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
      box-shadow: 0 0 10px var(--color-accent-glow);
    }

    .iu-btn-danger {
      background: transparent;
      color: var(--color-error);
      border: 1px solid var(--color-error);
      box-shadow: 0 2px 10px rgba(140, 140, 140, 0.2);
    }

    .iu-btn-danger:hover {
      background: var(--color-error);
      color: #ffffff;
      border-color: var(--color-error);
      box-shadow: 0 4px 15px rgba(140, 140, 140, 0.3);
      transform: translateY(-1px);
    }

    .iu-btn-ghost {
      background: transparent;
      color: var(--color-text-secondary);
    }

    .iu-btn-ghost:hover {
      background: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }

    .iu-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    .iu-input {
      padding: 0.75rem var(--space-lg);
      font-family: inherit;
      font-size: 0.9rem;
      background: #000000;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-accent);
      transition: all var(--transition-base);
      min-width: 240px;
    }

    .iu-input::placeholder {
      color: var(--color-text-muted);
      font-style: italic;
    }

    .iu-input:focus {
      outline: none;
      border-color: var(--color-accent);
      background: #050505;
      box-shadow: 0 0 15px var(--color-accent-glow), inset 0 0 20px rgba(0, 255, 65, 0.05);
    }

    /* Large input variant for username */
    .iu-input-lg {
      padding: 1rem var(--space-xl);
      font-size: 1.1rem;
      font-weight: 500;
      letter-spacing: 0.05em;
    }

    .iu-start-screen {
      max-width: 750px;
      margin: 0 auto;
      padding: var(--space-xl);
    }

    .iu-start-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
      width: 100%;
    }

    .iu-start-button-wrapper {
      display: flex;
      justify-content: center;
      width: 100%;
      margin-top: var(--space-xl);
    }

    .iu-start-icon {
      width: 60px;
      height: 60px;
      background: transparent;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--color-accent);
      font-size: 1.5rem;
      box-shadow: 0 0 20px var(--color-accent-glow);
      margin-bottom: var(--space-md);
    }

    .iu-start-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: var(--space-sm);
      color: var(--color-accent);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-shadow: 0 0 20px var(--color-accent-glow);
    }
    
    .iu-start-title::before {
      content: '> ';
      color: var(--color-text-muted);
    }

    .iu-start-desc {
      max-width: 600px;
      color: var(--color-text-secondary);
      line-height: 1.8;
      font-size: 0.85rem;
    }

    .iu-start-btn {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      font-size: 1rem;
      font-weight: 600;
      background: transparent;
      border: 2px solid var(--color-accent);
      color: var(--color-accent);
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: 0 0 30px var(--color-accent-glow);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .iu-start-btn:hover:not(:disabled) {
      background: var(--color-accent);
      color: #000000;
      box-shadow: 0 0 50px var(--color-accent-glow), 0 0 80px var(--color-accent-glow);
      transform: scale(1.05);
    }

    .iu-start-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      border-color: var(--color-text-muted);
      color: var(--color-text-muted);
      box-shadow: none;
    }

    /* Shared container for profile card + layout alignment */
    .iu-main-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 var(--space-xl);
      width: 100%;
    }

    .iu-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 48px;
    }

    @media (max-width: 768px) {
      .iu-layout {
        grid-template-columns: 1fr;
      }
    }

    .iu-sidebar {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }

    /* Terminal window style sections */
    .iu-section {
      background: #000000;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: var(--space-lg);
      transition: all var(--transition-base);
      width: 100%;
    }
    
    .iu-section:hover {
      border-color: var(--color-accent);
      box-shadow: 0 0 15px var(--color-accent-glow);
    }

    /* Terminal-style section title [ TITLE ] */
    .iu-section-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-accent);
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: var(--space-lg);
      padding-bottom: var(--space-sm);
      border-bottom: 1px solid var(--color-border);
    }
    
    .iu-section-title::before {
      content: '[ ';
      color: var(--color-text-muted);
    }
    
    .iu-section-title::after {
      content: ' ]';
      color: var(--color-text-muted);
    }

    .iu-stats {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .iu-stat-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      padding: var(--space-xs) 0;
    }

    .iu-stat-label {
      color: var(--color-text-secondary);
    }

    .iu-stat-value {
      color: var(--color-text-highlight);
      font-weight: 600;
    }

    .iu-filter-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .iu-filter-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-md);
      padding: var(--space-md);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-base);
      border: 1px solid var(--color-border);
    }

    .iu-filter-item:hover {
      border-color: var(--color-accent);
      box-shadow: 0 0 10px var(--color-accent-glow);
    }

    /* Terminal checkbox styling */
    .iu-checkbox {
      width: 18px;
      height: 18px;
      min-width: 18px;
      border: 1px solid var(--color-text-muted);
      border-radius: 2px;
      appearance: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      position: relative;
      margin-top: 2px;
      background: transparent;
    }

    .iu-checkbox:checked {
      background: transparent;
      border-color: var(--color-accent);
    }

    .iu-checkbox:checked::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--color-accent);
      font-size: 12px;
      font-weight: bold;
      text-shadow: 0 0 5px var(--color-accent-glow);
    }

    .iu-checkbox:indeterminate {
      background: transparent;
      border-color: var(--color-accent);
    }

    .iu-checkbox:indeterminate::after {
      content: '−';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }

    /* Terminal radio button styling */
    .iu-radio {
      width: 18px;
      height: 18px;
      min-width: 18px;
      border: 1px solid var(--color-text-muted);
      border-radius: 50%;
      appearance: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      position: relative;
      margin-top: 2px;
      background: transparent;
    }

    .iu-radio:checked {
      border-color: var(--color-accent);
      background: transparent;
      box-shadow: 0 0 8px var(--color-accent-glow);
    }

    .iu-radio:checked::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      background: var(--color-accent);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--color-accent-glow);
    }

    .iu-radio:hover {
      border-color: var(--color-accent);
    }

    /* Radio option content */
    .iu-radio-content {
      flex: 1;
    }

    .iu-radio-label {
      font-weight: 500;
      font-size: 0.85rem;
      color: var(--color-accent);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .iu-radio-desc {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .iu-tabs {
      display: flex;
      gap: var(--space-xs);
      padding: var(--space-sm);
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-lg);
    }

    .iu-tab {
      flex: 1;
      padding: 0.75rem var(--space-md);
      font-size: 0.875rem;
      font-weight: 600;
      text-align: center;
      border-radius: var(--radius-sm);
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: all var(--transition-base);
      border: none;
      background: transparent;
    }

    .iu-tab:hover {
      color: var(--color-text-primary);
      background: var(--color-bg-tertiary);
    }

    .iu-tab-active {
      background: linear-gradient(135deg, #ffffff 0%, #e6e6e6 100%);
      color: #000000;
      box-shadow: 0 4px 15px var(--color-accent-glow);
    }

    .iu-user-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .iu-user-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(13, 13, 13, 0.6) 100%);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      transition: all var(--transition-base);
    }

    .iu-user-item:hover {
      background: linear-gradient(135deg, var(--color-bg-tertiary) 0%, var(--color-bg-secondary) 100%);
      border-color: var(--color-border-hover);
      transform: translateX(4px);
    }

    .iu-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      background: var(--color-bg-tertiary);
      border: 2px solid var(--color-border);
      transition: all var(--transition-base);
    }

    .iu-user-item:hover .iu-avatar {
      border-color: var(--color-accent);
      box-shadow: 0 0 15px var(--color-accent-glow);
    }

    .iu-user-info {
      flex: 1;
      min-width: 0;
    }

    .iu-username {
      font-weight: 600;
      color: var(--color-text-primary);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .iu-username:hover {
      color: var(--color-accent);
    }

    .iu-fullname {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .iu-badges {
      display: flex;
      gap: var(--space-xs);
    }

    .iu-badge {
      padding: 3px 10px;
      font-size: 0.7rem;
      font-weight: 600;
      border-radius: var(--radius-full);
      border: 1px solid;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .iu-badge-verified {
      color: var(--color-info);
      border-color: var(--color-info);
      background: var(--color-info-subtle);
    }

    .iu-badge-private {
      color: var(--color-warning);
      border-color: var(--color-warning);
      background: var(--color-warning-subtle);
    }

    /* Progress bar container with percentage */
    .iu-progress-container {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      width: 100%;
      margin-top: var(--space-md);
    }

    .iu-progress {
      flex: 1;
      height: 6px;
      background: var(--color-bg-tertiary);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .iu-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-secondary) 100%);
      box-shadow: 0 0 10px var(--color-accent-glow);
      transition: width 0.3s ease;
    }
    
    .iu-progress-pct {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-accent);
      min-width: 40px;
      text-align: right;
      text-shadow: 0 0 10px var(--color-accent-glow);
      white-space: nowrap;
    }

    .iu-pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-md);
      padding: var(--space-md) 0;
    }

    .iu-page-info {
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }

    .iu-toast {
      position: fixed;
      bottom: var(--space-xl);
      right: var(--space-xl);
      padding: var(--space-md) var(--space-lg);
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      gap: var(--space-md);
      max-width: 400px;
      z-index: 10000;
      animation: iu-slide-in 0.2s ease;
    }

    .iu-toast-success { border-left: 3px solid var(--color-success); }
    .iu-toast-error { border-left: 3px solid var(--color-error); }
    .iu-toast-info { border-left: 3px solid var(--color-info); }
    .iu-toast-warning { border-left: 3px solid var(--color-warning); }

    @keyframes iu-slide-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .iu-empty {
      text-align: center;
      padding: var(--space-xl);
      color: var(--color-text-muted);
    }

    .iu-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      backdrop-filter: blur(4px);
    }

    .iu-modal {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .iu-modal-header {
      padding: var(--space-lg);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .iu-modal-title {
      font-size: 1.125rem;
      font-weight: 600;
    }

    .iu-modal-body {
      padding: var(--space-lg);
    }

    .iu-modal-footer {
      padding: var(--space-lg);
      border-top: 1px solid var(--color-border);
      display: flex;
      gap: var(--space-md);
      justify-content: flex-end;
    }

    .iu-form-group {
      margin-bottom: var(--space-lg);
      width: 100%;
    }

    .iu-form-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-accent);
      margin-bottom: var(--space-sm);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .iu-form-label::before {
      content: '> ';
      color: var(--color-text-muted);
    }

    .iu-form-hint {
      font-size: 0.7rem;
      color: var(--color-text-muted);
      margin-top: var(--space-sm);
      font-style: italic;
    }

    /* Full-width input for start screen */
    .iu-form-group .iu-input {
      width: 100%;
    }

    .iu-warning {
      padding: var(--space-md) var(--space-lg);
      background: #000000;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      width: 100%;
    }

    .iu-warning-title {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-warning);
      margin-bottom: var(--space-xs);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .iu-warning-text {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    /* Pulse animation for loading states */
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.95); }
    }

    /* Shimmer animation */
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Target user profile card - 3-column flex structure */
    .iu-profile-card {
      display: flex;
      align-items: center;
      width: 100%;
      padding: var(--space-xl);
      background: linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(26, 26, 26, 0.9) 100%);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-xl);
      position: relative;
      overflow: hidden;
    }

    .iu-profile-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-secondary) 50%, var(--color-accent) 100%);
    }

    /* Column 1: Avatar - fixed width, right margin */
    .iu-profile-avatar {
      flex: 0 0 auto;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--color-accent);
      box-shadow: 0 0 25px var(--color-accent-glow);
      margin-right: 24px;
    }

    /* Column 2: Name block - flex grow to fill middle, centered content */
    .iu-profile-info {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
      text-align: left;
    }

    .iu-profile-username {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: var(--space-xs);
      background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-accent-secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .iu-profile-name {
      color: var(--color-text-secondary);
      margin-bottom: 0;
      font-size: 0.8rem;
    }

    /* Column 3: Stats boxes - fixed width, left margin */
    .iu-profile-stats {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin-left: 40px;
    }

    .iu-profile-stat {
      text-align: center;
      padding: var(--space-xs) var(--space-sm);
      background: var(--color-bg-tertiary);
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      min-width: 65px;
      transition: all var(--transition-base);
    }

    .iu-profile-stat:hover {
      border-color: var(--color-accent);
      background: var(--color-bg-elevated);
    }

    .iu-profile-stat-value {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text-highlight);
    }

    .iu-profile-stat-label {
      font-size: 0.6rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 2px;
    }

    /* Disabled button state */
    .iu-start-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      border-color: var(--color-text-muted);
      color: var(--color-text-muted);
    }
  `;

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // ============================================
  // Constants - Configuration for the script
  // ============================================
  const CONFIG = {
    STORAGE_KEY: 'iu_whitelist_v2',
    SETTINGS_KEY: 'iu_settings_v2',
    CACHE_KEY: 'iu_user_cache_v1',
    USERS_PER_PAGE: 50,
    DEFAULT_SETTINGS: {
      searchDelay: 1000,      // Delay between API requests (ms)
      searchPause: 10000,     // Pause after 5 searches (ms)
      unfollowDelay: 4000,    // Delay between unfollows (ms)
      unfollowPause: 300000   // Pause after 5 unfollows (ms)
    }
  };

  // ============================================
  // Utilities - Helper functions
  // ============================================

  /**
   * Sleep for a specified duration
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after the delay
   */
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /**
   * Get a cookie value by name
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value or null
   */
  const getCookie = name => {
    const parts = `; ${document.cookie}`.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
  };

  /**
   * Generate a random delay around a base value
   * @param {number} base - Base delay in ms
   * @param {number} v - Variance factor (0-1)
   * @returns {number} Random delay value
   */
  const randomDelay = (base, v = 0.3) => Math.floor(Math.random() * (base * 2 * v) + base * (1 - v));

  /**
   * Parse username from URL path
   * Handles URLs like:
   * - instagram.com/username
   * - instagram.com/username/
   * - instagram.com/username/following
   * @returns {string|null} Username or null if not found
   */
  const parseUsernameFromURL = () => {
    const path = window.location.pathname;
    // Extract the first path segment (username)
    const match = path.match(/^\/([a-zA-Z0-9._]+)/);
    if (match && match[1]) {
      // Exclude known Instagram routes
      const reserved = ['explore', 'reels', 'stories', 'direct', 'accounts', 'p', 'reel', 'tv', 'api'];
      if (!reserved.includes(match[1].toLowerCase())) {
        return match[1];
      }
    }
    return null;
  };

  /**
   * Validate if a string is a valid Instagram username
   * @param {string} username - Username to validate
   * @returns {boolean} True if valid
   */
  const isValidUsername = username => {
    if (!username) return false;
    // Instagram usernames: 1-30 chars, alphanumeric, underscores, periods
    return /^[a-zA-Z0-9._]{1,30}$/.test(username);
  };

  // ============================================
  // Storage - Local storage wrapper
  // ============================================
  const Storage = {
    /**
     * Get a value from localStorage
     * @param {string} key - Storage key
     * @param {*} def - Default value if not found
     * @returns {*} Stored value or default
     */
    get: (key, def = null) => {
      try { return JSON.parse(localStorage.getItem(key)) || def; }
      catch { return def; }
    },

    /**
     * Set a value in localStorage
     * @param {string} key - Storage key
     * @param {*} val - Value to store
     */
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),

    /**
     * Remove a value from localStorage
     * @param {string} key - Storage key
     */
    remove: (key) => localStorage.removeItem(key)
  };

  // ============================================
  // Instagram API - All API interactions
  // ============================================
  const API = {
    // Current user credentials
    userId: getCookie('ds_user_id'),
    csrf: getCookie('csrftoken'),

    /**
     * Fetch user profile by username
     * @param {string} username - Instagram username
     * @returns {Promise<Object>} User profile data
     * @throws {Error} If user not found or private
     */
    async getUserByUsername(username) {
      try {
        // Use the web profile info endpoint
        const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
        const res = await fetch(url, {
          headers: {
            'x-ig-app-id': '936619743392459',
            'x-requested-with': 'XMLHttpRequest'
          },
          credentials: 'include'
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`User "${username}" not found`);
          }
          throw new Error(`Failed to fetch user: HTTP ${res.status}`);
        }

        const data = await res.json();

        if (!data.data || !data.data.user) {
          throw new Error(`User "${username}" not found`);
        }

        const user = data.data.user;

        return {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          profile_pic_url: user.profile_pic_url,
          is_private: user.is_private,
          is_verified: user.is_verified,
          follower_count: user.edge_followed_by?.count || 0,
          following_count: user.edge_follow?.count || 0,
          post_count: user.edge_owner_to_timeline_media?.count || 0,
          biography: user.biography,
          external_url: user.external_url
        };
      } catch (err) {
        console.error('[API] getUserByUsername error:', err);
        throw err;
      }
    },

    /**
     * Fetch following list for a specific user
     * @param {string} userId - Instagram user ID
     * @param {string} cursor - Pagination cursor
     * @returns {Promise<Object>} Following data with edges and page info
     */
    async getFollowing(userId, cursor = null) {
      const params = {
        id: userId,
        include_reel: 'true',
        fetch_mutual: 'false',
        first: '24'
      };
      if (cursor) params.after = cursor;

      const url = `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables=${encodeURIComponent(JSON.stringify(params))}`;

      try {
        const res = await fetch(url, {
          credentials: 'include'
        });

        if (!res.ok) {
          if (res.status === 429) {
            throw new Error('Rate limited - please wait and try again');
          }
          throw new Error(`Failed to fetch following: HTTP ${res.status}`);
        }

        const data = await res.json();

        if (data.status === 'fail') {
          throw new Error(data.message || 'Instagram API error');
        }

        if (!data.data?.user?.edge_follow) {
          throw new Error('Cannot access following list - account may be private');
        }

        return data.data.user.edge_follow;
      } catch (err) {
        console.error('[API] getFollowing error:', err);
        throw err;
      }
    },

    /**
     * Fetch followers list for a specific user
     * @param {string} userId - Instagram user ID
     * @param {string} cursor - Pagination cursor
     * @returns {Promise<Object>} Followers data with edges and page info
     */
    async getFollowers(userId, cursor = null) {
      const params = {
        id: userId,
        include_reel: 'true',
        fetch_mutual: 'true',
        first: '24'
      };
      if (cursor) params.after = cursor;

      const url = `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=${encodeURIComponent(JSON.stringify(params))}`;

      try {
        const res = await fetch(url, {
          credentials: 'include'
        });

        if (!res.ok) {
          if (res.status === 429) {
            throw new Error('Rate limited - please wait and try again');
          }
          throw new Error(`Failed to fetch followers: HTTP ${res.status}`);
        }

        const data = await res.json();

        if (data.status === 'fail') {
          throw new Error(data.message || 'Instagram API error');
        }

        if (!data.data?.user?.edge_followed_by) {
          throw new Error('Cannot access followers list - account may be private');
        }

        return data.data.user.edge_followed_by;
      } catch (err) {
        console.error('[API] getFollowers error:', err);
        throw err;
      }
    },

    /**
     * Unfollow a user (only works for currently logged in account)
     * @param {string} userId - User ID to unfollow
     * @returns {Promise<boolean>} True if successful
     */
    async unfollow(userId) {
      try {
        const res = await fetch(`https://www.instagram.com/web/friendships/${userId}/unfollow/`, {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'x-csrftoken': this.csrf
          },
          credentials: 'include'
        });
        return res.ok;
      } catch (err) {
        console.error('[API] unfollow error:', err);
        return false;
      }
    },

    /**
     * Check if the current user is logged in
     * @returns {boolean} True if logged in
     */
    isLoggedIn() {
      return !!this.userId && !!this.csrf;
    },

    /**
     * Check if the target account is the logged-in user's account
     * @param {string} targetUserId - Target user ID
     * @returns {boolean} True if same user
     */
    isOwnAccount(targetUserId) {
      return this.userId === targetUserId;
    }
  };

  // ============================================
  // State - Application state management
  // ============================================
  let state = {
    // App status: 'initial' | 'loading_profile' | 'scanning' | 'unfollowing' | 'error'
    status: 'initial',

    // Target user information
    targetUsername: parseUsernameFromURL() || '',
    targetUser: null,       // Full profile data of target account

    // Scan results
    following: [],          // List of accounts the target follows
    followers: [],          // List of accounts following the target
    results: [],            // Processed results (non-followers)
    selected: [],           // Selected users for unfollow

    // UI state
    whitelist: Storage.get(CONFIG.STORAGE_KEY, []),
    tab: 'non_whitelisted',
    search: '',
    page: 1,
    pct: 0,                 // Progress percentage
    eta: null,              // Estimated time remaining
    scanStartTime: null,    // Timestamp when scan started
    processedCount: 0,      // Number of items processed
    totalCount: 0,          // Total items to process
    scanInterval: null,     // Interval for updating ETA
    scanHistory: [],        // Sliding window of {t, c} for rate calculation
    paused: false,

    // Settings
    settings: Storage.get(CONFIG.SETTINGS_KEY, CONFIG.DEFAULT_SETTINGS),
    showSettings: false,

    // Notifications
    toast: null,
    error: null,            // Error message for error state

    // Account Type Filters (scan mode determines WHAT data is fetched, these filter by TYPE)
    filter: {
      verified: true,       // Show verified accounts
      private: true         // Show private accounts
    },

    // Unfollow logs
    logs: [],

    // Scan mode: 'following' | 'followers' | 'non_followers'
    scanMode: 'non_followers'
  };

  // ============================================
  // Render Helpers
  // ============================================
  const el = (tag, attrs = {}, children = []) => {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') e.className = v;
      else if (k.startsWith('on')) e[k.toLowerCase()] = v;
      else if (k === 'style' && typeof v === 'string') e.style.cssText = v;
      else e[k] = v;
    });
    children.forEach(c => {
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else if (c) e.appendChild(c);
    });
    return e;
  };

  // ============================================
  // Components - UI Rendering
  // ============================================

  /**
   * Main render function - re-renders the entire app
   * Called whenever state changes
   */
  function renderApp() {
    const app = document.querySelector('.iu-app');
    if (!app) return;
    app.innerHTML = '';

    app.appendChild(renderHeader());

    // Render appropriate screen based on status
    switch (state.status) {
      case 'initial':
        app.appendChild(renderStartScreen());
        break;
      case 'loading_profile':
        app.appendChild(renderLoadingScreen());
        break;
      case 'scanning':
        app.appendChild(renderScanScreen());
        break;
      case 'unfollowing':
        app.appendChild(renderUnfollowScreen());
        break;
      case 'error':
        app.appendChild(renderErrorScreen());
        break;
    }

    if (state.toast) app.appendChild(renderToast());
    if (state.showSettings) app.appendChild(renderSettingsModal());
  }

  /**
   * Render the header with branding and actions
   */
  function renderHeader() {
    const header = el('header', { className: 'iu-header' }, [
      el('div', { className: 'iu-header-inner' }, [
        el('div', { className: 'iu-brand' }, [
          el('div', { className: 'iu-logo' }, ['>']),
          el('div', {}, [
            el('div', { className: 'iu-title' }, ['UNFOLLOWERS']),
            el('div', { className: 'iu-subtitle' }, [
              state.targetUser
                ? `target: @${state.targetUser.username}`
                : 'v1.0 // terminal mode'
            ])
          ])
        ]),
        el('div', { className: 'iu-actions' }, [
          state.status !== 'initial' && state.status !== 'loading_profile' && state.status !== 'error' && el('input', {
            className: 'iu-input',
            type: 'text',
            placeholder: 'Search users...',
            value: state.search,
            onInput: e => { state.search = e.target.value; state.page = 1; renderApp(); }
          }),
          state.status === 'initial' && el('button', {
            className: 'iu-btn iu-btn-ghost',
            onClick: () => { state.showSettings = true; renderApp(); }
          }, ['⚙️ Settings']),
          state.status === 'scanning' && el('button', {
            className: 'iu-btn iu-btn-secondary',
            onClick: copyList
          }, ['📋 Copy'])
        ].filter(Boolean))
      ])
    ]);

    if (state.status !== 'initial' && state.status !== 'error') {
      // Progress bar with percentage inside header-inner for consistency
      const headerInner = header.querySelector('.iu-header-inner');
      const pct = Math.round(state.pct || 0);
      headerInner.appendChild(el('div', { className: 'iu-progress-container' }, [
        el('div', { className: 'iu-progress' }, [
          el('div', { className: 'iu-progress-fill', style: `width: ${pct}%` })
        ]),
        el('span', { className: 'iu-progress-pct' }, [
          state.eta ? `${pct}% · ETA: ${state.eta}` : `${pct}%`
        ])
      ]));
    }

    return header;
  }

  /**
   * Render the start screen with username input
   * Allows user to enter any Instagram username to analyze
   */
  function renderStartScreen() {
    return el('section', { className: 'iu-start-screen' }, [
      el('div', { className: 'iu-start-content' }, [
        el('div', { className: 'iu-start-icon' }, ['$']),
        el('h1', { className: 'iu-start-title' }, ['ANALYZE TARGET']),
        el('p', { className: 'iu-start-desc' }, [
          '// Enter Instagram username to scan for non-followers. Supports public profiles and private accounts you have access to.'
        ]),

        // Username input form
        el('div', { className: 'iu-form-group' }, [
          el('label', { className: 'iu-form-label' }, ['target_username']),
          el('input', {
            className: 'iu-input iu-input-lg',
            id: 'iu-username-input',
            type: 'text',
            placeholder: 'enter_username...',
            value: state.targetUsername,
            onInput: e => {
              // Update state without re-render (prevents focus loss)
              const cleanValue = e.target.value.replace(/[@\s]/g, '');
              state.targetUsername = cleanValue;
              e.target.value = cleanValue; // Update input display

              // Directly update button disabled state
              const btn = document.getElementById('iu-start-btn');
              if (btn) {
                btn.disabled = !cleanValue || !isValidUsername(cleanValue);
              }
            }
          }),
          el('div', { className: 'iu-form-hint' }, [
            '// Tip: Navigate to instagram.com/username for auto-detection'
          ])
        ]),

        // Scan mode selection
        el('div', { className: 'iu-section' }, [
          el('h3', { className: 'iu-section-title' }, ['SCAN_MODE']),
          el('div', { className: 'iu-filter-list' }, [
            el('label', { className: 'iu-filter-item' }, [
              el('input', {
                type: 'radio',
                name: 'scanMode',
                className: 'iu-radio',
                checked: state.scanMode === 'non_followers',
                onChange: () => { state.scanMode = 'non_followers'; renderApp(); }
              }),
              el('div', { className: 'iu-radio-content' }, [
                el('div', { className: 'iu-radio-label' }, ['--non-followers']),
                el('div', { className: 'iu-radio-desc' }, [
                  '// Detect accounts that dont follow back'
                ])
              ])
            ]),
            el('label', { className: 'iu-filter-item' }, [
              el('input', {
                type: 'radio',
                name: 'scanMode',
                className: 'iu-radio',
                checked: state.scanMode === 'following',
                onChange: () => { state.scanMode = 'following'; renderApp(); }
              }),
              el('div', { className: 'iu-radio-content' }, [
                el('div', { className: 'iu-radio-label' }, ['--following']),
                el('div', { className: 'iu-radio-desc' }, [
                  '// List all following accounts'
                ])
              ])
            ]),
            el('label', { className: 'iu-filter-item' }, [
              el('input', {
                type: 'radio',
                name: 'scanMode',
                className: 'iu-radio',
                checked: state.scanMode === 'followers',
                onChange: () => { state.scanMode = 'followers'; renderApp(); }
              }),
              el('div', { className: 'iu-radio-content' }, [
                el('div', { className: 'iu-radio-label' }, ['--followers']),
                el('div', { className: 'iu-radio-desc' }, [
                  '// List all follower accounts'
                ])
              ])
            ])
          ])
        ]),

        // Start button wrapper (centers the button)
        el('div', { className: 'iu-start-button-wrapper' }, [
          el('button', {
            id: 'iu-start-btn',
            className: 'iu-start-btn',
            onClick: loadTargetProfile,
            disabled: !state.targetUsername || !isValidUsername(state.targetUsername)
          }, ['EXEC'])
        ]),

        // Login status indicator
        el('div', { className: 'iu-warning' }, [
          el('div', { className: 'iu-warning-title' }, [
            API.isLoggedIn() ? '✅ Logged In' : '⚠️ Not Logged In'
          ]),
          el('div', { className: 'iu-warning-text' }, [
            API.isLoggedIn()
              ? 'You can scan public accounts and private accounts you follow.'
              : 'Log in to Instagram for best results. Some features may be limited.'
          ])
        ])
      ])
    ]);
  }

  /**
   * Render loading screen while fetching profile
   */
  function renderLoadingScreen() {
    return el('section', { className: 'iu-start-screen' }, [
      el('div', { className: 'iu-start-icon', style: 'animation: pulse 2s infinite;' }, ['⏳']),
      el('h1', { className: 'iu-start-title' }, ['Loading Profile...']),
      el('p', { className: 'iu-start-desc' }, [
        `Fetching profile data for @${state.targetUsername}`
      ])
    ]);
  }

  /**
   * Render error screen with retry option
   */
  function renderErrorScreen() {
    return el('section', { className: 'iu-start-screen' }, [
      el('div', { className: 'iu-start-icon', style: 'border-color: var(--color-error);' }, ['❌']),
      el('h1', { className: 'iu-start-title' }, ['Error']),
      el('p', { className: 'iu-start-desc', style: 'color: var(--color-error);' }, [
        state.error || 'An unexpected error occurred'
      ]),
      el('button', {
        className: 'iu-btn iu-btn-primary',
        onClick: () => {
          state.status = 'initial';
          state.error = null;
          renderApp();
        }
      }, ['← Go Back'])
    ]);
  }

  function renderScanScreen() {
    const users = getFilteredUsers();
    const pageUsers = getPageUsers(users);
    const maxPage = Math.max(1, Math.ceil(users.length / CONFIG.USERS_PER_PAGE));
    const isOwnAccount = state.targetUser && API.isOwnAccount(state.targetUser.id);

    // Create profile card if we have target user data
    const profileCard = state.targetUser ? el('div', { className: 'iu-profile-card' }, [
      el('img', {
        className: 'iu-profile-avatar',
        src: state.targetUser.profile_pic_url,
        alt: state.targetUser.username
      }),
      el('div', { className: 'iu-profile-info' }, [
        el('div', { className: 'iu-profile-username' }, [
          `@${state.targetUser.username}`,
          state.targetUser.is_verified && el('span', {
            style: 'color: var(--color-info); margin-left: 6px;'
          }, ['✓']),
          state.targetUser.is_private && el('span', {
            style: 'color: var(--color-warning); margin-left: 6px;'
          }, ['🔒'])
        ].filter(Boolean)),
        state.targetUser.full_name && el('div', { className: 'iu-profile-name' }, [
          state.targetUser.full_name
        ]),
        el('div', { className: 'iu-profile-stats' }, [
          el('div', { className: 'iu-profile-stat' }, [
            el('div', { className: 'iu-profile-stat-value' }, [state.targetUser.following_count.toLocaleString()]),
            el('div', { className: 'iu-profile-stat-label' }, ['Following'])
          ]),
          el('div', { className: 'iu-profile-stat' }, [
            el('div', { className: 'iu-profile-stat-value' }, [state.targetUser.follower_count.toLocaleString()]),
            el('div', { className: 'iu-profile-stat-label' }, ['Followers'])
          ]),
          el('div', { className: 'iu-profile-stat' }, [
            el('div', { className: 'iu-profile-stat-value', style: 'color: var(--color-accent);' }, [
              state.scanMode === 'non_followers' ? 'Non-Followers' :
                state.scanMode === 'following' ? 'Following' : 'Followers'
            ]),
            el('div', { className: 'iu-profile-stat-label' }, ['Scan Mode'])
          ])
        ])
      ])
    ]) : null;

    return el('div', { className: 'iu-main-container' }, [
      // Profile card at top
      profileCard,

      // Main layout
      el('div', { className: 'iu-layout' }, [
        // Sidebar
        el('aside', { className: 'iu-sidebar' }, [
          // Stats
          el('div', { className: 'iu-section' }, [
            el('h3', { className: 'iu-section-title' }, ['Statistics']),
            el('div', { className: 'iu-stats' }, [
              el('div', { className: 'iu-stat-row' }, [
                el('span', { className: 'iu-stat-label' }, ['Displayed']),
                el('span', { className: 'iu-stat-value' }, [users.length.toString()])
              ]),
              el('div', { className: 'iu-stat-row' }, [
                el('span', { className: 'iu-stat-label' }, ['Total']),
                el('span', { className: 'iu-stat-value' }, [state.results.length.toString()])
              ]),
              el('div', { className: 'iu-stat-row' }, [
                el('span', { className: 'iu-stat-label' }, ['Selected']),
                el('span', { className: 'iu-stat-value' }, [state.selected.length.toString()])
              ])
            ])
          ]),
          // Filters (only account type filters, scan mode handles data selection)
          el('div', { className: 'iu-section' }, [
            el('h3', { className: 'iu-section-title' }, ['Account Filters']),
            el('div', { className: 'iu-filter-list' }, [
              renderFilter('verified', 'Show Verified', '✓'),
              renderFilter('private', 'Show Private', '🔒')
            ])
          ]),
          // Selection Controls
          el('div', { className: 'iu-section' }, [
            el('h3', { className: 'iu-section-title' }, ['Selection']),
            // Select All Filtered
            el('label', {
              className: 'iu-filter-item',
              style: 'cursor: pointer;'
            }, [
              (() => {
                const checkbox = el('input', {
                  type: 'checkbox',
                  className: 'iu-checkbox',
                  onChange: toggleSelectAll
                });
                const selectState = getSelectAllState();
                checkbox.checked = selectState === 'all';
                checkbox.indeterminate = selectState === 'some';
                return checkbox;
              })(),
              el('span', {}, ['Select All Filtered'])
            ]),
            // Select Current Page
            el('label', {
              className: 'iu-filter-item',
              style: 'cursor: pointer;'
            }, [
              (() => {
                const checkbox = el('input', {
                  type: 'checkbox',
                  className: 'iu-checkbox',
                  onChange: toggleSelectCurrentPage
                });
                const selectState = getSelectCurrentPageState();
                checkbox.checked = selectState === 'all';
                checkbox.indeterminate = selectState === 'some';
                return checkbox;
              })(),
              el('span', {}, ['Select Current Page'])
            ])
          ]),
          // Controls
          el('div', { className: 'iu-section' }, [
            el('h3', { className: 'iu-section-title' }, ['Controls']),
            state.pct < 100 && el('button', {
              className: 'iu-btn iu-btn-secondary',
              style: 'width: 100%; margin-bottom: 0.5rem;',
              onClick: togglePause
            }, [state.paused ? 'Resume' : 'Pause']),
            // Only show unfollow button for own account
            isOwnAccount && el('button', {
              className: 'iu-btn iu-btn-danger',
              style: 'width: 100%; margin-bottom: 0.5rem;',
              onClick: startUnfollow,
              disabled: state.selected.length === 0
            }, [`Unfollow (${state.selected.length})`]),
            // New scan button
            el('button', {
              className: 'iu-btn iu-btn-secondary',
              style: 'width: 100%;',
              onClick: () => {
                state.status = 'initial';
                state.targetUser = null;
                state.results = [];
                state.following = [];
                state.followers = [];
                state.selected = [];
                state.pct = 0;
                renderApp();
              }
            }, ['🔄 New Scan'])
          ].filter(Boolean)),
          // Pagination
          el('div', { className: 'iu-section' }, [
            el('div', { className: 'iu-pagination' }, [
              el('button', {
                className: 'iu-btn iu-btn-ghost',
                disabled: state.page <= 1,
                onClick: () => { state.page--; renderApp(); }
              }, ['◀']),
              el('span', { className: 'iu-page-info' }, [`${state.page} / ${maxPage}`]),
              el('button', {
                className: 'iu-btn iu-btn-ghost',
                disabled: state.page >= maxPage,
                onClick: () => { state.page++; renderApp(); }
              }, ['▶'])
            ])
          ])
        ]),
        // Main content
        el('main', {}, [
          // Tabs
          el('div', { className: 'iu-tabs' }, [
            el('button', {
              className: `iu-tab ${state.tab === 'non_whitelisted' ? 'iu-tab-active' : ''}`,
              onClick: () => { state.tab = 'non_whitelisted'; state.selected = []; state.page = 1; renderApp(); }
            }, ['Non-Whitelisted']),
            el('button', {
              className: `iu-tab ${state.tab === 'whitelisted' ? 'iu-tab-active' : ''}`,
              onClick: () => { state.tab = 'whitelisted'; state.selected = []; state.page = 1; renderApp(); }
            }, ['Whitelisted'])
          ]),
          // User list
          el('div', { className: 'iu-user-list' },
            pageUsers.length === 0
              ? [el('div', { className: 'iu-empty' }, ['No users found'])]
              : pageUsers.map(renderUserItem)
          )
        ])
      ]) // Close iu-layout
    ].filter(Boolean)); // Close wrapper div, filter out null profileCard
  }

  function renderUnfollowScreen() {
    return el('div', { className: 'iu-layout' }, [
      el('aside', { className: 'iu-sidebar' }, [
        el('div', { className: 'iu-section' }, [
          el('h3', { className: 'iu-section-title' }, ['Progress']),
          el('div', { className: 'iu-stats' }, [
            el('div', { className: 'iu-stat-row' }, [
              el('span', { className: 'iu-stat-label' }, ['Completed']),
              el('span', { className: 'iu-stat-value' }, [`${state.logs.length} / ${state.selected.length}`])
            ])
          ])
        ])
      ]),
      el('main', {}, [
        el('div', { className: 'iu-section' }, [
          el('div', { className: 'iu-user-list' },
            state.logs.length === 0
              ? [el('div', { className: 'iu-empty' }, ['Unfollowing in progress...'])]
              : state.logs.map(log => el('div', { className: 'iu-user-item' }, [
                el('img', { className: 'iu-avatar', src: log.user.profile_pic_url }),
                el('div', { className: 'iu-user-info' }, [
                  el('div', { className: 'iu-username' }, [log.user.username]),
                  el('div', {
                    className: 'iu-fullname',
                    style: `color: var(--color-${log.ok ? 'success' : 'error'})`
                  }, [log.ok ? 'Unfollowed' : 'Failed'])
                ])
              ]))
          )
        ])
      ])
    ]);
  }

  /**
   * Render a filter checkbox with optional icon
   */
  function renderFilter(key, label, icon = null) {
    return el('label', { className: 'iu-filter-item' }, [
      el('input', {
        type: 'checkbox',
        className: 'iu-checkbox',
        checked: state.filter[key],
        onChange: e => {
          state.filter[key] = e.target.checked;
          state.selected = [];
          state.page = 1;
          renderApp();
        }
      }),
      el('span', {}, [icon ? `${icon} ${label}` : label])
    ]);
  }

  function renderUserItem(user) {
    const isSelected = state.selected.some(u => u.id === user.id);
    const isWhitelisted = state.whitelist.some(u => u.id === user.id);

    return el('label', { className: 'iu-user-item' }, [
      el('img', { className: 'iu-avatar', src: user.profile_pic_url, alt: user.username }),
      el('div', { className: 'iu-user-info' }, [
        el('a', {
          className: 'iu-username',
          href: `https://instagram.com/${user.username}`,
          target: '_blank',
          onClick: e => e.stopPropagation()
        }, [user.username]),
        el('div', { className: 'iu-fullname' }, [user.full_name || ''])
      ]),
      el('div', { className: 'iu-badges' }, [
        user.is_verified && el('span', { className: 'iu-badge iu-badge-verified' }, ['✓']),
        user.is_private && el('span', { className: 'iu-badge iu-badge-private' }, ['🔒'])
      ].filter(Boolean)),
      el('button', {
        className: 'iu-btn iu-btn-ghost',
        style: 'font-size: 0.75rem; padding: 0.25rem 0.5rem;',
        onClick: e => { e.preventDefault(); e.stopPropagation(); toggleWhitelist(user); }
      }, [isWhitelisted ? '−' : '+']),
      el('input', {
        type: 'checkbox',
        className: 'iu-checkbox',
        checked: isSelected,
        onChange: e => toggleSelect(user, e.target.checked)
      })
    ]);
  }

  function renderToast() {
    return el('div', { className: `iu-toast iu-toast-${state.toast.type || 'info'}` }, [
      el('span', {}, [state.toast.msg]),
      el('button', {
        className: 'iu-btn iu-btn-ghost',
        style: 'padding: 0.25rem;',
        onClick: () => { state.toast = null; renderApp(); }
      }, ['✕'])
    ]);
  }

  function renderSettingsModal() {
    return el('div', {
      className: 'iu-modal-overlay', onClick: e => {
        if (e.target.classList.contains('iu-modal-overlay')) { state.showSettings = false; renderApp(); }
      }
    }, [
      el('div', { className: 'iu-modal' }, [
        el('div', { className: 'iu-modal-header' }, [
          el('h2', { className: 'iu-modal-title' }, ['Settings']),
          el('button', {
            className: 'iu-btn iu-btn-ghost',
            onClick: () => { state.showSettings = false; renderApp(); }
          }, ['✕'])
        ]),
        el('form', { className: 'iu-modal-body', onSubmit: saveSettings }, [
          settingField('searchDelay', 'Search delay (ms)', 500, 10000),
          settingField('searchPause', 'Pause after 5 searches (ms)', 4000, 60000),
          settingField('unfollowDelay', 'Unfollow delay (ms)', 1000, 30000),
          settingField('unfollowPause', 'Pause after 5 unfollows (ms)', 60000, 600000),
          el('div', { className: 'iu-warning' }, [
            el('div', { className: 'iu-warning-title' }, ['⚠️ Warning']),
            el('div', { className: 'iu-warning-text' }, ['Modifying settings may cause temporary restrictions.'])
          ]),
          el('div', { className: 'iu-modal-footer' }, [
            el('button', { type: 'button', className: 'iu-btn iu-btn-secondary', onClick: () => { state.showSettings = false; renderApp(); } }, ['Cancel']),
            el('button', { type: 'submit', className: 'iu-btn iu-btn-primary' }, ['Save'])
          ])
        ])
      ])
    ]);
  }

  function settingField(key, label, min, max) {
    return el('div', { className: 'iu-form-group' }, [
      el('label', { className: 'iu-form-label' }, [label]),
      el('input', { type: 'number', className: 'iu-input', name: key, value: state.settings[key], min, max, style: 'width: 100%;' }),
      el('div', { className: 'iu-form-hint' }, [`Range: ${min} - ${max}`])
    ]);
  }

  // ============================================
  // Logic
  // ============================================

  /**
   * Filter users based on current filter settings
   * Note: The scan mode determines WHAT data is fetched (followers/following/non-followers)
   * The filters here only filter by account TYPE (verified, private) and whitelist
   */
  function getFilteredUsers() {
    return state.results.filter(u => {
      // Whitelist tab filter
      const isWhitelisted = state.whitelist.some(w => w.id === u.id);
      if (state.tab === 'whitelisted' && !isWhitelisted) return false;
      if (state.tab === 'non_whitelisted' && isWhitelisted) return false;

      // Search filter (username or full name)
      if (state.search) {
        const searchTerm = state.search.toLowerCase();
        const matchesUsername = u.username.toLowerCase().includes(searchTerm);
        const matchesName = (u.full_name || '').toLowerCase().includes(searchTerm);
        if (!matchesUsername && !matchesName) return false;
      }

      // Account type filters (only filter OUT if unchecked)
      if (!state.filter.verified && u.is_verified) return false;
      if (!state.filter.private && u.is_private) return false;

      return true;
    }).sort((a, b) => a.username.localeCompare(b.username));
  }

  function getPageUsers(users) {
    const start = (state.page - 1) * CONFIG.USERS_PER_PAGE;
    return users.slice(start, start + CONFIG.USERS_PER_PAGE);
  }

  function toggleSelect(user, checked) {
    if (checked) state.selected.push(user);
    else state.selected = state.selected.filter(u => u.id !== user.id);
    renderApp();
  }

  function toggleWhitelist(user) {
    const exists = state.whitelist.some(u => u.id === user.id);
    state.whitelist = exists
      ? state.whitelist.filter(u => u.id !== user.id)
      : [...state.whitelist, user];
    Storage.set(CONFIG.STORAGE_KEY, state.whitelist);
    renderApp();
  }

  function togglePause() {
    state.paused = !state.paused;
    renderApp();
  }

  function toggleSelectAll() {
    const filteredUsers = getFilteredUsers();
    const allSelected = filteredUsers.every(u => state.selected.some(s => s.id === u.id));

    if (allSelected) {
      // Deselect all filtered users
      state.selected = state.selected.filter(s => !filteredUsers.some(u => u.id === s.id));
    } else {
      // Select all filtered users
      const newSelections = filteredUsers.filter(u => !state.selected.some(s => s.id === u.id));
      state.selected = [...state.selected, ...newSelections];
    }
    renderApp();
  }

  function toggleSelectCurrentPage() {
    const filteredUsers = getFilteredUsers();
    const pageUsers = getPageUsers(filteredUsers);
    const allPageSelected = pageUsers.every(u => state.selected.some(s => s.id === u.id));

    if (allPageSelected) {
      // Deselect all users on current page
      state.selected = state.selected.filter(s => !pageUsers.some(u => u.id === s.id));
    } else {
      // Select all users on current page
      const newSelections = pageUsers.filter(u => !state.selected.some(s => s.id === u.id));
      state.selected = [...state.selected, ...newSelections];
    }
    renderApp();
  }

  function getSelectAllState() {
    const filteredUsers = getFilteredUsers();
    if (filteredUsers.length === 0) return 'none';

    const selectedCount = filteredUsers.filter(u => state.selected.some(s => s.id === u.id)).length;

    if (selectedCount === 0) return 'none';
    if (selectedCount === filteredUsers.length) return 'all';
    return 'some';
  }

  function getSelectCurrentPageState() {
    const filteredUsers = getFilteredUsers();
    const pageUsers = getPageUsers(filteredUsers);
    if (pageUsers.length === 0) return 'none';

    const selectedCount = pageUsers.filter(u => state.selected.some(s => s.id === u.id)).length;

    if (selectedCount === 0) return 'none';
    if (selectedCount === pageUsers.length) return 'all';
    return 'some';
  }

  function showToast(msg, type = 'info') {
    state.toast = { msg, type };
    renderApp();
    setTimeout(() => { state.toast = null; renderApp(); }, 5000);
  }

  async function copyList() {
    const users = getFilteredUsers();
    try {
      await navigator.clipboard.writeText(users.map(u => u.username).join('\n'));
      showToast('Copied to clipboard!', 'success');
    } catch { showToast('Copy failed', 'error'); }
  }

  function saveSettings(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.settings = {
      searchDelay: +fd.get('searchDelay'),
      searchPause: +fd.get('searchPause'),
      unfollowDelay: +fd.get('unfollowDelay'),
      unfollowPause: +fd.get('unfollowPause')
    };
    Storage.set(CONFIG.SETTINGS_KEY, state.settings);
    state.showSettings = false;
    showToast('Settings saved', 'success');
  }

  /**
   * Load the target user's profile before scanning
   * This fetches the profile data and validates access
   */
  async function loadTargetProfile() {
    // Validate username
    if (!state.targetUsername || !isValidUsername(state.targetUsername)) {
      showToast('Please enter a valid username', 'error');
      return;
    }

    state.status = 'loading_profile';
    state.error = null;
    renderApp();

    try {
      // Fetch the target user's profile
      console.log(`[Scan] Loading profile for @${state.targetUsername}`);
      const profile = await API.getUserByUsername(state.targetUsername);

      state.targetUser = profile;

      // Check if account is private and we have access
      if (profile.is_private) {
        console.log(`[Scan] Account @${profile.username} is private`);
        // For non-followers scan mode, we need access to both following and followers
        // Try to continue - the API will error if we don't have access
      }

      console.log(`[Scan] Profile loaded: @${profile.username} (ID: ${profile.id})`);
      console.log(`[Scan] Following: ${profile.following_count}, Followers: ${profile.follower_count}`);

      // Show profile info toast
      showToast(`Loaded @${profile.username} - ${profile.following_count} following, ${profile.follower_count} followers`, 'success');

      // Start the scan
      await startScan();

    } catch (err) {
      console.error('[Scan] Error loading profile:', err);
      state.status = 'error';
      state.error = err.message || 'Failed to load profile';
      renderApp();
    }
  }

  function recordScanProgress() {
    const now = Date.now();
    state.scanHistory.push({ t: now, c: state.processedCount });
    // Keep last 20 samples (sliding window)
    if (state.scanHistory.length > 20) {
      state.scanHistory.shift();
    }
  }

  function updateETA() {
    // If scan hasn't started or no progress, show calculating
    if (!state.scanStartTime || state.processedCount === 0) {
      state.eta = 'calculating...';
      return;
    }

    // If done
    if (state.processedCount >= state.totalCount) {
      state.eta = 'Done';
      return;
    }

    // Need at least 2 data points for rate calculation
    if (state.scanHistory.length < 2) {
      state.eta = 'calculating...';
      return;
    }

    const oldest = state.scanHistory[0];
    const newest = state.scanHistory[state.scanHistory.length - 1];

    // Compute rate = processedPerWindow / windowSeconds
    const timeDiff = (newest.t - oldest.t) / 1000; // seconds
    const countDiff = newest.c - oldest.c; // items processed

    if (timeDiff <= 0 || countDiff <= 0) {
      return; // Keep previous ETA or calculating
    }

    const rate = countDiff / timeDiff; // items per second
    const remaining = state.totalCount - state.processedCount;
    const etaSeconds = remaining / rate;

    if (!isFinite(etaSeconds) || etaSeconds < 0) {
      state.eta = 'calculating...';
      return;
    }

    // Format output: 2m 31s
    if (etaSeconds < 60) {
      state.eta = `${Math.ceil(etaSeconds)}s`;
    } else {
      const minutes = Math.floor(etaSeconds / 60);
      const seconds = Math.ceil(etaSeconds % 60);
      state.eta = `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Start scanning the target user's following/followers
   * Supports three modes: following, followers, non_followers
   */
  async function startScan() {
    if (!state.targetUser) {
      showToast('No target user loaded', 'error');
      return;
    }

    state.status = 'scanning';
    state.results = [];
    state.following = [];
    state.followers = [];
    state.selected = [];
    state.pct = 0;
    state.page = 1;
    state.scanStartTime = Date.now();
    state.scanHistory = []; // Reset history
    state.eta = 'calculating...';
    state.processedCount = 0;
    renderApp();

    const userId = state.targetUser.id;
    const scanMode = state.scanMode;

    // Calculate total items to scan for ETA
    const totalFollowing = state.targetUser.following_count || 0;
    const totalFollowers = state.targetUser.follower_count || 0;
    let totalScanItems = 0;
    if (scanMode === 'following') totalScanItems = totalFollowing;
    else if (scanMode === 'followers') totalScanItems = totalFollowers;
    else if (scanMode === 'non_followers') totalScanItems = totalFollowing + totalFollowers;

    state.totalCount = totalScanItems;

    // Start ETA update interval
    if (state.scanInterval) clearInterval(state.scanInterval);
    state.scanInterval = setInterval(() => {
      if (state.status === 'scanning' && !state.paused) {
        updateETA();
        renderApp();
      }
    }, 1000);

    console.log(`[Scan] Starting ${scanMode} scan for user ID: ${userId}. Total items: ${totalScanItems}`);

    try {
      // Fetch following list
      if (scanMode === 'following' || scanMode === 'non_followers') {
        await fetchFollowingList(userId);
      }

      // Fetch followers list
      if (scanMode === 'followers' || scanMode === 'non_followers') {
        await fetchFollowersList(userId);
      }

      // Process results based on scan mode
      if (scanMode === 'following') {
        state.results = [...state.following];
        console.log(`[Scan] Returning ${state.results.length} following`);
      } else if (scanMode === 'followers') {
        state.results = [...state.followers];
        console.log(`[Scan] Returning ${state.results.length} followers`);
      } else if (scanMode === 'non_followers') {
        // Find accounts that target follows but don't follow back
        // Create a Set of follower IDs (convert to string for consistency)
        const followerIds = new Set(state.followers.map(f => String(f.id)));

        console.log(`[Scan] Comparing ${state.following.length} following vs ${state.followers.length} followers`);
        console.log(`[Scan] Unique follower IDs: ${followerIds.size}`);

        // Filter following list to find those NOT in followers
        state.results = state.following.filter(f => {
          const followingId = String(f.id);
          const isFollowingBack = followerIds.has(followingId);
          return !isFollowingBack; // Keep only those NOT following back
        });

        console.log(`[Scan] Found ${state.results.length} non-followers`);

        // Debug: Log first few results
        if (state.results.length > 0) {
          console.log('[Scan] Sample non-followers:', state.results.slice(0, 3).map(u => u.username));
        }
      }

      state.pct = 100;
      if (state.scanInterval) clearInterval(state.scanInterval);
      renderApp();
      showToast(`Scan complete! Found ${state.results.length} accounts`, 'success');

    } catch (err) {
      console.error('[Scan] Error during scan:', err);
      if (state.scanInterval) clearInterval(state.scanInterval);
      showToast(err.message || 'Scan failed', 'error');
      // Stay on scanning screen so user can see partial results
    }
  }

  /**
   * Fetch the complete following list for a user
   * @param {string} userId - Instagram user ID
   */
  async function fetchFollowingList(userId) {
    console.log('[Scan] Fetching following list...');
    let cursor = null;
    let hasNext = true;
    let cycle = 0;
    // const total = state.targetUser.following_count || 1; // No longer needed for global progress

    while (hasNext) {
      // Handle pause
      while (state.paused) await sleep(500);

      try {
        const data = await API.getFollowing(userId, cursor);

        // Process each following user
        data.edges.forEach(e => {
          state.following.push({
            ...e.node,
            follows_viewer: e.node.follows_viewer || false
          });
        });

        hasNext = data.page_info.has_next_page;
        cursor = data.page_info.end_cursor;

        // Update progress and ETA
        state.processedCount = state.following.length;
        recordScanProgress(); // Record timestamp for ETA
        state.pct = Math.floor((state.processedCount / state.totalCount) * 100);
        // updateETA(); // Handled by interval
        state.results = [...state.following]; // Show partial results
        renderApp();

        // Rate limiting
        cycle++;
        await sleep(randomDelay(state.settings.searchDelay));
        if (cycle % 5 === 0 && hasNext) {
          showToast('Pausing to avoid rate limits...', 'info');
          await sleep(state.settings.searchPause);
          state.toast = null;
        }

      } catch (err) {
        console.error('[Scan] Error fetching following:', err);
        if (err.message.includes('Rate limited')) {
          showToast('Rate limited! Waiting 30 seconds...', 'warning');
          await sleep(30000);
        } else if (err.message.includes('private')) {
          throw new Error('Cannot access following list - account is private');
        } else {
          await sleep(2000);
        }
      }
    }

    console.log(`[Scan] Fetched ${state.following.length} following`);
  }

  /**
   * Fetch the complete followers list for a user
   * @param {string} userId - Instagram user ID
   */
  async function fetchFollowersList(userId) {
    console.log('[Scan] Fetching followers list...');
    let cursor = null;
    let hasNext = true;
    let cycle = 0;
    // const total = state.targetUser.follower_count || 1; // No longer needed
    // const startProgress = state.scanMode === 'non_followers' ? 50 : 0; // No longer needed

    while (hasNext) {
      // Handle pause
      while (state.paused) await sleep(500);

      try {
        const data = await API.getFollowers(userId, cursor);

        // Process each follower
        data.edges.forEach(e => {
          state.followers.push(e.node);
        });

        hasNext = data.page_info.has_next_page;
        cursor = data.page_info.end_cursor;

        // Update progress and ETA
        state.processedCount = state.following.length + state.followers.length;
        recordScanProgress(); // Record timestamp for ETA
        state.pct = Math.floor((state.processedCount / state.totalCount) * 100);
        // updateETA(); // Handled by interval

        // For followers-only mode, show partial results
        if (state.scanMode === 'followers') {
          state.results = [...state.followers];
        }
        renderApp();

        // Rate limiting
        cycle++;
        await sleep(randomDelay(state.settings.searchDelay));
        if (cycle % 5 === 0 && hasNext) {
          showToast('Pausing to avoid rate limits...', 'info');
          await sleep(state.settings.searchPause);
          state.toast = null;
        }

      } catch (err) {
        console.error('[Scan] Error fetching followers:', err);
        if (err.message.includes('Rate limited')) {
          showToast('Rate limited! Waiting 30 seconds...', 'warning');
          await sleep(30000);
        } else if (err.message.includes('private')) {
          throw new Error('Cannot access followers list - account is private');
        } else {
          await sleep(2000);
        }
      }
    }

    console.log(`[Scan] Fetched ${state.followers.length} followers`);
  }

  async function startUnfollow() {
    if (state.selected.length === 0) return showToast('Select users first', 'warning');
    if (!confirm(`Unfollow ${state.selected.length} users?`)) return;

    state.status = 'unfollowing';
    state.pct = 0;
    state.logs = [];
    renderApp();

    const users = [...state.selected];
    let done = 0;

    for (const user of users) {
      try {
        const ok = await API.unfollow(user.id);
        done++;
        state.pct = Math.floor((done / users.length) * 100);
        state.logs.push({ user, ok });
        renderApp();

        await sleep(randomDelay(state.settings.unfollowDelay));
        if (done % 5 === 0 && done < users.length) {
          showToast('Pausing to avoid limits...', 'info');
          await sleep(state.settings.unfollowPause);
          state.toast = null;
        }
      } catch (err) {
        console.error(err);
        state.logs.push({ user, ok: false });
        renderApp();
      }
    }
    showToast('Unfollow complete!', 'success');
  }

  // ============================================
  // Initialize
  // ============================================
  function init() {
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin: 0; padding: 0; background: #000000;';
    document.title = 'Instagram Unfollowers';

    const app = el('div', { className: 'iu-app' });
    document.body.appendChild(app);
    renderApp();
  }

  // Run
  if (location.hostname === 'www.instagram.com') {
    init();
  } else {
    alert('Please run this on Instagram (www.instagram.com)');
  }
})();
