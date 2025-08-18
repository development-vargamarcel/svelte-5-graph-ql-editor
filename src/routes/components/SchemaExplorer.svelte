<script>
  import { run, stopPropagation } from 'svelte/legacy';
  import { graphqlStore } from '../stores/graphql-store.js';
  import FieldRenderer from './FieldRenderer.svelte'; // Import the FieldRenderer component

  console.log('[v0] SchemaExplorer.svelte: Initializing schema explorer with infinite nesting support');

  let searchTerm = $state('');
  let selectedType = $state(null);
  let storeState = $state({});
  
  let expandedFields = $state(new Set()); // Tracks expanded state for nested fields
  let selectedFields = $state(new Set()); // Tracks which fields are selected at each level

  let filteredTypes = $state([]);
  let queryType = $state(null);
  let mutationType = $state(null);

  // Subscribe to store changes
  $effect(() => {
    const unsubscribe = graphqlStore.subscribe(state => {
      console.log('[v0] SchemaExplorer: Store state updated:', state);
      storeState = state;
    });
    return unsubscribe;
  });

  // Update filtered types when schema or search term changes
  $effect(() => {
    if (storeState.schema) {
      filteredTypes = storeState.schema.types?.filter(type => 
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !type.name.startsWith('__')
      ) || [];
      queryType = storeState.schema.queryType;
      mutationType = storeState.schema.mutationType;
    } else {
      filteredTypes = [];
      queryType = null;
      mutationType = null;
    }
  });

  async function loadSchema() {
    console.log('[v0] SchemaExplorer: Loading schema via introspection');
    await graphqlStore.introspectSchema();
  }

  function selectType(type) {
    console.log('[v0] SchemaExplorer: Selecting type:', type);
    selectedType = type;
    expandedFields.clear();
    selectedFields.clear();
  }

  function toggleFieldExpansion(fieldPath) {
    console.log('[v0] SchemaExplorer: Toggling field expansion for path:', fieldPath);
    if (expandedFields.has(fieldPath)) {
      expandedFields.delete(fieldPath);
    } else {
      expandedFields.add(fieldPath);
    }
    expandedFields = new Set(expandedFields); // Trigger reactivity
  }

  function toggleFieldSelection(fieldPath) {
    console.log('[v0] SchemaExplorer: Toggling field selection for path:', fieldPath);
    if (selectedFields.has(fieldPath)) {
      selectedFields.delete(fieldPath);
    } else {
      selectedFields.add(fieldPath);
    }
    selectedFields = new Set(selectedFields); // Trigger reactivity
    
    // Update query structure
    updateQueryFromSelection();
  }

  function getFieldType(field) {
    if (field.type.name) return field.type.name;
    if (field.type.ofType?.name) return field.type.ofType.name;
    if (field.type.ofType?.ofType?.name) return field.type.ofType.ofType.name;
    return 'Unknown';
  }

  function isObjectType(field) {
    return field.type?.kind === 'OBJECT' || 
           field.type?.ofType?.kind === 'OBJECT' ||
           field.type?.ofType?.ofType?.kind === 'OBJECT';
  }

  function updateQueryFromSelection() {
    console.log('[v0] SchemaExplorer: Building query from nested selections');
    
    if (!selectedType) return;
    
    const buildNestedFields = (typeName, pathPrefix = '', visitedTypes = new Set(), depth = 0) => {
      // Prevent infinite recursion
      if (depth > 10) {
        console.warn('[v0] SchemaExplorer: Maximum depth reached, preventing infinite recursion');
        return [];
      }
      
      // Prevent circular references
      if (visitedTypes.has(typeName)) {
        console.warn('[v0] SchemaExplorer: Circular reference detected for type:', typeName);
        return [];
      }
      
      const fields = [];
      const typeDefinition = storeState.schema?.types?.find(t => t.name === typeName);
      
      if (!typeDefinition?.fields) return fields;
      
      const newVisitedTypes = new Set(visitedTypes);
      newVisitedTypes.add(typeName);
      
      for (const field of typeDefinition.fields) {
        const fieldPath = pathPrefix ? `${pathPrefix}.${field.name}` : field.name;
        const isSelected = selectedFields.has(fieldPath);
        
        if (isSelected) {
          const fieldObj = {
            name: field.name,
            args: [],
            fields: []
          };
          
          // Add arguments if field has them
          if (field.args && field.args.length > 0) {
            fieldObj.args = field.args.map(arg => ({
              name: arg.name,
              value: getDefaultValueForType(arg.type),
              type: arg.type.name || arg.type.ofType?.name || 'String'
            }));
          }
          
          // Recursively build nested fields if this is an object type
          if (isObjectType(field)) {
            const fieldType = getFieldType(field);
            fieldObj.fields = buildNestedFields(fieldType, fieldPath, newVisitedTypes, depth + 1);
          }
          
          fields.push(fieldObj);
        }
      }
      
      return fields;
    };
    
    const rootFields = buildNestedFields(selectedType.name);
    
    if (rootFields.length > 0) {
      const newStructure = {
        operation: 'query',
        name: `Get${selectedType.name}`,
        variables: [],
        fields: rootFields
      };
      
      console.log('[v0] SchemaExplorer: Generated nested query structure:', newStructure);
      graphqlStore.updateQueryStructure(newStructure);
    }
  }

  function isScalarType(type) {
    const scalarTypes = ['String', 'Int', 'Float', 'Boolean', 'ID'];
    const typeName = type.name || type.ofType?.name;
    return scalarTypes.includes(typeName) || type.kind === 'SCALAR' || type.ofType?.kind === 'SCALAR';
  }

  function getDefaultValueForType(type) {
    const typeName = type.name || type.ofType?.name;
    switch (typeName) {
      case 'String':
      case 'ID':
        return '"example"';
      case 'Int':
        return '1';
      case 'Float':
        return '1.0';
      case 'Boolean':
        return 'true';
      default:
        return '"value"';
    }
  }

  function generateQueryFromType(type) {
    console.log('[v0] SchemaExplorer: Generating query from type:', type.name);
    
    if (!type.fields) return;

    const queryFields = type.fields
      .filter(field => isScalarType(field.type))
      .slice(0, 5)
      .map(field => field.name);

    const newStructure = {
      operation: 'query',
      name: `Get${type.name}`,
      variables: [],
      fields: [{
        name: type.name.toLowerCase(),
        args: [],
        fields: queryFields
      }]
    };

    console.log('[v0] SchemaExplorer: Generated query structure:', newStructure);
    graphqlStore.updateQueryStructure(newStructure);
  }

  function handleSearchChange(event) {
    searchTerm = event.target.value;
    console.log('[v0] SchemaExplorer: Search term changed:', searchTerm);
  }
