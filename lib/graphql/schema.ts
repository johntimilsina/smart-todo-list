import { gql } from "graphql-tag"

export const typeDefs = gql`
  type Todo {
    id: Int!
    text: String!
    completed: Boolean!
    createdAt: String!
    suggestion: [String]
  }

  type Query {
    todos: [Todo!]!
  }

  type Mutation {
    addTodo(text: String!): Todo!
    deleteTodo(id: Int!): Boolean!
    toggleTodo(id: Int!): Todo!
    addSuggestion(id: Int!, suggestion: [String]!): Todo!
  }
`
