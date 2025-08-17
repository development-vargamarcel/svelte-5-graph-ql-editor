<script>
  import { graphqlStore } from '../stores/graphql-store.js';

  console.log('[v0] QueryEditor.svelte: Initializing query editor component');

  let { darkMode = false } = $props();

  let query = $state('');
  let isExecuting = $state(false);

  // Subscribe to store changes
  $effect(() => {
    const unsubscribe = graphqlStore.subscribe(state => {
      console.log('[v0] QueryEditor: Store state updated, query length:', state.query.length);
      if (state.query !== query) {
        query = state.query;
      }
      isExecuting = state.loading;
    });
    return unsubscribe;
  });

  function handleQueryChange(event) {
    const newQuery = event.target.value;
    console.log('[v0] QueryEditor: Query changed, new length:', newQuery.length);
    query = newQuery;
    clearTimeout(handleQueryChange.timeout);
    handleQueryChange.timeout = setTimeout(() => {
      graphqlStore.updateQuery(newQuery);
    }, 300);
  }

  async function executeQuery() {
    console.log('[v0] QueryEditor: Executing query button clicked');
    await graphqlStore.executeQuery();
  }

  function formatQuery() {
    console.log('[v0] QueryEditor: Formatting query');
    // Simple formatting - add proper indentation
    const formatted = query
      .replace(/{\s*/g, '{\n  ')
      .replace(/}\s*/g, '\n}\n')
      .replace(/,\s*/g, ',\n  ')
      .replace(/\n\s*\n/g, '\n');
    
    console.log('[v0] QueryEditor: Formatted query:', formatted);
    graphqlStore.updateQuery(formatted);
  }
</script>

<div class="h-full flex flex-col {darkMode ? 'text-white' : 'text-gray-900'}">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold">GraphQL Query Editor</h2>
    <div class="flex space-x-2">
      <button
        onclick={formatQuery}
        class="px-3 py-1 {darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded text-sm"
      >
        Format
      </button>
      <button
        onclick={executeQuery}
        disabled={isExecuting}
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExecuting ? 'Executing...' : 'Execute Query'}
      </button>
    </div>
  </div>

  <div class="flex-1 border rounded {darkMode ? 'border-gray-600' : 'border-gray-300'}">
    <textarea
      value={query}
      oninput={handleQueryChange}
      placeholder="Enter your GraphQL query here..."
      class="w-full h-full p-4 font-mono text-sm resize-none border-none outline-none {darkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}"
    ></textarea>
  </div>

  <div class="mt-4 text-sm {darkMode ? 'text-gray-300' : 'text-gray-600'}">
    <p>💡 <strong>Tips:</strong></p>
    <ul class="list-disc list-inside space-y-1 mt-2">
      <li>Use Ctrl+Space for autocomplete (when schema is loaded)</li>
      <li>Click "Format" to auto-indent your query</li>
      <li>Switch to "Visual Builder" tab to build queries visually</li>
      <li>Check the "Variables" tab to define query variables</li>
    </ul>
  </div>
</div>