</script>

<div class="h-full flex flex-col p-4">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-gray-900">Schema Explorer</h2>
    <button
      onclick={loadSchema}
      disabled={storeState.loading}
      class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
    >
      {storeState.loading ? 'Loading...' : 'Load Schema'}
    </button>
  </div>

  {#if storeState.schema}
    <!-- Search -->
    <div class="mb-4">
      <input
        type="text"
        bind:value={searchTerm}
        oninput={handleSearchChange}
        placeholder="Search types..."
        class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
      />
    </div>

    <!-- Root Types -->
    <div class="mb-4 space-y-2">
      {#if queryType}
        <div class="p-2 bg-green-50 border border-green-200 rounded">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-green-800">Query: {queryType.name}</span>
            <button
              onclick={() => {
                const type = storeState.schema.types.find(t => t.name === queryType.name);
                if (type) generateQueryFromType(type);
              }}
              class="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            >
              Generate Query
            </button>
          </div>
        </div>
      {/if}
      {#if mutationType}
        <div class="p-2 bg-blue-50 border border-blue-200 rounded">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-blue-800">Mutation: {mutationType.name}</span>
            <button
              onclick={() => {
                const type = storeState.schema.types.find(t => t.name === mutationType.name);
                if (type) {
                  const newStructure = { ...storeState.queryStructure, operation: 'mutation' };
                  graphqlStore.updateQueryStructure(newStructure);
                }
              }}
              class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Switch to Mutation
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Types List -->
    <div class="flex-1 overflow-y-auto">
      <div class="space-y-1">
        {#each filteredTypes as type}
          <div
            role="button"
            tabindex="0"
            onclick={() => selectType(type)}
            onkeydown={(e) => { if (e.key === 'Enter') selectType(type); }}
            class="w-full text-left p-2 rounded hover:bg-gray-100 {selectedType?.name === type.name ? 'bg-blue-50 border border-blue-200' : ''}"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-sm">{type.name}</span>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500 uppercase">{type.kind}</span>
                {#if type.kind === 'OBJECT' && type.fields}
                  <button
                    onclick={stopPropagation((e) => {
                      generateQueryFromType(type);
                    })}
                    class="px-1 py-0.5 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                  >
                    Quick Query
                  </button>
                {/if}
              </div>
            </div>
            {#if type.description}
              <p class="text-xs text-gray-600 mt-1">{type.description}</p>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Enhanced Selected Type Details with infinite nesting support -->
    {#if selectedType}
      <div class="mt-4 border-t pt-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-medium text-sm">{selectedType.name} Fields</h3>
          <button
            onclick={updateQueryFromSelection}
            disabled={selectedFields.size === 0}
            class="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
          >
            Build Query ({selectedFields.size} selected)
          </button>
        </div>
        
        <div class="space-y-1 max-h-60 overflow-y-auto border border-gray-200 rounded p-2">
          {#each selectedType.fields || [] as field}
            <FieldRenderer 
              {field} 
              typeName={selectedType.name}
              {selectedFields}
              {expandedFields}
              fieldPath={field.name}
              depth={0}
              onFieldToggle={toggleFieldSelection}
              onExpandToggle={toggleFieldExpansion}
            />
          {/each}
        </div>
        
        {#if selectedFields.size > 0}
          <div class="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <div class="font-medium text-blue-800">Selected Fields:</div>
            <div class="text-blue-700 mt-1">
              {Array.from(selectedFields).join(', ')}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  {:else}
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center text-gray-500">
        <div class="text-4xl mb-2">🔍</div>
        <p>No schema loaded</p>
        <p class="text-sm mt-1">Click "Load Schema" to introspect the GraphQL endpoint</p>
        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
          <p class="font-medium text-blue-800">💡 Tip:</p>
          <p class="text-blue-700 mt-1">
            Schema introspection allows you to explore available types, fields, and operations.
            Once loaded, you can click checkboxes to select fields and build nested queries visually!
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
