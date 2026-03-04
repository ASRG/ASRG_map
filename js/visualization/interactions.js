/**
 * Interaction handlers for the force graph
 */

class Interactions {
  constructor(simulation, nodeRenderer) {
    this.simulation = simulation;
    this.nodeRenderer = nodeRenderer;
    this.selectedNode = null;
    this.isDragging = false;
  }

  /**
   * Setup drag behavior
   */
  setupDrag(nodeSelection) {
    const drag = d3.drag()
      .on('start', (event, d) => this.dragStarted(event, d))
      .on('drag', (event, d) => this.dragging(event, d))
      .on('end', (event, d) => this.dragEnded(event, d));

    nodeSelection.call(drag);
  }

  dragStarted(event, d) {
    this.isDragging = false;
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragging(event, d) {
    this.isDragging = true;
    d.fx = event.x;
    d.fy = event.y;
  }

  dragEnded(event, d) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  /**
   * Setup click behavior — opens node URL in new tab
   */
  setupClick(nodeSelection) {
    nodeSelection.on('click', (event, d) => {
      event.stopPropagation();

      // Don't fire click after a drag
      if (this.isDragging) {
        this.isDragging = false;
        return;
      }

      // Open URL in new tab if available
      if (d.link) {
        window.open(d.link, '_blank');
      }

      // Also select the node (for detail panel via search/sidebar)
      this.selectNode(d);
    });
  }

  /**
   * Setup hover behavior
   */
  setupHover(nodeSelection) {
    nodeSelection
      .on('mouseenter', (event, d) => {
        this.showTooltip(event, d);
      })
      .on('mouseleave', () => {
        this.hideTooltip();
      });
  }

  /**
   * Select a node
   */
  selectNode(node) {
    this.selectedNode = node.id;

    // Dispatch event
    document.dispatchEvent(new CustomEvent(EVENTS.NODE_SELECTED, {
      detail: { node }
    }));
  }

  /**
   * Deselect current node
   */
  deselectNode() {
    this.selectedNode = null;

    // Dispatch event
    document.dispatchEvent(new CustomEvent(EVENTS.NODE_DESELECTED));
  }

  /**
   * Show tooltip
   */
  showTooltip(event, node) {
    let tooltip = document.getElementById('node-tooltip');

    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'node-tooltip';
      tooltip.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        z-index: 10000;
        max-width: 300px;
      `;
      document.body.appendChild(tooltip);
    }

    const linkHint = node.link
      ? '<br><span style="opacity: 0.6; font-size: 11px;">Click to open link</span>'
      : '';

    tooltip.innerHTML = `
      <strong>${escapeHTML(node.shortTitle)}</strong><br>
      <span style="opacity: 0.8;">${escapeHTML(node.type)}</span><br>
      <span style="opacity: 0.7;">Connections: ${node.degree}</span>
      ${linkHint}
    `;

    tooltip.style.display = 'block';
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY + 10) + 'px';
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    const tooltip = document.getElementById('node-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  /**
   * Setup background click (deselect)
   */
  setupBackgroundClick(svg) {
    svg.on('click', () => {
      this.deselectNode();
    });
  }

  /**
   * Get selected node ID
   */
  getSelectedNode() {
    return this.selectedNode;
  }
}
