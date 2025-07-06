import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

interface AuthContextType {
  user: { id: string } | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      setLoading(true)
      let { data } = await supabase.auth.getUser()
      if (!data?.user) {
        const { data: anonData } = await supabase.auth.signInAnonymously()
        setUser(anonData?.user ? { id: anonData.user.id } : null)
      } else {
        setUser({ id: data.user.id })
      }
      setLoading(false)
    }
    getUser()
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? { id: session.user.id } : null)
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
