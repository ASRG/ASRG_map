/**
 * Force-directed graph visualization
 */

class ForceGraph {
  constructor(containerSelector) {
    this.container = d3.select(containerSelector);
    this.svg = null;
    this.graphContainer = null;
    this.simulation = null;
    this.nodeSelection = null;
    this.linkSelection = null;
    this.zoom = null;

    // Renderers and handlers
    this.graphBuilder = new GraphBuilder();
    this.nodeRenderer = new NodeRenderer(this.graphBuilder);
    this.linkRenderer = new LinkRenderer();
    this.interactions = null;

    // Data
    this.nodes = [];
    this.links = [];
    this.neighbors = null;

    // State
    this.isPaused = false;
    this.currentTransform = d3.zoomIdentity;
  }

  /**
   * Initialize the graph
   */
  init(graphData) {
    const { nodes, links, neighbors } = graphData;
    this.nodes = nodes;
    this.links = links;
    this.neighbors = neighbors;

    // Get container dimensions
    const containerRect = this.container.node().getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    // Create SVG
    this.svg = this.container.append('svg')
      .attr('width', width)
      .attr('height', height);

    // Setup zoom
    this.zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        this.currentTransform = event.transform;
        this.graphContainer.attr('transform', event.transform);
        this.nodeRenderer.updateLabelVisibility(this.nodeSelection, event.transform.k);
      });

    this.svg.call(this.zoom);

    // Create container for graph elements
    this.graphContainer = this.svg.append('g')
      .attr('class', 'graph-container');

    // Render links and nodes
    this.linkSelection = this.linkRenderer.renderLinks(this.graphContainer, this.links);
    this.nodeSelection = this.nodeRenderer.renderNodes(this.graphContainer, this.nodes);

    // Setup force simulation
    this.setupSimulation(width, height);

    // Setup interactions
    this.interactions = new Interactions(this.simulation, this.nodeRenderer);
    this.interactions.setupDrag(this.nodeSelection);
    this.interactions.setupClick(this.nodeSelection);
    this.interactions.setupHover(this.nodeSelection);
    this.interactions.setupBackgroundClick(this.svg);

    // Setup event listeners
    this.setupEventListeners();

    // Center the graph
    this.centerGraph();
  }

  /**
   * Setup force simulation
   */
  setupSimulation(width, height) {
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links)
        .id(d => d.id)
        .distance(d => CONFIG.simulation.linkDistance / d.strength))
      .force('charge', d3.forceManyBody()
        .strength(CONFIG.simulation.chargeStrength))
      .force('x', d3.forceX(width / 2).strength(CONFIG.simulation.centerStrength))
      .force('y', d3.forceY(height / 2).strength(CONFIG.simulation.centerStrength))
      .force('collision', d3.forceCollide()
        .radius(d => this.graphBuilder.getCollisionRadius(d.degree)))
      .alphaDecay(CONFIG.simulation.alphaDecay)
      .velocityDecay(CONFIG.simulation.velocityDecay);

    // Update positions on each tick
    this.simulation.on('tick', () => {
      this.linkRenderer.updatePositions(this.linkSelection);
      this.nodeRenderer.updatePositions(this.nodeSelection);
    });
  }

  /**
   * Setup event listeners for external events
   */
  setupEventListeners() {
    // Node selection
    document.addEventListener(EVENTS.NODE_SELECTED, (e) => {
      const node = e.detail.node;
      this.nodeRenderer.highlightNode(this.nodeSelection, node.id);
      this.linkRenderer.highlightConnected(this.linkSelection, node.id);

      // Get connected nodes
      const connectedIds = new Set([node.id]);
      this.neighbors.get(node.id).forEach(id => connectedIds.add(id));
      this.nodeRenderer.highlightConnected(this.nodeSelection, connectedIds);
    });

    // Node deselection
    document.addEventListener(EVENTS.NODE_DESELECTED, () => {
      this.nodeRenderer.highlightNode(this.nodeSelection, null);
      this.linkRenderer.resetHighlights(this.linkSelection);
      this.nodeRenderer.highlightConnected(this.nodeSelection, new Set());
    });

    // Filters changed
    document.addEventListener(EVENTS.FILTERS_CHANGED, (e) => {
      const visibleIds = e.detail.visibleIds;
      this.nodeRenderer.fadeNodes(this.nodeSelection, visibleIds);
      this.linkRenderer.fadeLinks(this.linkSelection, visibleIds);
    });

    // Color scheme changed
    document.addEventListener(EVENTS.COLOR_SCHEME_CHANGED, (e) => {
      this.nodeRenderer.setColorScheme(e.detail.scheme);
      this.nodeRenderer.updateColors(this.nodeSelection);
    });

    // View reset
    document.addEventListener(EVENTS.VIEW_RESET, () => {
      this.resetView();
    });

    // Simulation pause/resume
    document.addEventListener(EVENTS.SIMULATION_PAUSED, () => {
      this.pause();
    });

    document.addEventListener(EVENTS.SIMULATION_RESUMED, () => {
      this.resume();
    });
  }

  /**
   * Pause simulation
   */
  pause() {
    this.simulation.stop();
    this.isPaused = true;
  }

  /**
   * Resume simulation
   */
  resume() {
    this.simulation.alpha(0.3).restart();
    this.isPaused = false;
  }

  /**
   * Reset view to center
   */
  resetView() {
    this.svg.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);

    // Restart simulation
    this.simulation.alpha(0.5).restart();
  }

  /**
   * Center the graph
   */
  centerGraph() {
    // Wait for simulation to settle a bit
    setTimeout(() => {
      const bounds = this.graphContainer.node().getBBox();
      const containerRect = this.container.node().getBoundingClientRect();

      const fullWidth = containerRect.width;
      const fullHeight = containerRect.height;
      const width = bounds.width;
      const height = bounds.height;

      const midX = bounds.x + width / 2;
      const midY = bounds.y + height / 2;

      const scale = 0.9 / Math.max(width / fullWidth, height / fullHeight);
      const translate = [
        fullWidth / 2 - scale * midX,
        fullHeight / 2 - scale * midY
      ];

      this.svg.transition()
        .duration(750)
        .call(
          this.zoom.transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    }, 2000);
  }

  /**
   * Get SVG element for export
   */
  getSVG() {
    return this.svg.node();
  }

  /**
   * Zoom to node
   */
  zoomToNode(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const containerRect = this.container.node().getBoundingClientRect();
    const scale = 2;
    const translate = [
      containerRect.width / 2 - scale * node.x,
      containerRect.height / 2 - scale * node.y
    ];

    this.svg.transition()
      .duration(750)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }

  /**
   * Add a new node to the running simulation
   */
  addNode(newNode) {
    // Position near viewport center in graph coordinates
    const containerRect = this.container.node().getBoundingClientRect();
    const centerScreen = [containerRect.width / 2, containerRect.height / 2];
    const graphCoords = this.currentTransform.invert(centerScreen);
    newNode.x = graphCoords[0] + (Math.random() - 0.5) * 100;
    newNode.y = graphCoords[1] + (Math.random() - 0.5) * 100;

    // Add the SVG elements for this node
    const newNodeSelection = this.nodeRenderer.addSingleNode(this.graphContainer, newNode);

    // Re-select ALL node groups to update the selection (needed for tick handler)
    this.nodeSelection = this.graphContainer.select('g.nodes').selectAll('g.node');

    // Setup interactions on the new node
    this.interactions.setupDrag(newNodeSelection);
    this.interactions.setupClick(newNodeSelection);
    this.interactions.setupHover(newNodeSelection);

    // Update the simulation with the new nodes array and restart
    this.simulation.nodes(this.nodes);
    this.simulation.alpha(0.3).restart();
  }

  /**
   * Get graph data
   */
  getData() {
    return {
      nodes: this.nodes,
      links: this.links,
      neighbors: this.neighbors
    };
  }
}
