/**
 * Add Entry Panel — slide-in form for adding new nodes to the graph
 */

class AddEntryPanel {
  constructor(graphData, forceGraph) {
    this.nodes = graphData.nodes;
    this.links = graphData.links;
    this.neighbors = graphData.neighbors;
    this.forceGraph = forceGraph;

    this.panel = document.getElementById('add-entry-panel');
    this.content = this.panel.querySelector('.add-entry-content');

    this.init();
  }

  /**
   * Initialize event listeners
   */
  init() {
    // Close button
    this.panel.querySelector('.btn-close').addEventListener('click', () => {
      this.hide();
    });

    // FAB button
    document.getElementById('btn-add-entry').addEventListener('click', () => {
      this.show();
    });

    // Close when a node is selected (mutual exclusion with detail panel)
    document.addEventListener(EVENTS.NODE_SELECTED, () => {
      this.hide();
    });
  }

  /**
   * Show the add entry form
   */
  show() {
    // Close the detail panel first
    document.dispatchEvent(new CustomEvent(EVENTS.NODE_DESELECTED));

    this.content.innerHTML = this.renderForm();
    this.panel.classList.add('visible');
    this.attachFormHandlers();

    // Focus the title input
    setTimeout(() => {
      const titleInput = document.getElementById('entry-title');
      if (titleInput) titleInput.focus();
    }, 350);
  }

  /**
   * Hide the panel
   */
  hide() {
    this.panel.classList.remove('visible');
  }

  /**
   * Render the form HTML
   */
  renderForm() {
    // Build type options from CONFIG
    const typeOptions = Object.keys(CONFIG.colors.nodeTypes)
      .filter(t => t !== 'Unknown')
      .map(t => `<option value="${escapeHTML(t)}">${escapeHTML(t)}</option>`)
      .join('');

    // Build status options from CONFIG
    const statusOptions = CONFIG.statuses
      .map(s => `<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`)
      .join('');

    // Build domain checkboxes from CONFIG
    const domainCheckboxes = CONFIG.domains
      .map(d => `
        <label class="filter-checkbox">
          <input type="checkbox" name="domain" value="${escapeHTML(d)}"> ${escapeHTML(d)}
        </label>
      `).join('');

    return `
      <div class="detail-header">
        <h2>Add New Entry</h2>
      </div>

      <form id="add-entry-form" class="add-entry-form">
        <div class="form-group">
          <label for="entry-title">Title *</label>
          <input type="text" id="entry-title" required
                 placeholder="e.g., ISO 21434 Road vehicles - Cybersecurity engineering" />
        </div>

        <div class="form-group">
          <label for="entry-type">Type</label>
          <select id="entry-type">
            <option value="">-- Select Type --</option>
            ${typeOptions}
          </select>
        </div>

        <div class="form-group">
          <label>Domains</label>
          <div class="domain-checkbox-group">
            ${domainCheckboxes}
          </div>
        </div>

        <div class="form-group">
          <label for="entry-status">Status</label>
          <select id="entry-status">
            <option value="">-- Select Status --</option>
            ${statusOptions}
          </select>
        </div>

        <div class="form-group">
          <label for="entry-version">Version</label>
          <input type="text" id="entry-version" placeholder="e.g., 2021" />
        </div>

        <div class="form-group">
          <label for="entry-author">Author / Organization</label>
          <input type="text" id="entry-author" placeholder="e.g., ISO, SAE International" />
        </div>

        <div class="form-group">
          <label for="entry-country">Country</label>
          <input type="text" id="entry-country" placeholder="e.g., International" />
        </div>

        <div class="form-group">
          <label for="entry-language">Language</label>
          <input type="text" id="entry-language" placeholder="e.g., English" value="English" />
        </div>

        <div class="form-group">
          <label for="entry-date">Date</label>
          <input type="text" id="entry-date" placeholder="e.g., 2021-08-31" />
        </div>

        <div class="form-group">
          <label for="entry-link">Link (URL)</label>
          <input type="url" id="entry-link" placeholder="https://..." />
        </div>

        <div class="form-group">
          <label for="entry-description">Description</label>
          <textarea id="entry-description" rows="3"
                    placeholder="Brief description of this standard or regulation"></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save</button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-entry">Cancel</button>
        </div>
      </form>
    `;
  }

  /**
   * Attach event handlers to the rendered form
   */
  attachFormHandlers() {
    const form = document.getElementById('add-entry-form');
    const cancelBtn = document.getElementById('btn-cancel-entry');

    cancelBtn.addEventListener('click', () => this.hide());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveEntry();
    });
  }

  /**
   * Gather form data, create a node, and add it to the graph
   */
  saveEntry() {
    // 1. Gather form values
    const title = document.getElementById('entry-title').value.trim();
    if (!title) return;

    const type = document.getElementById('entry-type').value || 'Unknown';
    const status = document.getElementById('entry-status').value || 'Unknown';
    const version = document.getElementById('entry-version').value.trim();
    const author = document.getElementById('entry-author').value.trim() || 'Unknown';
    const country = document.getElementById('entry-country').value.trim() || 'International';
    const language = document.getElementById('entry-language').value.trim() || 'English';
    const date = document.getElementById('entry-date').value.trim();
    const link = document.getElementById('entry-link').value.trim();
    const description = document.getElementById('entry-description').value.trim();

    // Gather selected domains
    const domainCheckboxes = this.panel.querySelectorAll('input[name="domain"]:checked');
    const domain = Array.from(domainCheckboxes).map(cb => cb.value);

    // 2. Create node object using existing helper functions
    let id = generateID(title);
    const shortTitle = createShortTitle(title);
    const authorShort = extractPrimaryAuthor(author);
    const category = normalizeType(type);
    const parsedDate = parseDate(date);

    // 3. Check for duplicate ID
    const existingIds = new Set(this.nodes.map(n => n.id));
    if (existingIds.has(id)) {
      id = id + '_' + Date.now();
    }

    const newNode = {
      id,
      title,
      type,
      author,
      date: parsedDate,
      domain,
      status,
      version,
      language,
      country,
      link,
      description,
      shortTitle,
      authorShort,
      category,
      degree: 0
    };

    // 4. Add to graph data
    this.nodes.push(newNode);
    this.neighbors.set(newNode.id, new Set());

    // 5. Add to the visualization
    this.forceGraph.addNode(newNode);

    // 6. Dispatch event for other components
    document.dispatchEvent(new CustomEvent(EVENTS.NODE_ADDED, {
      detail: { node: newNode }
    }));

    // 7. Show confirmation and close
    showToast(`Added "${shortTitle}" to the graph`);
    this.hide();
  }
}
