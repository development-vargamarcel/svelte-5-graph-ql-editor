<script>
  import { graphqlStore } from '../stores/graphql-store.js';

  console.log('[v0] VariablesEditor.svelte: Initializing variables editor component');

  let variables = $state('{}');
  let isValidJson = $state(true);
  let parsedVariables = $state({});
  let updateTimeout = null;

  // Subscribe to store changes
  $effect(() => {
    const unsubscribe = graphqlStore.subscribe(state => {
      console.log('[v0] VariablesEditor: Store state updated:', state);
      if (state.variables !== variables) {
        variables = state.variables;
        validateAndParseJson();
      }
    });
    return unsubscribe;
  });

  function handleVariablesChange(event) {
    const newVariables = event.target.value;
    console.log('[v0] VariablesEditor: Variables changed:', newVariables);
    variables = newVariables;
    validateAndParseJson();
    
    // Debounce updates to prevent excessive calls
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    
    updateTimeout = setTimeout(() => {
      graphqlStore.updateVariables(newVariables);
    }, 300);
  }

  function validateAndParseJson() {
    console.log('[v0] VariablesEditor: Validating JSON:', variables);
    try {
      parsedVariables = JSON.parse(variables);
      isValidJson = true;
      console.log('[v0] VariablesEditor: Valid JSON parsed:', parsedVariables);
    } catch (error) {
      isValidJson = false;
      console.log('[v0] VariablesEditor: Invalid JSON:', error.message);
    }
  }

  function formatJson() {
    console.log('[v0] VariablesEditor: Formatting JSON');
    try {
      const parsed = JSON.parse(variables);
      const formatted = JSON.stringify(parsed, null, 2);
      console.log('[v0] VariablesEditor: Formatted JSON:', formatted);
      graphqlStore.updateVariables(formatted);
    } catch (error) {
      console.error('[v0] VariablesEditor: JSON formatting error:', error);
    }
  }

  function addVariable(name, value) {
    console.log('[v0] VariablesEditor: Adding variable:', name, value);
    try {
      const current = JSON.parse(variables);
      current[name] = value;
      const updated = JSON.stringify(current, null, 2);
      graphqlStore.updateVariables(updated);
    } catch (error) {
      console.error('[v0] VariablesEditor: Error adding variable:', error);
    }
  }

  function removeVariable(name) {
    console.log('[v0] VariablesEditor: Removing variable:', name);
    try {
      const current = JSON.parse(variables);
      delete current[name];
      const updated = JSON.stringify(current, null, 2);
      graphqlStore.updateVariables(updated);
    } catch (error) {
      console.error('[v0] VariablesEditor: Error removing variable:', error);
    }
  }

  function handleAddVariable() {
    const nameEl = document.getElementById('newVarName');
    const typeEl = document.getElementById('newVarType');
    const valueEl = document.getElementById('newVarValue');
    
    if (!nameEl || !typeEl || !valueEl) return;
    
    const name = nameEl.value;
    const type = typeEl.value;
    const valueInput = valueEl.value;
    
    let value;
    try {
      if (type === 'number') {
        value = Number(valueInput);
      } else if (type === 'boolean') {
        value = valueInput.toLowerCase() === 'true';
      } else if (type === 'array' || type === 'object') {
        value = JSON.parse(valueInput);
      } else {
        value = valueInput;
      }
      
      if (name) {
        addVariable(name, value);
        nameEl.value = '';
        valueEl.value = '';
      }
    } catch (error) {
      console.error('[v0] VariablesEditor: Error parsing new variable value:', error);
    }
  }
</script>

<div class="h-full flex flex-col">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-gray-900">Query Variables</h2>
    <div class="flex items-center space-x-2">
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded-full" class:bg-green-500={isValidJson} class:bg-red-500={!isValidJson}></div>
        <span class="text-sm" class:text-green-600={isValidJson} class:text-red-600={!isValidJson}>
          {isValidJson ? 'Valid JSON' : 'Invalid JSON'}
        </span>
      </div>
      <button
        onclick={formatJson}
        disabled={!isValidJson}
        class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Format
      </button>
    </div>
  </div>

  <div class="flex-1 flex space-x-4">
    <div class="flex-1 flex flex-col">
      <h3 class="text-md font-medium mb-2">JSON Editor</h3>
      <div class="flex-1 border border-gray-300 rounded" class:border-red-500={!isValidJson}>
        <textarea
          bind:value={variables}
          oninput={handleVariablesChange}
          placeholder="Enter JSON variables here"
          class="w-full h-full p-4 font-mono text-sm resize-none border-none outline-none"
        ></textarea>
      </div>
    </div>

    <div class="flex-1 flex flex-col">
      <h3 class="text-md font-medium mb-2">Visual Editor</h3>
      <div class="flex-1 bg-gray-50 border border-gray-300 rounded p-4 overflow-y-auto">
        {#if isValidJson}
          <div class="space-y-3">
            {#each Object.entries(parsedVariables) as [key, value]}
              <div class="bg-white p-3 rounded border">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium text-gray-900">{key}</span>
                  <button
                    onclick={() => removeVariable(key)}
                    class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div class="text-sm text-gray-600">
                  <span class="font-medium">Type:</span> {typeof value}
                </div>
                <div class="text-sm text-gray-600">
                  <span class="font-medium">Value:</span> 
                  <code class="bg-gray-100 px-1 rounded">{JSON.stringify(value)}</code>
                </div>
              </div>
            {/each}

            <div class="bg-white p-3 rounded border border-dashed border-gray-300">
              <h4 class="font-medium mb-2">Add Variable</h4>
              <div class="space-y-2">
                <input
                  type="text"
                  placeholder="Variable name"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  id="newVarName"
                />
                <select
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  id="newVarType"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="array">Array</option>
                  <option value="object">Object</option>
                </select>
                <input
                  type="text"
                  placeholder="Value"
                  class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  id="newVarValue"
                />
                <button
                  onclick={handleAddVariable}
                  class="w-full px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Add Variable
                </button>
              </div>
            </div>
          </div>
        {:else}
          <div class="text-center text-gray-500 mt-8">
            <p>Fix JSON syntax to use visual editor</p>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="mt-4 text-sm text-gray-600">
    <p>💡 <strong>Tips:</strong></p>
    <ul class="list-disc list-inside space-y-1 mt-2">
      <li>Variables must be valid JSON format</li>
      <li>Use the visual editor to add/remove variables easily</li>
      <li>Variables are referenced in queries using $ syntax</li>
      <li>Click Format to auto-indent your JSON</li>
    </ul>
  </div>
</div>
