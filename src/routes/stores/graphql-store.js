import { writable } from "svelte/store"

console.log("[v0] graphql-store.js: Initializing GraphQL store")

// Create reactive store for GraphQL state
const DEMO_SCHEMAS = {
  blog: {
    name: "Blog & Social Media",
    description: "Users, posts, comments with deep nesting",
    schema: {
      types: [
        {
          name: "Query",
          kind: "OBJECT",
          description: "The root query type",
          fields: [
            {
              name: "user",
              type: { name: "User", kind: "OBJECT" },
              args: [
                { name: "id", type: { name: "ID", kind: "SCALAR" } },
                { name: "email", type: { name: "String", kind: "SCALAR" } },
              ],
            },
            {
              name: "users",
              type: { name: "User", kind: "LIST", ofType: { name: "User", kind: "OBJECT" } },
              args: [
                { name: "first", type: { name: "Int", kind: "SCALAR" } },
                { name: "filter", type: { name: "UserFilter", kind: "INPUT_OBJECT" } },
              ],
            },
            {
              name: "posts",
              type: { name: "Post", kind: "LIST", ofType: { name: "Post", kind: "OBJECT" } },
              args: [
                { name: "authorId", type: { name: "ID", kind: "SCALAR" } },
                { name: "published", type: { name: "Boolean", kind: "SCALAR" } },
              ],
            },
          ],
        },
        {
          name: "User",
          kind: "OBJECT",
          description: "A user in the system",
          fields: [
            { name: "id", type: { name: "ID", kind: "SCALAR" }, args: [] },
            { name: "email", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "name", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "avatar", type: { name: "String", kind: "SCALAR" }, args: [] },
            {
              name: "profile",
              type: { name: "UserProfile", kind: "OBJECT" },
              args: [],
            },
            {
              name: "posts",
              type: { name: "Post", kind: "LIST", ofType: { name: "Post", kind: "OBJECT" } },
              args: [
                { name: "first", type: { name: "Int", kind: "SCALAR" } },
                { name: "published", type: { name: "Boolean", kind: "SCALAR" } },
              ],
            },
            {
              name: "comments",
              type: { name: "Comment", kind: "LIST", ofType: { name: "Comment", kind: "OBJECT" } },
              args: [],
            },
          ],
        },
        {
          name: "UserProfile",
          kind: "OBJECT",
          description: "Extended user profile information",
          fields: [
            { name: "bio", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "website", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "location", type: { name: "String", kind: "SCALAR" }, args: [] },
            {
              name: "socialLinks",
              type: { name: "SocialLinks", kind: "OBJECT" },
              args: [],
            },
            {
              name: "preferences",
              type: { name: "UserPreferences", kind: "OBJECT" },
              args: [],
            },
          ],
        },
        {
          name: "SocialLinks",
          kind: "OBJECT",
          description: "Social media links",
          fields: [
            { name: "twitter", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "github", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "linkedin", type: { name: "String", kind: "SCALAR" }, args: [] },
          ],
        },
        {
          name: "UserPreferences",
          kind: "OBJECT",
          fields: [
            { name: "theme", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "notifications", type: { name: "NotificationSettings", kind: "OBJECT" }, args: [] },
            { name: "privacy", type: { name: "PrivacySettings", kind: "OBJECT" }, args: [] },
          ],
        },
        {
          name: "NotificationSettings",
          kind: "OBJECT",
          fields: [
            { name: "email", type: { name: "Boolean", kind: "SCALAR" }, args: [] },
            { name: "push", type: { name: "Boolean", kind: "SCALAR" }, args: [] },
            { name: "sms", type: { name: "Boolean", kind: "SCALAR" }, args: [] },
          ],
        },
        {
          name: "PrivacySettings",
          kind: "OBJECT",
          fields: [
            { name: "profileVisible", type: { name: "Boolean", kind: "SCALAR" }, args: [] },
            { name: "showEmail", type: { name: "Boolean", kind: "SCALAR" }, args: [] },
          ],
        },
        {
          name: "Post",
          kind: "OBJECT",
          description: "A blog post",
          fields: [
            { name: "id", type: { name: "ID", kind: "SCALAR" }, args: [] },
            { name: "title", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "content", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "published", type: { name: "Boolean", kind: "SCALAR" }, args: [] },
            { name: "createdAt", type: { name: "DateTime", kind: "SCALAR" }, args: [] },
            {
              name: "author",
              type: { name: "User", kind: "OBJECT" },
              args: [],
            },
            {
              name: "comments",
              type: { name: "Comment", kind: "LIST", ofType: { name: "Comment", kind: "OBJECT" } },
              args: [{ name: "first", type: { name: "Int", kind: "SCALAR" } }],
            },
            {
              name: "tags",
              type: { name: "Tag", kind: "LIST", ofType: { name: "Tag", kind: "OBJECT" } },
              args: [],
            },
          ],
        },
        {
          name: "Comment",
          kind: "OBJECT",
          description: "A comment on a post",
          fields: [
            { name: "id", type: { name: "ID", kind: "SCALAR" }, args: [] },
            { name: "content", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "createdAt", type: { name: "DateTime", kind: "SCALAR" }, args: [] },
            {
              name: "author",
              type: { name: "User", kind: "OBJECT" },
              args: [],
            },
            {
              name: "post",
              type: { name: "Post", kind: "OBJECT" },
              args: [],
            },
            {
              name: "replies",
              type: { name: "Comment", kind: "LIST", ofType: { name: "Comment", kind: "OBJECT" } },
              args: [],
            },
          ],
        },
        {
          name: "Tag",
          kind: "OBJECT",
          fields: [
            { name: "id", type: { name: "ID", kind: "SCALAR" }, args: [] },
            { name: "name", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "color", type: { name: "String", kind: "SCALAR" }, args: [] },
          ],
        },
      ],
      queryType: { name: "Query" },
      mutationType: { name: "Mutation" },
    },
  },
  ecommerce: {
    name: "E-commerce Platform",
    description: "Products, orders, customers, inventory",
    schema: {
      types: [
        {
          name: "Query",
          kind: "OBJECT",
          fields: [
            {
              name: "product",
              type: { name: "Product", kind: "OBJECT" },
              args: [
                { name: "id", type: { name: "ID", kind: "SCALAR" } },
                { name: "sku", type: { name: "String", kind: "SCALAR" } },
              ],
            },
            {
              name: "products",
              type: { name: "Product", kind: "LIST", ofType: { name: "Product", kind: "OBJECT" } },
              args: [
                { name: "category", type: { name: "String", kind: "SCALAR" } },
                { name: "inStock", type: { name: "Boolean", kind: "SCALAR" } },
                { name: "priceRange", type: { name: "PriceRange", kind: "INPUT_OBJECT" } },
              ],
            },
            {
              name: "order",
              type: { name: "Order", kind: "OBJECT" },
              args: [{ name: "id", type: { name: "ID", kind: "SCALAR" } }],
            },
          ],
        },
        {
          name: "Product",
          kind: "OBJECT",
          fields: [
            { name: "id", type: { name: "ID", kind: "SCALAR" }, args: [] },
            { name: "name", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "description", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "price", type: { name: "Money", kind: "OBJECT" }, args: [] },
            { name: "category", type: { name: "Category", kind: "OBJECT" }, args: [] },
            { name: "inventory", type: { name: "Inventory", kind: "OBJECT" }, args: [] },
            {
              name: "reviews",
              type: { name: "Review", kind: "LIST", ofType: { name: "Review", kind: "OBJECT" } },
              args: [],
            },
          ],
        },
        {
          name: "Money",
          kind: "OBJECT",
          fields: [
            { name: "amount", type: { name: "Float", kind: "SCALAR" }, args: [] },
            { name: "currency", type: { name: "String", kind: "SCALAR" }, args: [] },
          ],
        },
        {
          name: "Category",
          kind: "OBJECT",
          fields: [
            { name: "id", type: { name: "ID", kind: "SCALAR" }, args: [] },
            { name: "name", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "parent", type: { name: "Category", kind: "OBJECT" }, args: [] },
            {
              name: "children",
              type: { name: "Category", kind: "LIST", ofType: { name: "Category", kind: "OBJECT" } },
              args: [],
            },
          ],
        },
        {
          name: "Inventory",
          kind: "OBJECT",
          fields: [
            { name: "quantity", type: { name: "Int", kind: "SCALAR" }, args: [] },
            { name: "reserved", type: { name: "Int", kind: "SCALAR" }, args: [] },
            { name: "warehouse", type: { name: "Warehouse", kind: "OBJECT" }, args: [] },
          ],
        },
        {
          name: "Warehouse",
          kind: "OBJECT",
          fields: [
            { name: "id", type: { name: "ID", kind: "SCALAR" }, args: [] },
            { name: "name", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "location", type: { name: "Address", kind: "OBJECT" }, args: [] },
          ],
        },
        {
          name: "Address",
          kind: "OBJECT",
          fields: [
            { name: "street", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "city", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "country", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "coordinates", type: { name: "Coordinates", kind: "OBJECT" }, args: [] },
          ],
        },
        {
          name: "Coordinates",
          kind: "OBJECT",
          fields: [
            { name: "lat", type: { name: "Float", kind: "SCALAR" }, args: [] },
            { name: "lng", type: { name: "Float", kind: "SCALAR" }, args: [] },
          ],
        },
        {
          name: "Order",
          kind: "OBJECT",
          fields: [
            { name: "id", type: { name: "ID", kind: "SCALAR" }, args: [] },
            { name: "customer", type: { name: "Customer", kind: "OBJECT" }, args: [] },
            {
              name: "items",
              type: { name: "OrderItem", kind: "LIST", ofType: { name: "OrderItem", kind: "OBJECT" } },
              args: [],
            },
            { name: "total", type: { name: "Money", kind: "OBJECT" }, args: [] },
            { name: "status", type: { name: "OrderStatus", kind: "ENUM" }, args: [] },
          ],
        },
        {
          name: "Customer",
          kind: "OBJECT",
          fields: [
            { name: "id", type: { name: "ID", kind: "SCALAR" }, args: [] },
            { name: "email", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "profile", type: { name: "CustomerProfile", kind: "OBJECT" }, args: [] },
            {
              name: "orders",
              type: { name: "Order", kind: "LIST", ofType: { name: "Order", kind: "OBJECT" } },
              args: [],
            },
          ],
        },
        {
          name: "CustomerProfile",
          kind: "OBJECT",
          fields: [
            { name: "firstName", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "lastName", type: { name: "String", kind: "SCALAR" }, args: [] },
            {
              name: "addresses",
              type: { name: "Address", kind: "LIST", ofType: { name: "Address", kind: "OBJECT" } },
              args: [],
            },
          ],
        },
        {
          name: "OrderItem",
          kind: "OBJECT",
          fields: [
            { name: "product", type: { name: "Product", kind: "OBJECT" }, args: [] },
            { name: "quantity", type: { name: "Int", kind: "SCALAR" }, args: [] },
            { name: "price", type: { name: "Money", kind: "OBJECT" }, args: [] },
          ],
        },
        {
          name: "Review",
          kind: "OBJECT",
          fields: [
            { name: "id", type: { name: "ID", kind: "SCALAR" }, args: [] },
            { name: "rating", type: { name: "Int", kind: "SCALAR" }, args: [] },
            { name: "comment", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "author", type: { name: "Customer", kind: "OBJECT" }, args: [] },
          ],
        },
      ],
      queryType: { name: "Query" },
      mutationType: { name: "Mutation" },
    },
  },
  github: {
    name: "GitHub API Style",
    description: "Repositories, users, issues, pull requests",
    schema: {
      types: [
        {
          name: "Query",
          kind: "OBJECT",
          fields: [
            {
              name: "repository",
              type: { name: "Repository", kind: "OBJECT" },
              args: [
                { name: "owner", type: { name: "String", kind: "SCALAR" } },
                { name: "name", type: { name: "String", kind: "SCALAR" } },
              ],
            },
            {
              name: "user",
              type: { name: "User", kind: "OBJECT" },
              args: [{ name: "login", type: { name: "String", kind: "SCALAR" } }],
            },
          ],
        },
        {
          name: "Repository",
          kind: "OBJECT",
          fields: [
            { name: "id", type: { name: "ID", kind: "SCALAR" }, args: [] },
            { name: "name", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "description", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "owner", type: { name: "User", kind: "OBJECT" }, args: [] },
            {
              name: "stargazers",
              type: { name: "StargazerConnection", kind: "OBJECT" },
              args: [
                { name: "first", type: { name: "Int", kind: "SCALAR" } },
                { name: "after", type: { name: "String", kind: "SCALAR" } },
              ],
            },
            {
              name: "issues",
              type: { name: "IssueConnection", kind: "OBJECT" },
              args: [
                { name: "first", type: { name: "Int", kind: "SCALAR" } },
                {
                  name: "states",
                  type: { name: "IssueState", kind: "LIST", ofType: { name: "IssueState", kind: "ENUM" } },
                },
              ],
            },
          ],
        },
        {
          name: "User",
          kind: "OBJECT",
          fields: [
            { name: "id", type: { name: "ID", kind: "SCALAR" }, args: [] },
            { name: "login", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "name", type: { name: "String", kind: "SCALAR" }, args: [] },
            {
              name: "repositories",
              type: { name: "RepositoryConnection", kind: "OBJECT" },
              args: [
                { name: "first", type: { name: "Int", kind: "SCALAR" } },
                { name: "orderBy", type: { name: "RepositoryOrder", kind: "INPUT_OBJECT" } },
              ],
            },
            { name: "followers", type: { name: "FollowerConnection", kind: "OBJECT" }, args: [] },
          ],
        },
        {
          name: "StargazerConnection",
          kind: "OBJECT",
          fields: [
            { name: "totalCount", type: { name: "Int", kind: "SCALAR" }, args: [] },
            {
              name: "edges",
              type: { name: "StargazerEdge", kind: "LIST", ofType: { name: "StargazerEdge", kind: "OBJECT" } },
              args: [],
            },
            { name: "pageInfo", type: { name: "PageInfo", kind: "OBJECT" }, args: [] },
          ],
        },
        {
          name: "StargazerEdge",
          kind: "OBJECT",
          fields: [
            { name: "node", type: { name: "User", kind: "OBJECT" }, args: [] },
            { name: "starredAt", type: { name: "DateTime", kind: "SCALAR" }, args: [] },
          ],
        },
        {
          name: "PageInfo",
          kind: "OBJECT",
          fields: [
            { name: "hasNextPage", type: { name: "Boolean", kind: "SCALAR" }, args: [] },
            { name: "hasPreviousPage", type: { name: "Boolean", kind: "SCALAR" }, args: [] },
            { name: "startCursor", type: { name: "String", kind: "SCALAR" }, args: [] },
            { name: "endCursor", type: { name: "String", kind: "SCALAR" }, args: [] },
          ],
        },
      ],
      queryType: { name: "Query" },
      mutationType: { name: "Mutation" },
    },
  },
}

