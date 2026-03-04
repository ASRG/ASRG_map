/**
 * Control buttons UI
 */

class Controls {
  constructor() {
    // Buttons
    this.playPauseBtn = document.getElementById('btn-play-pause');
    this.resetBtn = document.getElementById('btn-reset');
    this.shareBtn = document.getElementById('btn-share');
    this.colorSchemeSelect = document.getElementById('color-scheme');

    // State
    this.isPaused = false;

    this.init();
  }

  /**
   * Initialize controls
   */
  init() {
    // Play/Pause button
    this.playPauseBtn.addEventListener('click', () => {
      this.togglePlayPause();
    });

    // Reset button
    this.resetBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent(EVENTS.VIEW_RESET));
    });

    // Share button
    this.shareBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent(EVENTS.SHARE_URL));
    });

    // Color scheme selector
    this.colorSchemeSelect.addEventListener('change', (e) => {
      const scheme = e.target.value;
      document.dispatchEvent(new CustomEvent(EVENTS.COLOR_SCHEME_CHANGED, {
        detail: { scheme }
      }));
    });
  }

  /**
   * Toggle play/pause
   */
  togglePlayPause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.playPauseBtn.innerHTML = '<span class="icon">▶</span> Play';
      document.dispatchEvent(new CustomEvent(EVENTS.SIMULATION_PAUSED));
    } else {
      this.playPauseBtn.innerHTML = '<span class="icon">⏸</span> Pause';
      document.dispatchEvent(new CustomEvent(EVENTS.SIMULATION_RESUMED));
    }
  }

  /**
   * Set color scheme
   */
  setColorScheme(scheme) {
    this.colorSchemeSelect.value = scheme;
  }

  /**
   * Get current color scheme
   */
  getColorScheme() {
    return this.colorSchemeSelect.value;
  }
}
