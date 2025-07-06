import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Mutation = {
  __typename?: 'Mutation';
  addSuggestion: Todo;
  addTodo: Todo;
  deleteTodo: Scalars['Boolean']['output'];
  reorderTodos: Array<Todo>;
  toggleTodo: Todo;
};


export type MutationAddSuggestionArgs = {
  id: Scalars['Int']['input'];
  suggestion: Array<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationAddTodoArgs = {
  text: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationDeleteTodoArgs = {
  id: Scalars['Int']['input'];
  userId: Scalars['String']['input'];
};


export type MutationReorderTodosArgs = {
  todoIds: Array<Scalars['Int']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationToggleTodoArgs = {
  id: Scalars['Int']['input'];
  userId: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  todos: Array<Todo>;
};

export type Todo = {
  __typename?: 'Todo';
  completed: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  order: Scalars['Int']['output'];
  suggestion?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  text: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type AddSuggestionMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  suggestion: Array<Scalars['String']['input']> | Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type AddSuggestionMutation = { __typename?: 'Mutation', addSuggestion: { __typename?: 'Todo', id: number, suggestion?: Array<string | null> | null } };

export type AddTodoMutationVariables = Exact<{
  text: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type AddTodoMutation = { __typename?: 'Mutation', addTodo: { __typename?: 'Todo', id: number, text: string, completed: boolean, order: number, suggestion?: Array<string | null> | null } };

export type DeleteTodoMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  userId: Scalars['String']['input'];
}>;


export type DeleteTodoMutation = { __typename?: 'Mutation', deleteTodo: boolean };

export type ReorderTodosMutationVariables = Exact<{
  todoIds: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
  userId: Scalars['String']['input'];
}>;


export type ReorderTodosMutation = { __typename?: 'Mutation', reorderTodos: Array<{ __typename?: 'Todo', id: number, text: string, completed: boolean, order: number, suggestion?: Array<string | null> | null, createdAt: string }> };

export type ToggleTodoMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  userId: Scalars['String']['input'];
}>;


export type ToggleTodoMutation = { __typename?: 'Mutation', toggleTodo: { __typename?: 'Todo', id: number, completed: boolean } };

export type GetTodosQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTodosQuery = { __typename?: 'Query', todos: Array<{ __typename?: 'Todo', id: number, text: string, completed: boolean, suggestion?: Array<string | null> | null, order: number, userId: string }> };


export const AddSuggestionDocument = gql`
    mutation addSuggestion($id: Int!, $suggestion: [String!]!, $userId: String!) {
  addSuggestion(id: $id, suggestion: $suggestion, userId: $userId) {
    id
    suggestion
  }
}
    `;
export type AddSuggestionMutationFn = Apollo.MutationFunction<AddSuggestionMutation, AddSuggestionMutationVariables>;

/**
 * __useAddSuggestionMutation__
 *
 * To run a mutation, you first call `useAddSuggestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddSuggestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addSuggestionMutation, { data, loading, error }] = useAddSuggestionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      suggestion: // value for 'suggestion'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useAddSuggestionMutation(baseOptions?: Apollo.MutationHookOptions<AddSuggestionMutation, AddSuggestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddSuggestionMutation, AddSuggestionMutationVariables>(AddSuggestionDocument, options);
      }
export type AddSuggestionMutationHookResult = ReturnType<typeof useAddSuggestionMutation>;
export type AddSuggestionMutationResult = Apollo.MutationResult<AddSuggestionMutation>;
export type AddSuggestionMutationOptions = Apollo.BaseMutationOptions<AddSuggestionMutation, AddSuggestionMutationVariables>;
export const AddTodoDocument = gql`
    mutation addTodo($text: String!, $userId: String!) {
  addTodo(text: $text, userId: $userId) {
    id
    text
    completed
    order
    suggestion
  }
}
    `;
export type AddTodoMutationFn = Apollo.MutationFunction<AddTodoMutation, AddTodoMutationVariables>;

/**
 * __useAddTodoMutation__
 *
 * To run a mutation, you first call `useAddTodoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTodoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTodoMutation, { data, loading, error }] = useAddTodoMutation({
 *   variables: {
 *      text: // value for 'text'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useAddTodoMutation(baseOptions?: Apollo.MutationHookOptions<AddTodoMutation, AddTodoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTodoMutation, AddTodoMutationVariables>(AddTodoDocument, options);
      }
export type AddTodoMutationHookResult = ReturnType<typeof useAddTodoMutation>;
export type AddTodoMutationResult = Apollo.MutationResult<AddTodoMutation>;
export type AddTodoMutationOptions = Apollo.BaseMutationOptions<AddTodoMutation, AddTodoMutationVariables>;
export const DeleteTodoDocument = gql`
    mutation deleteTodo($id: Int!, $userId: String!) {
  deleteTodo(id: $id, userId: $userId)
}
    `;
export type DeleteTodoMutationFn = Apollo.MutationFunction<DeleteTodoMutation, DeleteTodoMutationVariables>;

/**
 * __useDeleteTodoMutation__
 *
 * To run a mutation, you first call `useDeleteTodoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTodoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTodoMutation, { data, loading, error }] = useDeleteTodoMutation({
 *   variables: {
 *      id: // value for 'id'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useDeleteTodoMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTodoMutation, DeleteTodoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTodoMutation, DeleteTodoMutationVariables>(DeleteTodoDocument, options);
      }
export type DeleteTodoMutationHookResult = ReturnType<typeof useDeleteTodoMutation>;
export type DeleteTodoMutationResult = Apollo.MutationResult<DeleteTodoMutation>;
export type DeleteTodoMutationOptions = Apollo.BaseMutationOptions<DeleteTodoMutation, DeleteTodoMutationVariables>;
export const ReorderTodosDocument = gql`
    mutation ReorderTodos($todoIds: [Int!]!, $userId: String!) {
  reorderTodos(todoIds: $todoIds, userId: $userId) {
    id
    text
    completed
    order
    suggestion
    createdAt
  }
}
    `;
export type ReorderTodosMutationFn = Apollo.MutationFunction<ReorderTodosMutation, ReorderTodosMutationVariables>;

/**
 * __useReorderTodosMutation__
 *
 * To run a mutation, you first call `useReorderTodosMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReorderTodosMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reorderTodosMutation, { data, loading, error }] = useReorderTodosMutation({
 *   variables: {
 *      todoIds: // value for 'todoIds'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useReorderTodosMutation(baseOptions?: Apollo.MutationHookOptions<ReorderTodosMutation, ReorderTodosMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReorderTodosMutation, ReorderTodosMutationVariables>(ReorderTodosDocument, options);
      }
export type ReorderTodosMutationHookResult = ReturnType<typeof useReorderTodosMutation>;
export type ReorderTodosMutationResult = Apollo.MutationResult<ReorderTodosMutation>;
export type ReorderTodosMutationOptions = Apollo.BaseMutationOptions<ReorderTodosMutation, ReorderTodosMutationVariables>;
export const ToggleTodoDocument = gql`
    mutation toggleTodo($id: Int!, $userId: String!) {
  toggleTodo(id: $id, userId: $userId) {
    id
    completed
  }
}
    `;
export type ToggleTodoMutationFn = Apollo.MutationFunction<ToggleTodoMutation, ToggleTodoMutationVariables>;

/**
 * __useToggleTodoMutation__
 *
 * To run a mutation, you first call `useToggleTodoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleTodoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleTodoMutation, { data, loading, error }] = useToggleTodoMutation({
 *   variables: {
 *      id: // value for 'id'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useToggleTodoMutation(baseOptions?: Apollo.MutationHookOptions<ToggleTodoMutation, ToggleTodoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ToggleTodoMutation, ToggleTodoMutationVariables>(ToggleTodoDocument, options);
      }
export type ToggleTodoMutationHookResult = ReturnType<typeof useToggleTodoMutation>;
export type ToggleTodoMutationResult = Apollo.MutationResult<ToggleTodoMutation>;
export type ToggleTodoMutationOptions = Apollo.BaseMutationOptions<ToggleTodoMutation, ToggleTodoMutationVariables>;
export const GetTodosDocument = gql`
    query getTodos {
  todos {
    id
    text
    completed
    suggestion
    order
    userId
  }
}
    `;

/**
 * __useGetTodosQuery__
 *
 * To run a query within a React component, call `useGetTodosQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTodosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTodosQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTodosQuery(baseOptions?: Apollo.QueryHookOptions<GetTodosQuery, GetTodosQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTodosQuery, GetTodosQueryVariables>(GetTodosDocument, options);
      }
export function useGetTodosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTodosQuery, GetTodosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTodosQuery, GetTodosQueryVariables>(GetTodosDocument, options);
        }
export function useGetTodosSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTodosQuery, GetTodosQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTodosQuery, GetTodosQueryVariables>(GetTodosDocument, options);
        }
export type GetTodosQueryHookResult = ReturnType<typeof useGetTodosQuery>;
export type GetTodosLazyQueryHookResult = ReturnType<typeof useGetTodosLazyQuery>;
export type GetTodosSuspenseQueryHookResult = ReturnType<typeof useGetTodosSuspenseQuery>;
export type GetTodosQueryResult = Apollo.QueryResult<GetTodosQuery, GetTodosQueryVariables>;