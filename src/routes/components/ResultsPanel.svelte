<script>
  import { graphqlStore } from '../stores/graphql-store.js';

  console.log('[v0] ResultsPanel.svelte: Initializing results panel component');

  let viewMode = $state('formatted'); // 'formatted', 'raw', 'table'
  let storeState = $state({});
  let tableData = $state(null);

  // Subscribe to store changes
  graphqlStore.subscribe(state => {
    console.log('[v0] ResultsPanel: Store state updated:', state);
    storeState = state;
    tableData = renderTableView(state.results);
  });

  function copyResults() {
    console.log('[v0] ResultsPanel: Copying results to clipboard');
    if (storeState.results) {
      navigator.clipboard.writeText(JSON.stringify(storeState.results, null, 2));
    }
  }

  function downloadResults() {
    console.log('[v0] ResultsPanel: Downloading results as JSON file');
    if (storeState.results) {
      const blob = new Blob([JSON.stringify(storeState.results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graphql-results.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  function renderTableView(data) {
    console.log('[v0] ResultsPanel: Rendering table view for data:', data);
    
    if (!data || typeof data !== 'object') return null;
    
    // Handle GraphQL response structure
    if (data.data) {
      const firstKey = Object.keys(data.data)[0];
      const firstValue = data.data[firstKey];
      
      if (Array.isArray(firstValue)) {
        return firstValue;
      }
    }
    
    return null;
  }
</script>

<div class="h-full flex flex-col">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-gray-900">Query Results</h2>
    <div class="flex items-center space-x-2">
      <!-- View Mode Selector -->
      <div class="flex bg-gray-100 rounded">
        <button
          onclick={() => viewMode = 'formatted'}
          class="px-3 py-1 text-sm rounded {viewMode === 'formatted' ? 'bg-white shadow' : ''}"
        >
          Formatted
        </button>
        <button
          onclick={() => viewMode = 'raw'}
          class="px-3 py-1 text-sm rounded {viewMode === 'raw' ? 'bg-white shadow' : ''}"
        >
          Raw
        </button>
        {#if tableData}
          <button
            onclick={() => viewMode = 'table'}
            class="px-3 py-1 text-sm rounded {viewMode === 'table' ? 'bg-white shadow' : ''}"
          >
            Table
          </button>
        {/if}
      </div>
      
      {#if storeState.results}
        <button
          onclick={copyResults}
          class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Copy
        </button>
        <button
          onclick={downloadResults}
          class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Download
        </button>
      {/if}
    </div>
  </div>

  <div class="flex-1 border border-gray-300 rounded overflow-hidden">
    {#if storeState.loading}
      <div class="h-full flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p class="text-gray-600">Executing query...</p>
        </div>
      </div>
    {:else if storeState.error}
      <div class="h-full flex items-center justify-center">
        <div class="text-center text-red-600">
          <div class="text-4xl mb-2">⚠️</div>
          <p class="font-medium">Query Error</p>
          <p class="text-sm mt-1">{storeState.error}</p>
        </div>
      </div>
    {:else if storeState.results}
      {#if viewMode === 'formatted'}
        <div class="h-full overflow-auto p-4">
          <pre class="text-sm font-mono whitespace-pre-wrap">{JSON.stringify(storeState.results, null, 2)}</pre>
        </div>
      {:else if viewMode === 'raw'}
        <div class="h-full overflow-auto p-4">
          <pre class="text-sm font-mono whitespace-pre-wrap">{JSON.stringify(storeState.results)}</pre>
        </div>
      {:else if viewMode === 'table' && tableData}
        <div class="h-full overflow-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                {#each Object.keys(tableData[0] || {}) as header}
                  <th class="px-4 py-2 text-left font-medium text-gray-900 border-b">{header}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each tableData as row, index}
                <tr class="{index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                  {#each Object.values(row) as cell}
                    <td class="px-4 py-2 border-b">
                      {typeof cell === 'object' ? JSON.stringify(cell) : cell}
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {:else}
      <div class="h-full flex items-center justify-center">
        <div class="text-center text-gray-500">
          <div class="text-4xl mb-2">📊</div>
          <p>No results yet</p>
          <p class="text-sm mt-1">Execute a query to see results here</p>
        </div>
      </div>
    {/if}
  </div>

  {#if storeState.results}
    <div class="mt-4 text-sm text-gray-600">
      <div class="flex items-center space-x-4">
        {#if storeState.results.data}
          <span>✅ Query successful</span>
        {/if}
        {#if storeState.results.errors}
          <span class="text-red-600">❌ {storeState.results.errors.length} error(s)</span>
        {/if}
        {#if storeState.results.extensions?.tracing?.duration}
          <span>⏱️ {storeState.results.extensions.tracing.duration}ms</span>
        {/if}
      </div>
    </div>
  {/if}
</div>
