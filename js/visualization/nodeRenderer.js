/**
 * Node renderer for the force graph — card-style with circle icon
 * Layout: colored circle icon (top-left) with SVG icon, title (right of icon),
 * author badge (bottom-left). Matches AutoVulnDB reference card design.
 */

class NodeRenderer {
  constructor(graphBuilder) {
    this.graphBuilder = graphBuilder;
    this.colorScheme = 'type'; // default color scheme
    this.shadowFilterAdded = false;
  }

  /**
   * Get node accent color based on current color scheme
   */
  getNodeColor(node) {
    switch (this.colorScheme) {
      case 'type':
        return CONFIG.colors.nodeTypes[node.type] || CONFIG.colors.nodeTypes['Unknown'];
      case 'author':
        return CONFIG.colors.nodeAuthors[node.authorShort] || CONFIG.colors.nodeAuthors['Unknown'];
      case 'status':
        return CONFIG.colors.nodeStatus[node.status] || CONFIG.colors.nodeStatus['Unknown'];
      default:
        return CONFIG.colors.nodeTypes[node.type] || CONFIG.colors.nodeTypes['Unknown'];
    }
  }

  /**
   * Set color scheme
   */
  setColorScheme(scheme) {
    this.colorScheme = scheme;
  }

  /**
   * Add SVG shadow filter to defs (called once)
   */
  addShadowFilter(container) {
    if (this.shadowFilterAdded) return;

    let defs = container.select('defs');
    if (defs.empty()) {
      defs = container.append('defs');
    }

    const filter = defs.append('filter')
      .attr('id', 'card-shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    filter.append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', CONFIG.nodes.shadowOffsetY)
      .attr('stdDeviation', CONFIG.nodes.shadowBlur)
      .attr('flood-color', CONFIG.nodes.shadowColor);

    this.shadowFilterAdded = true;
  }