function createGraphQLStore() {
  const initialState = {
    endpoint: "https://countries.trevorblades.com/",
    query: `query GetCountries($first: Int) {
  countries(first: $first) {
    code
    name
    emoji
    currency
  }
}`,
    variables: '{\n  "first": 5\n}',
    results: null,
    schema: null,
    loading: false,
    error: null,
    queryStructure: {
      operations: [
        {
          type: "query",
          name: "MyQuery",
          fields: [], // Start with no fields
          variables: [],
        },
      ],
      activeOperationIndex: 0,
    },
    currentSchemaKey: null,
    availableSchemas: DEMO_SCHEMAS,
  }

  const { subscribe, set, update } = writable(initialState)
  const store = { subscribe, set, update }

  return {
    subscribe,
    set,
    update,

    isValidField: (typeName, fieldName) => {
      console.log("[v0] graphql-store: Validating field:", typeName, fieldName)
      const currentState = get(store)
      if (!currentState.schema) return true // Allow if no schema loaded

      const type = currentState.schema.types.find((t) => t.name === typeName)
      if (!type || !type.fields) return false

      return type.fields.some((f) => f.name === fieldName)
    },

    isValidArgument: (typeName, fieldName, argName) => {
      console.log("[v0] graphql-store: Validating argument:", typeName, fieldName, argName)
      const currentState = get(store)
      if (!currentState.schema) return true // Allow if no schema loaded

      const type = currentState.schema.types.find((t) => t.name === typeName)
      if (!type || !type.fields) return false

      const field = type.fields.find((f) => f.name === fieldName)
      if (!field || !field.args) return false

      return field.args.some((a) => a.name === argName)
    },

    getValidFieldsForType: (typeName) => {
      console.log("[v0] graphql-store: Getting valid fields for type:", typeName)
      const currentState = get(store)
      if (!currentState.schema) return []

      const type = currentState.schema.types.find((t) => t.name === typeName)
      return type ? type.fields || [] : []
    },

    getValidArgsForField: (typeName, fieldName) => {
      console.log("[v0] graphql-store: Getting valid args for field:", typeName, fieldName)
      const currentState = get(store)
      if (!currentState.schema) return []

      const type = currentState.schema.types.find((t) => t.name === typeName)
      if (!type || !type.fields) return []

      const field = type.fields.find((f) => f.name === fieldName)
      return field ? field.args || [] : []
    },

    addOperation: (operationType = "query") => {
      console.log("[v0] graphql-store: Adding new operation:", operationType)
      update((state) => {
        const newOperation = {
          type: operationType,
          name: `My${operationType.charAt(0).toUpperCase() + operationType.slice(1)}`,
          fields: [],
          variables: [],
        }

        const newOperations = [...state.queryStructure.operations, newOperation]
        const newStructure = {
          ...state.queryStructure,
          operations: newOperations,
          activeOperationIndex: newOperations.length - 1,
        }

        return {
          ...state,
          queryStructure: newStructure,
          query: buildQueryFromStructure(newStructure),
        }
      })
    },

    removeOperation: (index) => {
      console.log("[v0] graphql-store: Removing operation at index:", index)
      update((state) => {
        const newOperations = state.queryStructure.operations.filter((_, i) => i !== index)
        if (newOperations.length === 0) {
          // Always keep at least one operation
          newOperations.push({
            type: "query",
            name: "MyQuery",
            fields: [],
            variables: [],
          })
        }

        const newActiveIndex = Math.min(state.queryStructure.activeOperationIndex, newOperations.length - 1)
        const newStructure = {
          ...state.queryStructure,
          operations: newOperations,
          activeOperationIndex: newActiveIndex,
        }

        return {
          ...state,
          queryStructure: newStructure,
          query: buildQueryFromStructure(newStructure),
        }
      })
    },

    setActiveOperation: (index) => {
      console.log("[v0] graphql-store: Setting active operation:", index)
      update((state) => ({
        ...state,
        queryStructure: {
          ...state.queryStructure,
          activeOperationIndex: index,
        },
      }))
    },

    getCurrentOperation: () => {
      const currentState = get(store)
      return currentState.queryStructure.operations[currentState.queryStructure.activeOperationIndex]
    },

    updateQueryStructure: (newStructure) => {
      console.log("[v0] graphql-store: Updating query structure:", newStructure)
      update((state) => {
        const newQuery = buildQueryFromStructure(newStructure)
        console.log("[v0] graphql-store: Built query from structure:", newQuery)
        return {
          ...state,
          queryStructure: newStructure,
          query: newQuery,
        }
      })
    },

    updateCurrentOperation: (updatedOperation) => {
      console.log("[v0] graphql-store: Updating current operation:", updatedOperation)
      update((state) => {
        const newOperations = [...state.queryStructure.operations]
        newOperations[state.queryStructure.activeOperationIndex] = updatedOperation

        const newStructure = {
          ...state.queryStructure,
          operations: newOperations,
        }

        return {
          ...state,
          queryStructure: newStructure,
          query: buildQueryFromStructure(newStructure),
        }
      })
    },

    loadDemoSchema: (schemaKey = "blog") => {
      console.log("[v0] graphql-store: Loading demo schema:", schemaKey)
      const selectedSchema = DEMO_SCHEMAS[schemaKey]
      if (selectedSchema) {
        update((state) => ({
          ...state,
          schema: selectedSchema.schema,
          currentSchemaKey: schemaKey,
          endpoint: `demo://${schemaKey}`,
        }))
      }
    },

    addFieldToQuery: (fieldPath, fieldName, args = []) => {
      console.log("[v0] graphql-store: Adding field to query:", { fieldPath, fieldName, args })

      update((state) => {
        const newStructure = { ...state.queryStructure }

        if (fieldPath.length === 0) {
          // Adding to root level
          const existingField = newStructure.operations[newStructure.activeOperationIndex].fields.find(
            (f) => f.name === fieldName,
          )
          if (!existingField) {
            newStructure.operations[newStructure.activeOperationIndex].fields.push({
              name: fieldName,
              args: args,
              fields: [],
            })
          }
        } else {
          // Adding to nested level
          const addToNestedField = (fields, path, depth = 0) => {
            if (depth >= path.length) return

            const currentFieldName = path[depth]
            let field = fields.find((f) => f.name === currentFieldName)

            if (!field) {
              field = { name: currentFieldName, args: [], fields: [] }
              fields.push(field)
            }

            if (depth === path.length - 1) {
              // Add the new field here
              if (!field.fields.find((f) => f.name === fieldName)) {
                field.fields.push({
                  name: fieldName,
                  args: args,
                  fields: [],
                })
              }
            } else {
              // Continue deeper
              addToNestedField(field.fields, path, depth + 1)
            }
          }

          addToNestedField(newStructure.operations[newStructure.activeOperationIndex].fields, fieldPath)
        }

        const newQuery = buildQueryFromStructure(newStructure)
        console.log("[v0] graphql-store: Updated query after adding field:", newQuery)

        return {
          ...state,
          queryStructure: newStructure,
          query: newQuery,
        }
      })
    },

    removeFieldFromQuery: (fieldPath, fieldName) => {
      console.log("[v0] graphql-store: Removing field from query:", { fieldPath, fieldName })

      update((state) => {
        const newStructure = { ...state.queryStructure }

        if (fieldPath.length === 0) {
          // Removing from root level
          newStructure.operations[newStructure.activeOperationIndex].fields = newStructure.operations[
            newStructure.activeOperationIndex
          ].fields.filter((f) => f.name !== fieldName)
        } else {
          // Removing from nested level
          const removeFromNestedField = (fields, path, depth = 0) => {
            if (depth >= path.length) return

            const currentFieldName = path[depth]
            const field = fields.find((f) => f.name === currentFieldName)

            if (field) {
              if (depth === path.length - 1) {
                // Remove the field here
                field.fields = field.fields.filter((f) => f.name !== fieldName)
              } else {
                // Continue deeper
                removeFromNestedField(field.fields, path, depth + 1)
              }
            }
          }

          removeFromNestedField(newStructure.operations[newStructure.activeOperationIndex].fields, fieldPath)
        }

        const newQuery = buildQueryFromStructure(newStructure)
        console.log("[v0] graphql-store: Updated query after removing field:", newQuery)

        return {
          ...state,
          queryStructure: newStructure,
          query: newQuery,
        }
      })
    },

    updateQuery: (newQuery) => {
      console.log("[v0] graphql-store: Updating query:", newQuery)
      update((state) => {
        const newState = { ...state, query: newQuery }
        newState.queryStructure = parseQuery(newQuery)
        console.log("[v0] graphql-store: Parsed query structure:", newState.queryStructure)
        return newState
      })
    },

    updateVariables: (newVariables) => {
      console.log("[v0] graphql-store: Updating variables:", newVariables)
      update((state) => ({ ...state, variables: newVariables }))
    },

    executeQuery: async () => {
      console.log("[v0] graphql-store: Executing GraphQL query")
      update((state) => ({ ...state, loading: true, error: null }))

      try {
        const currentState = store.subscribe((v) => v)()
        const variables = currentState.variables ? JSON.parse(currentState.variables) : {}

        console.log("[v0] graphql-store: Sending request to:", currentState.endpoint)
        console.log("[v0] graphql-store: Query:", currentState.query)
        console.log("[v0] graphql-store: Variables:", variables)

        const response = await fetch(currentState.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: currentState.query,
            variables: variables,
          }),
        })

        const result = await response.json()
        console.log("[v0] graphql-store: Query result:", result)

        update((state) => ({
          ...state,
          results: result,
          loading: false,
        }))
      } catch (error) {
        console.error("[v0] graphql-store: Query execution error:", error)
        update((state) => ({
          ...state,
          error: error.message,
          loading: false,
        }))
      }
    },

    introspectSchema: async () => {
      console.log("[v0] graphql-store: Starting schema introspection")
      update((state) => ({ ...state, loading: true }))

      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            types {
              name
              kind
              description
              fields {
                name
                type {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
                args {
                  name
                  type {
                    name
                    kind
                    ofType {
                      name
                      kind
                    }
                  }
                }
              }
            }
            queryType {
              name
            }
            mutationType {
              name
            }
          }
        }
      `

      try {
        const currentState = store.subscribe((v) => v)()
        const response = await fetch(currentState.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: introspectionQuery }),
        })

        const result = await response.json()
        console.log("[v0] graphql-store: Schema introspection result:", result)

        update((state) => ({
          ...state,
          schema: result.data.__schema,
          loading: false,
        }))
      } catch (error) {
        console.error("[v0] graphql-store: Schema introspection error:", error)
        update((state) => ({
          ...state,
          error: error.message,
          loading: false,
        }))
      }
    },

    getFieldsForType: (typeName) => {
      console.log("[v0] graphql-store: Getting fields for type:", typeName)
      const currentState = get(store)
      if (!currentState.schema) return []

      const type = currentState.schema.types.find((t) => t.name === typeName)
      return type ? type.fields || [] : []
    },

    getArgsForField: (typeName, fieldName) => {
      console.log("[v0] graphql-store: Getting args for field:", typeName, fieldName)
      const currentState = get(store)
      if (!currentState.schema) return []

      const type = currentState.schema.types.find((t) => t.name === typeName)
      if (!type) return []

      const field = type.fields?.find((f) => f.name === fieldName)
      return field ? field.args || [] : []
    },

    getRootQueryFields: () => {
      console.log("[v0] graphql-store: Getting root query fields")
      const currentState = get(store)
      if (!currentState.schema) return []

      const queryType = currentState.schema.types.find((t) => t.name === "Query")
      return queryType ? queryType.fields || [] : []
    },

    getFieldReturnType: (typeName, fieldName) => {
      console.log("[v0] graphql-store: Getting return type for field:", typeName, fieldName)
      const currentState = get(store)
      if (!currentState.schema) return null

      const type = currentState.schema.types.find((t) => t.name === typeName)
      if (!type) return null

      const field = type.fields?.find((f) => f.name === fieldName)
      if (!field) return null

      // Handle list types and non-null types
      let returnType = field.type
      if (returnType.kind === "LIST" && returnType.ofType) {
        returnType = returnType.ofType
      }
      if (returnType.kind === "NON_NULL" && returnType.ofType) {
        returnType = returnType.ofType
      }

      return returnType.name
    },

    getAvailableFieldsForPath: (fieldPath) => {
      console.log("[v0] graphql-store: Getting available fields for path:", fieldPath)
      const currentState = get(store)
      if (!currentState.schema) return []

      let currentTypeName = "Query" // Start with root query type

      // Walk through the field path to determine the current type
      for (const pathSegment of fieldPath) {
        const returnType = store.getFieldReturnType(currentTypeName, pathSegment)
        if (!returnType) return []
        currentTypeName = returnType
      }

      return store.getFieldsForType(currentTypeName)
    },
  }
}

// Helper function to get current store value
function get(store) {
  let value
  const unsubscribe = store.subscribe((v) => (value = v))
  unsubscribe()
  return value
}

// Parse GraphQL query string into structure
function parseQuery(queryString) {
  console.log("[v0] graphql-store: Parsing query string:", queryString)

  try {
    // Simple regex-based parser for demo purposes
    const operationMatch = queryString.match(/(query|mutation|subscription)\s+(\w+)?\s*($$[^)]*$$)?\s*{/)
    const operation = operationMatch ? operationMatch[1] : "query"
    const name = operationMatch ? operationMatch[2] || "UnnamedOperation" : "UnnamedOperation"

    // Extract variables
    const variablesMatch = queryString.match(/$$([^)]*)$$/)
    const variables = []
    if (variablesMatch) {
      const varsString = variablesMatch[1]
      const varMatches = varsString.matchAll(/\$(\w+):\s*(\w+!?)/g)
      for (const match of varMatches) {
        variables.push({
          name: match[1],
          type: match[2],
          defaultValue: null,
        })
      }
    }

    // Extract fields (simplified)
    const fieldsMatch = queryString.match(/{([^}]+)}/)
    const fields = []
    if (fieldsMatch) {
      const fieldsString = fieldsMatch[1]
      // This is a very simplified field parser
      const fieldLines = fieldsString
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line)

      for (const line of fieldLines) {
        if (line.includes("(")) {
          // Field with arguments
          const fieldMatch = line.match(/(\w+)\s*$$([^)]*)$$\s*{?([^}]*)}?/)
          if (fieldMatch) {
            const fieldName = fieldMatch[1]
            const argsString = fieldMatch[2]
            const subFields = fieldMatch[3] ? fieldMatch[3].split(/\s+/).filter((f) => f) : []

            const args = []
            if (argsString) {
              const argMatches = argsString.matchAll(/(\w+):\s*([^,\s]+)/g)
              for (const argMatch of argMatches) {
                args.push({
                  name: argMatch[1],
                  value: argMatch[2],
                  type: "String", // Simplified
                })
              }
            }

            fields.push({
              name: fieldName,
              args: args,
              fields: subFields,
            })
          }
        } else if (!line.includes("}") && line.length > 0) {
          // Simple field
          fields.push({
            name: line,
            args: [],
            fields: [],
          })
        }
      }
    }

    const structure = {
      operations: [
        {
          type: operation,
          name: name,
          variables: variables,
          fields: fields,
        },
      ],
      activeOperationIndex: 0,
    }

    console.log("[v0] graphql-store: Parsed structure:", structure)
    return structure
  } catch (error) {
    console.error("[v0] graphql-store: Query parsing error:", error)
    return {
      operations: [
        {
          type: "query",
          name: "ParseError",
          variables: [],
          fields: [],
        },
      ],
      activeOperationIndex: 0,
    }
  }
}

// Build GraphQL query from structure
function buildQueryFromStructure(structure) {
  console.log("[v0] graphql-store: Building query from structure:", structure)

  if (!structure.operations || structure.operations.length === 0) {
    return "query { }"
  }

  let fullQuery = ""

  for (let i = 0; i < structure.operations.length; i++) {
    const operation = structure.operations[i]
    let query = operation.type

    if (operation.name) {
      query += ` ${operation.name}`
    }

    if (operation.variables && operation.variables.length > 0) {
      const varsString = operation.variables.map((v) => `$${v.name}: ${v.type}`).join(", ")
      query += `(${varsString})`
    }

    query += " {\n"

    const buildFields = (fields, indent = "  ") => {
      let result = ""
      for (const field of fields) {
        result += `${indent}${field.name}`

        if (field.args && field.args.length > 0) {
          const argsString = field.args.map((arg) => `${arg.name}: ${arg.value}`).join(", ")
          result += `(${argsString})`
        }

        if (field.fields && field.fields.length > 0) {
          result += " {\n"
          result += buildFields(field.fields, indent + "  ")
          result += `${indent}}`
        }

        result += "\n"
      }
      return result
    }

    query += buildFields(operation.fields)
    query += "}"

    if (i < structure.operations.length - 1) {
      query += "\n\n"
    }

    fullQuery += query
  }

  console.log("[v0] graphql-store: Built query:", fullQuery)
  return fullQuery
}

export const graphqlStore = createGraphQLStore()
