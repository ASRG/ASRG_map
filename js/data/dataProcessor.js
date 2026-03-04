/**
 * Data processor - transforms raw CSV data into nodes
 */

class DataProcessor {
  /**
   * Process entities into nodes
   */
  processEntities(entities) {
    const nodes = entities.map(entity => {
      const id = generateID(entity.title);
      const shortTitle = createShortTitle(entity.title);
      const authorShort = extractPrimaryAuthor(entity.author);
      const category = normalizeType(entity.type);
      const date = parseDate(entity.date);

      return {
        // Original data
        id,
        title: entity.title,
        type: entity.type,
        author: entity.author,
        date,
        domain: entity.domain, // Now an array
        status: entity.status,
        version: entity.version,
        language: entity.language,
        country: entity.country,
        link: entity.link,
        description: entity.description,

        // Computed fields
        shortTitle,
        authorShort,
        category,

        // Graph properties (will be set by graph builder)
        degree: 0
      };
    });

    // Check for duplicate IDs
    const idMap = new Map();
    const duplicates = [];

    nodes.forEach(node => {
      if (idMap.has(node.id)) {
        duplicates.push(node.id);
        // Make ID unique by appending counter
        const count = idMap.get(node.id);
        node.id = `${node.id}_${count}`;
        idMap.set(node.id, count + 1);
      } else {
        idMap.set(node.id, 1);
      }
    });

    if (duplicates.length > 0) {
      console.warn('Found duplicate IDs, made unique:', duplicates);
    }

    console.log(`Processed ${nodes.length} nodes`);
    return nodes;
  }

  /**
   * Get unique values for filtering
   */
  getUniqueValues(nodes, field) {
    const values = new Set();
    nodes.forEach(node => {
      const value = node[field];
      if (Array.isArray(value)) {
        // Handle array fields (like domain)
        value.forEach(v => {
          if (v && v.trim() !== '' && v !== 'Unknown') {
            values.add(v);
          }
        });
      } else if (value && value.trim() !== '' && value !== 'Unknown') {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  }

  /**
   * Get filter options for UI
   */
  getFilterOptions(nodes) {
    return {
      types: this.getUniqueValues(nodes, 'type'),
      authors: this.getUniqueValues(nodes, 'authorShort'),
      statuses: this.getUniqueValues(nodes, 'status'),
      domains: this.getUniqueValues(nodes, 'domain'),
      countries: this.getUniqueValues(nodes, 'country')
    };
  }

  /**
   * Get statistics about the data
   */
  getStatistics(nodes, links) {
    const stats = {
      totalNodes: nodes.length,
      totalLinks: links.length,
      byType: {},
      byAuthor: {},
      byStatus: {},
      avgConnections: 0,
      maxConnections: 0,
      minConnections: Infinity
    };

    // Count by type
    nodes.forEach(node => {
      stats.byType[node.type] = (stats.byType[node.type] || 0) + 1;
      stats.byAuthor[node.authorShort] = (stats.byAuthor[node.authorShort] || 0) + 1;
      stats.byStatus[node.status] = (stats.byStatus[node.status] || 0) + 1;

      if (node.degree > stats.maxConnections) stats.maxConnections = node.degree;
      if (node.degree < stats.minConnections) stats.minConnections = node.degree;
    });

    // Average connections
    const totalConnections = nodes.reduce((sum, node) => sum + node.degree, 0);
    stats.avgConnections = (totalConnections / nodes.length).toFixed(1);

    return stats;
  }
}