  /**
   * Draw the SVG icon shape inside the circle
   */
  _drawIcon(group, type, cx, cy) {
    const iconDef = CONFIG.nodeIconPaths[type] || CONFIG.nodeIconPaths['Unknown'];
    const iconGroup = group.append('g')
      .attr('class', 'node-icon-shape')
      .attr('transform', `translate(${cx},${cy})`);

    const strokeStyle = {
      fill: 'none',
      stroke: '#ffffff',
      'stroke-width': 1.3,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    };

    // Special case: Working Group uses multiple elements (people icon)
    if (iconDef.type === 'people') {
      // Left head
      iconGroup.append('circle')
        .attr('cx', -2.2).attr('cy', -2)
        .attr('r', 1.6)
        .attr('fill', 'none')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.3);
      // Right head
      iconGroup.append('circle')
        .attr('cx', 2.2).attr('cy', -2)
        .attr('r', 1.6)
        .attr('fill', 'none')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.3);
      // Body curve
      iconGroup.append('path')
        .attr('d', 'M-4.5,4 C-3.5,1 -1.5,0.5 0,0.5 C1.5,0.5 3.5,1 4.5,4')
        .attr('fill', 'none')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.3)
        .attr('stroke-linecap', 'round');
      return;
    }

    // Standard path-based icon
    const path = iconGroup.append('path')
      .attr('d', iconDef.d);

    // Apply stroke styles
    Object.entries(strokeStyle).forEach(([key, val]) => {
      path.attr(key, val);
    });
  }

  /**
   * Append card elements to a node group (shared by renderNodes and addSingleNode)
   */
  _appendCardElements(group, d) {
    const dim = this.graphBuilder.getNodeDimensions(d.degree);
    const halfW = dim.width / 2;
    const halfH = dim.height / 2;

    // Card background (white with shadow)
    group.append('rect')
      .attr('class', 'node-card')
      .attr('x', -halfW)
      .attr('y', -halfH)
      .attr('width', dim.width)
      .attr('height', dim.height)
      .attr('rx', CONFIG.nodes.cornerRadius)
      .attr('ry', CONFIG.nodes.cornerRadius)
      .attr('fill', CONFIG.nodes.bgColor)
      .attr('stroke', CONFIG.nodes.strokeColor)
      .attr('stroke-width', CONFIG.nodes.strokeWidth)
      .style('filter', 'url(#card-shadow)');

    // Colored circle icon (top-left)
    const iconX = -halfW + CONFIG.nodes.iconOffsetX;
    const iconY = -halfH + CONFIG.nodes.iconOffsetY;

    group.append('circle')
      .attr('class', 'node-icon-bg')
      .attr('cx', iconX)
      .attr('cy', iconY)
      .attr('r', CONFIG.nodes.iconRadius)
      .attr('fill', this.getNodeColor(d))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Draw SVG icon inside circle
    this._drawIcon(group, d.type, iconX, iconY);

    // Title text (to the right of icon)
    const titleX = iconX + CONFIG.nodes.iconRadius + 6;
    const titleMaxWidth = dim.width - (CONFIG.nodes.iconOffsetX + CONFIG.nodes.iconRadius + 6) - CONFIG.nodes.padding;

    group.append('text')
      .attr('class', 'node-title')
      .attr('text-anchor', 'start')
      .attr('x', titleX)
      .attr('y', iconY + 1)
      .attr('dominant-baseline', 'central')
      .text(this.truncateText(d.shortTitle, titleMaxWidth))
      .style('font-size', CONFIG.nodes.titleFontSize + 'px')
      .style('font-weight', '600')
      .style('fill', CONFIG.nodes.titleColor)
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Author badge (bottom-left, pill-shaped background)
    const authorText = d.authorShort || d.author || '';
    if (authorText) {
      const authorX = -halfW + CONFIG.nodes.padding;
      const authorY = halfH - 12;
      const truncatedAuthor = this.truncateAuthor(authorText, dim.width);

      // Badge background rect
      const textWidth = truncatedAuthor.length * 5.2 + CONFIG.nodes.authorPaddingX * 2;
      group.append('rect')
        .attr('class', 'node-author-bg')
        .attr('x', authorX - 1)
        .attr('y', authorY - CONFIG.nodes.authorPaddingY - 4)
        .attr('width', textWidth)
        .attr('height', CONFIG.nodes.authorFontSize + CONFIG.nodes.authorPaddingY * 2)
        .attr('rx', CONFIG.nodes.authorBorderRadius)
        .attr('ry', CONFIG.nodes.authorBorderRadius)
        .attr('fill', CONFIG.nodes.authorBgColor)
        .style('opacity', 0); // Hidden by default

      // Author text
      group.append('text')
        .attr('class', 'node-author')
        .attr('text-anchor', 'start')
        .attr('x', authorX + CONFIG.nodes.authorPaddingX - 1)
        .attr('y', authorY)
        .text(truncatedAuthor)
        .style('font-size', CONFIG.nodes.authorFontSize + 'px')
        .style('fill', CONFIG.nodes.authorColor)
        .style('pointer-events', 'none')
        .style('user-select', 'none')
        .style('opacity', 0); // Hidden by default, shown on zoom
    }
  }

  /**
   * Render nodes as card-style rounded rectangles
   */
  renderNodes(container, nodes) {
    // Add shadow filter
    this.addShadowFilter(container);

    const nodeGroup = container.append('g')
      .attr('class', 'nodes');

    const self = this;
    const node = nodeGroup.selectAll('g.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('data-id', d => d.id)
      .each(function(d) {
        self._appendCardElements(d3.select(this), d);
      });

    return node;
  }

  /**
   * Add a single new node to the existing node group (avoids re-rendering all nodes)
   */
  addSingleNode(container, newNode) {
    const nodeGroup = container.select('g.nodes');

    const node = nodeGroup.append('g')
      .datum(newNode)
      .attr('class', 'node')
      .attr('data-id', newNode.id);

    this._appendCardElements(node, newNode);

    return node;
  }

  /**
   * Truncate text to fit within available pixel width
   */
  truncateText(text, availableWidth) {
    const maxChars = Math.floor(availableWidth / 5.8);
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars - 1) + '\u2026';
  }

  /**
   * Truncate author text to fit within node width
   */
  truncateAuthor(text, nodeWidth) {
    const availableWidth = nodeWidth - CONFIG.nodes.padding * 2 - CONFIG.nodes.authorPaddingX * 2;
    const maxChars = Math.floor(availableWidth / 5);
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars - 1) + '\u2026';
  }

  /**
   * Update node positions during simulation
   */
  updatePositions(nodeSelection) {
    nodeSelection.attr('transform', d => `translate(${d.x},${d.y})`);
  }

  /**
   * Update node colors (when color scheme changes) — icon circle color changes
   */
  updateColors(nodeSelection) {
    const self = this;
    nodeSelection.select('.node-icon-bg')
      .transition()
      .duration(CONFIG.animation.duration)
      .attr('fill', d => self.getNodeColor(d));
  }

  /**
   * Highlight selected node
   */
  highlightNode(nodeSelection, nodeId) {
    nodeSelection.each(function(d) {
      const node = d3.select(this);
      const isSelected = d.id === nodeId;

      node.select('.node-card')
        .transition()
        .duration(CONFIG.animation.fadeDuration)
        .attr('stroke', isSelected ? CONFIG.colors.ui.selected : CONFIG.nodes.strokeColor)
        .attr('stroke-width', isSelected ? 3 : CONFIG.nodes.strokeWidth);
    });
  }

  /**
   * Fade nodes based on filter
   */
  fadeNodes(nodeSelection, visibleIds) {
    nodeSelection.each(function(d) {
      const node = d3.select(this);
      const isVisible = visibleIds.has(d.id);

      node.transition()
        .duration(CONFIG.animation.fadeDuration)
        .style('opacity', isVisible ? CONFIG.colors.ui.normal : CONFIG.colors.ui.faded);
    });
  }

  /**
   * Highlight connected nodes
   */
  highlightConnected(nodeSelection, connectedIds) {
    nodeSelection.each(function(d) {
      const node = d3.select(this);
      const isConnected = connectedIds.has(d.id);

      node.select('.node-card')
        .transition()
        .duration(CONFIG.animation.fadeDuration)
        .attr('stroke', isConnected ? CONFIG.colors.ui.highlighted : CONFIG.nodes.strokeColor)
        .attr('stroke-width', isConnected ? 2.5 : CONFIG.nodes.strokeWidth);
    });
  }

  /**
   * Update label visibility based on zoom level
   */
  updateLabelVisibility(nodeSelection, zoomLevel) {
    const shouldShow = zoomLevel > CONFIG.nodes.labelThreshold;

    // Author text + badge visibility controlled by zoom
    nodeSelection.select('.node-author')
      .transition()
      .duration(CONFIG.animation.fadeDuration)
      .style('opacity', d => {
        const node = d3.select(`[data-id="${d.id}"]`);
        if (parseFloat(node.style('opacity')) < 0.5) return 0;
        if (d.degree > 5) return 1;
        return shouldShow ? 1 : 0;
      });

    nodeSelection.select('.node-author-bg')
      .transition()
      .duration(CONFIG.animation.fadeDuration)
      .style('opacity', d => {
        const node = d3.select(`[data-id="${d.id}"]`);
        if (parseFloat(node.style('opacity')) < 0.5) return 0;
        if (d.degree > 5) return 1;
        return shouldShow ? 1 : 0;
      });
  }
}
