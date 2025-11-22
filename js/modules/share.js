/**
 * Share Module
 * Handles Web Share API and fallback options
 */

(function () {
  'use strict';

  const shareBtn = helpers.$('share-btn');

  /**
   * Initialize share functionality
   */
  function init() {
    if (shareBtn) {
      helpers.on(shareBtn, 'click', handleShare);
    }

    // Check if Web Share API is supported
    checkShareSupport();
  }

  /**
   * Check Web Share API support
   * @returns {boolean}
   */
  function checkShareSupport() {
    const isSupported = 'share' in navigator;
    console.log('[Share] Web Share API supported:', isSupported);
    return isSupported;
  }

  /**
   * Handle share button click
   * @param {Event} event
   */
  async function handleShare(event) {
    event.preventDefault();

    const shareData = {
      title: document.title,
      text: document.querySelector('meta[name="description"]')?.content || 'Check out this PWA!',
      url: window.location.href,
    };

    // Try Web Share API first
    if (checkShareSupport()) {
      try {
        await navigator.share(shareData);
        console.log('[Share] Content shared successfully');
        trackShare('web_share_api', shareData.url);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('[Share] Share cancelled by user');
        } else {
          console.error('[Share] Error sharing:', error);
          showShareFallback(shareData);
        }
      }
    } else {
      // Fallback to custom share dialog
      showShareFallback(shareData);
    }
  }

  /**
   * Show fallback share options
   * @param {Object} shareData
   */
  function showShareFallback(shareData) {
    const dialog = createShareDialog(shareData);
    document.body.appendChild(dialog);

    // Focus the dialog
    dialog.focus();

    // Track fallback shown
    trackShare('fallback_shown', shareData.url);
  }

  /**
   * Create share dialog
   * @param {Object} shareData
   * @returns {HTMLElement}
   */
  function createShareDialog(shareData) {
    const overlay = document.createElement('div');
    overlay.className = 'share-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Share options');
    overlay.setAttribute('aria-modal', 'true');

    const dialog = document.createElement('div');
    dialog.className = 'share-dialog';

    const title = document.createElement('h3');
    title.textContent = 'Share this page';
    dialog.appendChild(title);

    const options = document.createElement('div');
    options.className = 'share-options';

    // Copy link option
    const copyOption = createShareOption(
      '🔗',
      'Copy Link',
      () => copyToClipboard(shareData.url)
    );
    options.appendChild(copyOption);

    // Email option
    const emailOption = createShareOption(
      '📧',
      'Email',
      () => shareViaEmail(shareData)
    );
    options.appendChild(emailOption);

    // Twitter option
    const twitterOption = createShareOption(
      '🐦',
      'Twitter',
      () => shareViaTwitter(shareData)
    );
    options.appendChild(twitterOption);

    // Facebook option
    const facebookOption = createShareOption(
      '👍',
      'Facebook',
      () => shareViaFacebook(shareData)
    );
    options.appendChild(facebookOption);

    // LinkedIn option
    const linkedinOption = createShareOption(
      '💼',
      'LinkedIn',
      () => shareViaLinkedIn(shareData)
    );
    options.appendChild(linkedinOption);

    dialog.appendChild(options);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'btn btn-text';
    closeBtn.onclick = () => overlay.remove();
    dialog.appendChild(closeBtn);

    overlay.appendChild(dialog);

    // Close on overlay click
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    };

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Add styles
    addShareStyles();

    return overlay;
  }

  /**
   * Create share option button
   * @param {string} icon
   * @param {string} label
   * @param {Function} action
   * @returns {HTMLElement}
   */
  function createShareOption(icon, label, action) {
    const button = document.createElement('button');
    button.className = 'share-option';
    button.innerHTML = `
      <span class="share-icon">${icon}</span>
      <span class="share-label">${label}</span>
    `;
    button.onclick = () => {
      action();
      trackShare(label.toLowerCase().replace(/\s/g, '_'), window.location.href);
    };

    return button;
  }

  /**
   * Copy URL to clipboard
   * @param {string} url
   */
  async function copyToClipboard(url) {
    try {
      await navigator.clipboard.writeText(url);
      helpers.toast('Link copied to clipboard!', 'success');
    } catch (error) {
      console.error('[Share] Error copying to clipboard:', error);

      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        helpers.toast('Link copied to clipboard!', 'success');
      } catch (err) {
        helpers.toast('Failed to copy link', 'error');
      }

      document.body.removeChild(textArea);
    }
  }

  /**
   * Share via email
   * @param {Object} shareData
   */
  function shareViaEmail(shareData) {
    const subject = encodeURIComponent(shareData.title);
    const body = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  /**
   * Share via Twitter
   * @param {Object} shareData
   */
  function shareViaTwitter(shareData) {
    const text = encodeURIComponent(shareData.text);
    const url = encodeURIComponent(shareData.url);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  /**
   * Share via Facebook
   * @param {Object} shareData
   */
  function shareViaFacebook(shareData) {
    const url = encodeURIComponent(shareData.url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  /**
   * Share via LinkedIn
   * @param {Object} shareData
   */
  function shareViaLinkedIn(shareData) {
    const url = encodeURIComponent(shareData.url);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }

  /**
   * Add share dialog styles
   */
  function addShareStyles() {
    if (document.getElementById('share-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'share-styles';
    style.textContent = `
      .share-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease;
      }

      .share-dialog {
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease;
      }

      .share-dialog h3 {
        margin: 0 0 20px 0;
        font-size: 20px;
        color: #212121;
      }

      .share-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 12px;
        margin-bottom: 20px;
      }

      .share-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 16px 12px;
        border: 1px solid #E0E0E0;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .share-option:hover,
      .share-option:focus {
        background: #F5F5F5;
        border-color: #2196F3;
        transform: translateY(-2px);
      }

      .share-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }

      .share-label {
        font-size: 14px;
        color: #757575;
        font-weight: 500;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (prefers-color-scheme: dark) {
        .share-dialog {
          background: #1E1E1E;
        }

        .share-dialog h3 {
          color: #FFFFFF;
        }

        .share-option {
          background: #2A2A2A;
          border-color: #373737;
        }

        .share-option:hover,
        .share-option:focus {
          background: #333333;
        }

        .share-label {
          color: #B0B0B0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Track share events
   * @param {string} method
   * @param {string} url
   */
  function trackShare(method, url) {
    console.log('[Share]', method, url);
    // Implement your analytics tracking here
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export public API
  window.PWAShare = {
    init,
    share: handleShare,
    isSupported: checkShareSupport,
  };
})();
