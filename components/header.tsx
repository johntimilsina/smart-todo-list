"use client"

import Link from "next/link"
import Image from "next/image"
import { Github } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="ml-10 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-1">
            <Image
              src={"/logo.png"}
              alt="logo"
              width={42}
              height={42}
              unoptimized
              className="transition-filter dark:invert dark:white-200"
            />
            {/* <span className="hidden font-bold sm:inline-block">Smart Todo</span> */}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href="https://github.com/johntimilsina/smart-todo-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
