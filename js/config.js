/**
 * Global configuration for the automotive cybersecurity visualization
 */
const CONFIG = {
  // File paths
  paths: {
    csvData: 'data/ASRG_Specifications_List_Enriched.csv',
    relationships: 'data/relationships.json'
  },

  // Domain options (multi-select)
  domains: [
    'IT',
    'services',
    'product',
    'automotive',
    'technical',
    'organizational',
    'tooling',
    'process',
    'method'
  ],

  // Status options
  statuses: [
    'Published',
    'Released',
    'Draft',
    'Under Development',
    'Work in Progress',
    'Superseded',
    'Withdrawn'
  ],

  // Color schemes
  colors: {
    // Node colors by type
    nodeTypes: {
      'Norm / Standard': '#2196F3',
      'Regulation': '#F44336',
      'Working Group': '#4CAF50',
      'Best Practices': '#FF9800',
      'Guidelines': '#9C27B0',
      'Framework': '#00BCD4',
      'Unknown': '#9E9E9E'
    },

    // Node colors by author
    nodeAuthors: {
      'ISO': '#1976D2',
      'SAE': '#388E3C',
      'IEEE': '#F57C00',
      'UNECE': '#C62828',
      'NIST': '#7B1FA2',
      'CERT': '#0097A7',
      'MISRA': '#5D4037',
      'Auto Alliance': '#455A64',
      'Unknown': '#9E9E9E'
    },

    // Node colors by status
    nodeStatus: {
      'Released': '#4CAF50',
      'Draft': '#FF9800',
      'Work in Progress': '#FFC107',
      'Withdrawn': '#F44336',
      'Unknown': '#9E9E9E'
    },

    // Relationship colors (from relationships.json)
    relationships: {
      extends: '#4CAF50',
      references: '#2196F3',
      requires: '#FF9800',
      complements: '#9C27B0',
      partOf: '#00BCD4'
    },

    // UI colors
    ui: {
      selected: '#2563eb',
      highlighted: '#93c5fd',
      faded: 0.1,
      normal: 1.0
    }
  },

  // Force simulation parameters
  simulation: {
    chargeStrength: -400,
    linkDistance: 180,
    collisionRadius: 35,
    centerStrength: 0.12,
    alphaDecay: 0.02,
    velocityDecay: 0.4
  },

  // Node rendering (card-style rounded rectangles)
  nodes: {
    baseWidth: 130,
    baseHeight: 46,
    cornerRadius: 12,
    padding: 10,
    accentWidth: 4,       // colored left accent bar width
    strokeWidth: 1,
    strokeColor: '#e8eff5',
    bgColor: '#ffffff',
    labelThreshold: 1.2,
    // Scaling by degree
    minScale: 0.85,
    maxScale: 1.15,
    // Text sizing
    titleFontSize: 12,
    typeFontSize: 9,
    titleColor: '#191a1c',
    typeColor: '#9ca3af',
    // Shadow
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowBlur: 8,
    shadowOffsetY: 3
  },

  // Link rendering
  links: {
    strokeWidth: 1.5,
    opacity: 0.6,
    opacityHighlight: 1.0,
    arrowSize: 8
  },

  // Search and filter
  search: {
    debounceDelay: 300,
    minChars: 2
  },

  // Animation
  animation: {
    duration: 300,
    fadeDuration: 200
  },

  // Export
  export: {
    imageWidth: 1920,
    imageHeight: 1080,
    imageBackground: '#ffffff'
  }
};

// Event names for inter-module communication
const EVENTS = {
  NODE_SELECTED: 'node:selected',
  NODE_DESELECTED: 'node:deselected',
  NODE_ADDED: 'node:added',
  FILTERS_CHANGED: 'filters:changed',
  SEARCH_CHANGED: 'search:changed',
  COLOR_SCHEME_CHANGED: 'colorScheme:changed',
  SIMULATION_PAUSED: 'simulation:paused',
  SIMULATION_RESUMED: 'simulation:resumed',
  VIEW_RESET: 'view:reset',
  EXPORT_PNG: 'export:png',
  SHARE_URL: 'share:url'
};
