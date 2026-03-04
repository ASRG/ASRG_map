/**
 * Main application entry point
 */

class App {
  constructor() {
    // Components
    this.dataLoader = new DataLoader();
    this.dataProcessor = new DataProcessor();
    this.forceGraph = null;
    this.searchFilter = null;
    this.detailPanel = null;
    this.addEntryPanel = null;
    this.legend = null;
    this.controls = null;
    this.imageExport = null;
    this.urlState = null;

    // Data
    this.rawData = null;
    this.processedData = null;
  }

  /**
   * Initialize application
   */
  async init() {
    try {
      // Show loading state
      this.showLoading();

      // Load data
      console.log('Loading data...');
      this.rawData = await this.dataLoader.loadAll();

      // Process data
      console.log('Processing data...');
      const nodes = this.dataProcessor.processEntities(this.rawData.entities);

      // Build graph
      console.log('Building graph...');
      const graphBuilder = new GraphBuilder();
      const graphData = graphBuilder.buildGraph(nodes, this.rawData.relationships);

      this.processedData = graphData;

      // Get statistics
      const stats = this.dataProcessor.getStatistics(graphData.nodes, graphData.links);
      console.log('Graph statistics:', stats);

      // Show app before initializing visualization so container has dimensions
      this.showApp();

      // Initialize visualization
      console.log('Initializing visualization...');
      this.forceGraph = new ForceGraph('#graph-container');
      this.forceGraph.init(graphData);

      // Initialize UI components
      console.log('Initializing UI...');
      this.searchFilter = new SearchFilter(graphData.nodes);
      this.detailPanel = new DetailPanel(graphData);
      this.addEntryPanel = new AddEntryPanel(graphData, this.forceGraph);
      this.legend = new Legend();
      this.controls = new Controls();

      // Initialize export functionality
      this.imageExport = new ImageExport(this.forceGraph);
      this.urlState = new URLState(this.searchFilter, this.controls);

      // Restore state from URL if present
      this.urlState.restoreState();

      // Update stats display
      this.updateStatsDisplay(stats);

      console.log('Application initialized successfully!');

    } catch (error) {
      console.error('Application initialization failed:', error);
      this.showError(error.message);
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    document.getElementById('error').style.display = 'none';
  }

  /**
   * Show application
   */
  showApp() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('error').style.display = 'none';
  }

  /**
   * Show error state
   */
  showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display = 'none';
    document.getElementById('error').style.display = 'flex';
    document.getElementById('error-message').textContent = message;
  }

  /**
   * Update statistics display
   */
  updateStatsDisplay(stats) {
    const statsContainer = document.getElementById('graph-stats');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat">
          <span class="stat-label">Standards:</span>
          <span class="stat-value">${stats.totalNodes}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Connections:</span>
          <span class="stat-value">${stats.totalLinks}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Avg. Connections:</span>
          <span class="stat-value">${stats.avgConnections}</span>
        </div>
      `;
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init().catch(error => {
    console.error('Fatal error:', error);
  });
});
