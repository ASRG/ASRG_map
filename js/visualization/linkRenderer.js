/**
 * Link renderer for the force graph
 */

class LinkRenderer {
  /**
   * Render links
   */
  renderLinks(container, links) {
    const linkGroup = container.append('g')
      .attr('class', 'links');

    // Add arrow markers for directed relationships
    const defs = container.append('defs');

    Object.entries(CONFIG.colors.relationships).forEach(([type, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 50)
        .attr('refY', 0)
        .attr('markerWidth', CONFIG.links.arrowSize)
        .attr('markerHeight', CONFIG.links.arrowSize)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    const link = linkGroup.selectAll('line.link')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', d => d.color)
      .attr('stroke-width', CONFIG.links.strokeWidth)
      .attr('stroke-opacity', CONFIG.links.opacity)
      .attr('marker-end', d => `url(#arrow-${d.type})`);

    return link;
  }

  /**
   * Update link positions during simulation
   */
  updatePositions(linkSelection) {
    linkSelection
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
  }

  /**
   * Fade links based on filter
   */
  fadeLinks(linkSelection, visibleIds) {
    linkSelection.each(function(d) {
      const link = d3.select(this);
      const sourceVisible = visibleIds.has(d.source.id);
      const targetVisible = visibleIds.has(d.target.id);
      const isVisible = sourceVisible && targetVisible;

      link.transition()
        .duration(CONFIG.animation.fadeDuration)
        .style('opacity', isVisible ? CONFIG.links.opacity : CONFIG.colors.ui.faded * 0.5);
    });
  }

  /**
   * Highlight connected links
   */
  highlightConnected(linkSelection, nodeId) {
    linkSelection.each(function(d) {
      const link = d3.select(this);
      const isConnected = d.source.id === nodeId || d.target.id === nodeId;

      link.transition()
        .duration(CONFIG.animation.fadeDuration)
        .attr('stroke-width', isConnected ? CONFIG.links.strokeWidth * 2 : CONFIG.links.strokeWidth)
        .attr('stroke-opacity', isConnected ? CONFIG.links.opacityHighlight : CONFIG.links.opacity);
    });
  }

  /**
   * Reset all link highlights
   */
  resetHighlights(linkSelection) {
    linkSelection.transition()
      .duration(CONFIG.animation.fadeDuration)
      .attr('stroke-width', CONFIG.links.strokeWidth)
      .attr('stroke-opacity', CONFIG.links.opacity);
  }
}
