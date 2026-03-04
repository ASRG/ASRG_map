/**
 * URL state management for sharing
 */

class URLState {
  constructor(searchFilter, controls) {
    this.searchFilter = searchFilter;
    this.controls = controls;

    // Listen for share event
    document.addEventListener(EVENTS.SHARE_URL, () => {
      this.shareURL();
    });
  }

  /**
   * Encode current state to URL
   */
  encodeState() {
    const state = {
      filters: this.searchFilter.getFilters(),
      colorScheme: this.controls.getColorScheme()
    };

    // Convert to URL params
    const params = new URLSearchParams();

    if (state.filters.types.length > 0) {
      params.set('types', state.filters.types.join(','));
    }

    if (state.filters.authors.length > 0) {
      params.set('authors', state.filters.authors.join(','));
    }

    if (state.filters.statuses.length > 0) {
      params.set('statuses', state.filters.statuses.join(','));
    }

    if (state.filters.domains && state.filters.domains.length > 0) {
      params.set('domains', state.filters.domains.join(','));
    }

    if (state.filters.countries && state.filters.countries.length > 0) {
      params.set('countries', state.filters.countries.join(','));
    }

    if (state.filters.search) {
      params.set('search', state.filters.search);
    }

    if (state.colorScheme !== 'type') {
      params.set('colorScheme', state.colorScheme);
    }

    return params.toString();
  }

  /**
   * Decode state from URL
   */
  decodeState() {
    const params = new URLSearchParams(window.location.hash.substring(1));

    const state = {
      filters: {
        types: params.get('types') ? params.get('types').split(',') : [],
        authors: params.get('authors') ? params.get('authors').split(',') : [],
        statuses: params.get('statuses') ? params.get('statuses').split(',') : [],
        domains: params.get('domains') ? params.get('domains').split(',') : [],
        countries: params.get('countries') ? params.get('countries').split(',') : [],
        search: params.get('search') || ''
      },
      colorScheme: params.get('colorScheme') || 'type'
    };

    return state;
  }

  /**
   * Apply state to UI
   */
  applyState(state) {
    // Apply filters
    if (state.filters) {
      this.searchFilter.setFilters(state.filters);
    }

    // Apply color scheme
    if (state.colorScheme) {
      this.controls.setColorScheme(state.colorScheme);
      document.dispatchEvent(new CustomEvent(EVENTS.COLOR_SCHEME_CHANGED, {
        detail: { scheme: state.colorScheme }
      }));
    }
  }

  /**
   * Share current state via URL
   */
  async shareURL() {
    const stateStr = this.encodeState();
    const baseUrl = 'https://asrg.io/knowledge-map';
    const url = `${baseUrl}${stateStr ? '#' + stateStr : ''}`;

    // Copy to clipboard
    const success = await copyToClipboard(url);

    if (success) {
      showToast('Share URL copied to clipboard!');
    } else {
      // Fallback: show in prompt
      prompt('Copy this URL to share:', url);
    }
  }

  /**
   * Restore state from URL on load
   */
  restoreState() {
    if (window.location.hash) {
      try {
        const state = this.decodeState();
        this.applyState(state);
        console.log('Restored state from URL');
      } catch (error) {
        console.error('Failed to restore state from URL:', error);
      }
    }
  }
}
