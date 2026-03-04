/**
 * Legend UI component
 */

class Legend {
  constructor() {
    this.container = document.getElementById('legend-content');
    this.toggleButton = document.getElementById('btn-toggle-legend');
    this.isCollapsed = false;

    this.init();
  }

  /**
   * Initialize legend
   */
  init() {
    this.render();

    // Setup toggle button
    this.toggleButton.addEventListener('click', () => {
      this.toggle();
    });
  }

  /**
   * Render legend
   */
  render() {
    const html = `
      <div class="legend-group">
        <h4>Node Types</h4>
        ${this.renderColorLegend(CONFIG.colors.nodeTypes)}
      </div>

      <div class="legend-group">
        <h4>Relationship Types</h4>
        ${this.renderRelationshipLegend(CONFIG.colors.relationships)}
      </div>

      <div class="legend-group">
        <h4>Interaction</h4>
        <p style="font-size: 11px; opacity: 0.8; margin: 8px 0;">
          Click a node to open its reference document
        </p>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Render color legend items
   */
  renderColorLegend(colorMap) {
    return Object.entries(colorMap)
      .filter(([type]) => type !== 'Unknown')
      .map(([type, color]) => `
        <div class="legend-item">
          <div class="legend-color" style="background: ${color}"></div>
          <span>${escapeHTML(type)}</span>
        </div>
      `).join('');
  }

  /**
   * Render relationship legend items
   */
  renderRelationshipLegend(colorMap) {
    return Object.entries(colorMap).map(([type, color]) => `
      <div class="legend-item">
        <div class="legend-line" style="background: ${color}"></div>
        <span>${this.formatRelationType(type)}</span>
      </div>
    `).join('');
  }

  /**
   * Format relationship type for display
   */
  formatRelationType(type) {
    // Convert camelCase to Title Case
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Toggle legend visibility
   */
  toggle() {
    this.isCollapsed = !this.isCollapsed;

    if (this.isCollapsed) {
      this.container.style.display = 'none';
      this.toggleButton.textContent = '▶';
    } else {
      this.container.style.display = 'block';
      this.toggleButton.textContent = '▼';
    }
  }
}
