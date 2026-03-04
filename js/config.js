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

  // Node rendering (card-style with circle icon)
  nodes: {
    baseWidth: 140,
    baseHeight: 60,
    cornerRadius: 12,
    padding: 10,
    strokeWidth: 1,
    strokeColor: '#e8eff5',
    bgColor: '#ffffff',
    labelThreshold: 1.2,
    // Scaling by degree
    minScale: 0.85,
    maxScale: 1.15,
    // Text sizing
    titleFontSize: 8,
    titleColor: '#191a1c',
    // Author badge
    authorFontSize: 8,
    authorColor: '#6b7280',
    authorBgColor: '#f3f4f6',
    authorBorderRadius: 4,
    authorPaddingX: 6,
    authorPaddingY: 3,
    // Circle icon (top-left)
    iconRadius: 12,
    iconOffsetX: 18,
    iconOffsetY: 18,
    // Shadow
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowBlur: 8,
    shadowOffsetY: 3
  },

  // SVG icon paths per node type (drawn in ~8x8 unit space centered at 0,0)
  nodeIconPaths: {
    'Norm / Standard': {
      // Document page with folded corner
      d: 'M-2.5,-3.5 V3.5 H2.5 V-0.5 L0,-3.5 Z M0,-3.5 V-0.5 H2.5',
      fill: 'none'
    },
    'Regulation': {
      // Shield
      d: 'M0,-4 L-3.5,-1.5 V1.5 L0,4 L3.5,1.5 V-1.5 Z',
      fill: 'none'
    },
    'Working Group': {
      // People silhouette (two heads + body arc)
      type: 'people'
    },
    'Best Practices': {
      // Checkmark
      d: 'M-3,0.5 L-1,3 L3.5,-2.5',
      fill: 'none'
    },
    'Guidelines': {
      // Three horizontal lines (list)
      d: 'M-3,-2.5 H3 M-3,0 H3 M-3,2.5 H1.5',
      fill: 'none'
    },
    'Framework': {
      // 2x2 grid
      d: 'M-3.5,-3.5 H-0.5 V-0.5 H-3.5 Z M0.5,-3.5 H3.5 V-0.5 H0.5 Z M-3.5,0.5 H-0.5 V3.5 H-3.5 Z M0.5,0.5 H3.5 V3.5 H0.5 Z',
      fill: 'none'
    },
    'Unknown': {
      // Question mark
      d: 'M-1.5,-3.5 Q-3.5,-3.5 -3.5,-1.5 Q-3.5,0 -1,0 V1.5 M-1,3 V3.5',
      fill: 'none'
    }
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
