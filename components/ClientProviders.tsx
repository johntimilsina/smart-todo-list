"use client"

import { ApolloProvider } from "@apollo/client"
import { client } from "@/lib/apollo-client"
import { AuthProvider } from "@/components/AuthProvider"

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </AuthProvider>
  )
}
