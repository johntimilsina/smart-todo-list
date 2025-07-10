import { gql } from "graphql-tag"

export const typeDefs = gql`
  type Todo {
    id: Int!
    text: String!
    completed: Boolean!
    createdAt: String!
    suggestion: [String]
    order: Int!
    userId: String!
  }

  type FeatureUsage {
    id: Int!
    userId: String!
    feature: String!
    usedAt: String!
  }

  type Query {
    todos(userId: String!): [Todo!]!
    featureUsage(userId: String!): [FeatureUsage!]!
  }

  type Mutation {
    addTodo(text: String!, userId: String!): Todo!
    deleteTodo(id: Int!, userId: String!): Boolean!
    toggleTodo(id: Int!, userId: String!): Todo!
    addSuggestion(id: Int!, suggestion: [String!]!, userId: String!): Todo!
    reorderTodos(todoIds: [Int!]!, userId: String!): [Todo!]!
    recordFeatureUsage(userId: String!, feature: String!): FeatureUsage!
  }
`
