import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

interface AuthContextType {
  user: { id: string; is_anonymous: boolean | undefined } | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{
    id: string
    is_anonymous: boolean | undefined
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      setLoading(true)
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        const { data: anonData } = await supabase.auth.signInAnonymously()
        setUser(
          anonData?.user
            ? { id: anonData.user.id, is_anonymous: anonData.user.is_anonymous }
            : null
        )
      } else {
        setUser({ id: data.user.id, is_anonymous: data.user.is_anonymous })
      }
      setLoading(false)
    }
    getUser()
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(
          session?.user
            ? { id: session.user.id, is_anonymous: session.user.is_anonymous }
            : null
        )
      }
    )
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useSupabaseUser = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useSupabaseUser must be used within AuthProvider")
  return ctx
}
