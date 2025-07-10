"use client"

import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

export function UserNav() {
  // This is a placeholder for authentication logic.
  // TODO: check if the user is logged in.
  //const isLoggedIn = false

  return (
    <Button variant="outline" size="sm">
      <LogIn className="mr-2 h-4 w-4" />
      Login
    </Button>
  )
}
