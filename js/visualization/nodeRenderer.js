/**
 * Node renderer for the force graph — card-style rounded rectangles
 * Inspired by the ReportCard design: white bg, colored accent, subtle shadow
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
   * Render nodes as card-style rounded rectangles
   */
  renderNodes(container, nodes) {
    // Add shadow filter
    this.addShadowFilter(container);

    const nodeGroup = container.append('g')
      .attr('class', 'nodes');

    const node = nodeGroup.selectAll('g.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('data-id', d => d.id);

    // Card background (white with shadow)
    node.append('rect')
      .attr('class', 'node-card')
      .attr('x', d => {
        const dim = this.graphBuilder.getNodeDimensions(d.degree);
        return -dim.width / 2;
      })
      .attr('y', d => {
        const dim = this.graphBuilder.getNodeDimensions(d.degree);
        return -dim.height / 2;
      })
      .attr('width', d => this.graphBuilder.getNodeDimensions(d.degree).width)
      .attr('height', d => this.graphBuilder.getNodeDimensions(d.degree).height)
      .attr('rx', CONFIG.nodes.cornerRadius)
      .attr('ry', CONFIG.nodes.cornerRadius)
      .attr('fill', CONFIG.nodes.bgColor)
      .attr('stroke', CONFIG.nodes.strokeColor)
      .attr('stroke-width', CONFIG.nodes.strokeWidth)
      .style('filter', 'url(#card-shadow)');

    // Colored left accent bar
    node.append('rect')
      .attr('class', 'node-accent')
      .attr('x', d => {
        const dim = this.graphBuilder.getNodeDimensions(d.degree);
        return -dim.width / 2;
      })
      .attr('y', d => {
        const dim = this.graphBuilder.getNodeDimensions(d.degree);
        return -dim.height / 2 + 6;
      })
      .attr('width', CONFIG.nodes.accentWidth)
      .attr('height', d => {
        const dim = this.graphBuilder.getNodeDimensions(d.degree);
        return dim.height - 12;
      })
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', d => this.getNodeColor(d));

    // Title text (dark, bold)
    node.append('text')
      .attr('class', 'node-title')
      .attr('text-anchor', 'middle')
      .attr('x', CONFIG.nodes.accentWidth / 2)
      .attr('dy', '-0.15em')
      .text(d => this.truncateText(d.shortTitle, d.degree))
      .style('font-size', CONFIG.nodes.titleFontSize + 'px')
      .style('font-weight', '600')
      .style('fill', CONFIG.nodes.titleColor)
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Type text (gray, smaller, shown on zoom)
    node.append('text')
      .attr('class', 'node-type')
      .attr('text-anchor', 'middle')
      .attr('x', CONFIG.nodes.accentWidth / 2)
      .attr('dy', '1.15em')
      .text(d => d.type)
      .style('font-size', CONFIG.nodes.typeFontSize + 'px')
      .style('fill', CONFIG.nodes.typeColor)
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('opacity', 0); // Hidden by default, shown on zoom

    return node;
  }

  /**
   * Add a single new node to the existing node group (avoids re-rendering all nodes)
   */
  addSingleNode(container, newNode) {
    const nodeGroup = container.select('g.nodes');
    const dim = this.graphBuilder.getNodeDimensions(newNode.degree);

    const node = nodeGroup.append('g')
      .datum(newNode)
      .attr('class', 'node')
      .attr('data-id', newNode.id);

    // Card background
    node.append('rect')
      .attr('class', 'node-card')
      .attr('x', -dim.width / 2)
      .attr('y', -dim.height / 2)
      .attr('width', dim.width)
      .attr('height', dim.height)
      .attr('rx', CONFIG.nodes.cornerRadius)
      .attr('ry', CONFIG.nodes.cornerRadius)
      .attr('fill', CONFIG.nodes.bgColor)
      .attr('stroke', CONFIG.nodes.strokeColor)
      .attr('stroke-width', CONFIG.nodes.strokeWidth)
      .style('filter', 'url(#card-shadow)');

    // Colored accent bar
    node.append('rect')
      .attr('class', 'node-accent')
      .attr('x', -dim.width / 2)
      .attr('y', -dim.height / 2 + 6)
      .attr('width', CONFIG.nodes.accentWidth)
      .attr('height', dim.height - 12)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', this.getNodeColor(newNode));

    // Title text
    node.append('text')
      .attr('class', 'node-title')
      .attr('text-anchor', 'middle')
      .attr('x', CONFIG.nodes.accentWidth / 2)
      .attr('dy', '-0.15em')
      .text(this.truncateText(newNode.shortTitle, newNode.degree))
      .style('font-size', CONFIG.nodes.titleFontSize + 'px')
      .style('font-weight', '600')
      .style('fill', CONFIG.nodes.titleColor)
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Type text
    node.append('text')
      .attr('class', 'node-type')
      .attr('text-anchor', 'middle')
      .attr('x', CONFIG.nodes.accentWidth / 2)
      .attr('dy', '1.15em')
      .text(newNode.type)
      .style('font-size', CONFIG.nodes.typeFontSize + 'px')
      .style('fill', CONFIG.nodes.typeColor)
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('opacity', 0);

    return node;
  }

  /**
   * Truncate text to fit within node width
   */
  truncateText(text, degree) {
    const dim = this.graphBuilder.getNodeDimensions(degree);
    const maxChars = Math.floor((dim.width - CONFIG.nodes.padding * 2 - CONFIG.nodes.accentWidth) / 6.5);
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
   * Update node colors (when color scheme changes) — only accent bar changes
   */
  updateColors(nodeSelection) {
    nodeSelection.select('.node-accent')
      .transition()
      .duration(CONFIG.animation.duration)
      .attr('fill', d => this.getNodeColor(d));
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
    const shouldShowType = zoomLevel > CONFIG.nodes.labelThreshold;

    // Type sub-label visibility controlled by zoom
    nodeSelection.select('.node-type')
      .transition()
      .duration(CONFIG.animation.fadeDuration)
      .style('opacity', d => {
        // Always hide if faded
        const node = d3.select(`[data-id="${d.id}"]`);
        if (parseFloat(node.style('opacity')) < 0.5) return 0;

        // Show for important nodes (high degree) even at low zoom
        if (d.degree > 5) return 1;

        // Otherwise, show based on zoom level
        return shouldShowType ? 1 : 0;
      });
  }
}
