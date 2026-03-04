/**
 * Graph builder - creates node/link structure
 */

class GraphBuilder {
  /**
   * Build graph from nodes and relationships
   */
  buildGraph(nodes, relationshipsData) {
    // Create node lookup map
    const nodeMap = new Map();
    nodes.forEach(node => {
      nodeMap.set(node.id, node);
    });

    // Build links from relationships
    const links = [];
    const validRelationships = relationshipsData.relationships.filter(rel => {
      const sourceExists = nodeMap.has(rel.source);
      const targetExists = nodeMap.has(rel.target);

      if (!sourceExists) {
        console.warn(`Relationship source not found: ${rel.source}`);
      }
      if (!targetExists) {
        console.warn(`Relationship target not found: ${rel.target}`);
      }

      return sourceExists && targetExists;
    });

    validRelationships.forEach(rel => {
      const relType = relationshipsData.relationshipTypes[rel.type] || {};

      links.push({
        source: rel.source,
        target: rel.target,
        type: rel.type,
        description: rel.description || '',
        strength: relType.strength || 0.5,
        color: relType.color || '#999'
      });
    });

    // Calculate node degrees (number of connections)
    const degreeMap = new Map();
    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;

      degreeMap.set(sourceId, (degreeMap.get(sourceId) || 0) + 1);
      degreeMap.set(targetId, (degreeMap.get(targetId) || 0) + 1);
    });

    nodes.forEach(node => {
      node.degree = degreeMap.get(node.id) || 0;
    });

    // Build neighbor maps for quick lookups
    const neighbors = new Map();
    nodes.forEach(node => {
      neighbors.set(node.id, new Set());
    });

    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;

      neighbors.get(sourceId).add(targetId);
      neighbors.get(targetId).add(sourceId);
    });

    console.log(`Built graph: ${nodes.length} nodes, ${links.length} links`);

    return {
      nodes,
      links,
      neighbors
    };
  }

  /**
   * Get connected nodes for a given node
   */
  getConnectedNodes(nodeId, neighbors, nodes) {
    const neighborIds = neighbors.get(nodeId);
    if (!neighborIds) return [];

    return nodes.filter(node => neighborIds.has(node.id));
  }

  /**
   * Get links connected to a node
   */
  getConnectedLinks(nodeId, links) {
    return links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return sourceId === nodeId || targetId === nodeId;
    });
  }

  /**
   * Get scale factor for a node based on its degree
   */
  getNodeScale(degree) {
    if (degree <= 1) return CONFIG.nodes.minScale;

    const scale = d3.scaleLog()
      .domain([1, 20])
      .range([CONFIG.nodes.minScale, CONFIG.nodes.maxScale])
      .clamp(true);

    return scale(degree);
  }

  /**
   * Get node dimensions (width, height) based on degree
   */
  getNodeDimensions(degree) {
    const s = this.getNodeScale(degree);
    return {
      width: CONFIG.nodes.baseWidth * s,
      height: CONFIG.nodes.baseHeight * s
    };
  }

  /**
   * Get collision radius for rectangle nodes (half-diagonal)
   */
  getCollisionRadius(degree) {
    const { width, height } = this.getNodeDimensions(degree);
    return Math.sqrt(width * width + height * height) / 2 + 4;
  }

  /**
   * Calculate node radius based on degree (legacy, used for fallback)
   */
  getNodeRadius(degree) {
    return this.getCollisionRadius(degree);
  }
}
