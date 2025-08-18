<script>
  import { graphqlStore } from '../stores/graphql-store.js';

  console.log('[v0] QueryEditor.svelte: Initializing query editor component');

  let query = $state('');
  let isExecuting = $state(false);

  // Subscribe to store changes
  $effect(() => {
    const unsubscribe = graphqlStore.subscribe(state => {
      console.log('[v0] QueryEditor: Store state updated:', state);
      query = state.query;
      isExecuting = state.loading;
    });
    return unsubscribe;
  });

  function handleQueryChange(event) {
    const newQuery = event.target.value;
    console.log('[v0] QueryEditor: Query changed:', newQuery);
    query = newQuery;
    graphqlStore.updateQuery(newQuery);
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

<div class="h-full flex flex-col">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-gray-900">GraphQL Query Editor</h2>
    <div class="flex space-x-2">
      <button
        onclick={formatQuery}
        class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
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

  <div class="flex-1 border border-gray-300 rounded">
    <textarea
      value={query}
      oninput={handleQueryChange}
      placeholder="Enter your GraphQL query here..."
      class="w-full h-full p-4 font-mono text-sm resize-none border-none outline-none"
    ></textarea>
  </div>

  <div class="mt-4 text-sm text-gray-600">
    <p>💡 <strong>Tips:</strong></p>
    <ul class="list-disc list-inside space-y-1 mt-2">
      <li>Use Ctrl+Space for autocomplete (when schema is loaded)</li>
      <li>Click "Format" to auto-indent your query</li>
      <li>Switch to "Visual Builder" tab to build queries visually</li>
      <li>Check the "Variables" tab to define query variables</li>
    </ul>
  </div>
</div>
