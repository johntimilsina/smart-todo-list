"use client"

import { useState } from "react"
import {
  DumbbellIcon as BicepsFlexed,
  Loader2,
  Sparkles,
  Heart,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SimpleSelect } from "@/components/ui/simple-select"

interface PepTalkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todos: Array<{ id: number; text: string }>
}

export function PepTalkDialog({
  open,
  onOpenChange,
  todos,
}: PepTalkDialogProps) {
  const [selectedTodoId, setSelectedTodoId] = useState<string | number | null>(
    null
  )
  const [pepTalkLoading, setPepTalkLoading] = useState(false)
  const [pepTalkResult, setPepTalkResult] = useState<string | null>(null)

  const handlePepTalk = async () => {
    if (!selectedTodoId) return

    setPepTalkLoading(true)
    setPepTalkResult(null)

    const todo = todos.find((t) => t.id === Number(selectedTodoId))
    if (!todo) return

    try {
      const response = await fetch("/api/pep-talk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: todo.text }),
      })

      if (!response.ok) throw new Error("Failed to get pep talk")

      const result = await response.json()
      setPepTalkResult(result.pepTalk)
      toast.success("Pep talk generated! 💪")
    } catch (error) {
      toast.error("Failed to get pep talk")
    } finally {
      setPepTalkLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state when closing
    setTimeout(() => {
      setSelectedTodoId(null)
      setPepTalkResult(null)
    }, 200)
  }

  const selectedTodo = todos.find((t) => t.id === Number(selectedTodoId))

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full">
              <BicepsFlexed className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Get Motivated
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Choose a task and let me give you the motivation boost
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Select a task to motivate:
              </label>
              <SimpleSelect
                options={todos.map((t) => ({
                  label: t.text,
                  value: t.id,
                }))}
                value={selectedTodoId}
                onChange={(v) => {
                  setSelectedTodoId(v)
                  setPepTalkResult(null)
                }}
                placeholder="Choose a task that needs motivation..."
                className="w-full"
              />
            </div>

            <AnimatePresence>
              {selectedTodo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Sparkles className="h-3 w-3" />
                        Selected Task
                      </div>
                      <p className="font-medium text-foreground">
                        {selectedTodo.text}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handlePepTalk}
              disabled={!selectedTodoId || pepTalkLoading}
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl"
            >
              {pepTalkLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating your pep talk...
                </motion.div>
              ) : (
                <div className="flex items-center gap-2">
                  <BicepsFlexed className="h-4 w-4" />
                  Get My Pep Talk!
                </div>
              )}
            </Button>

            <AnimatePresence>
              {pepTalkResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Card className="border-orange-200 dark:border-orange-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Heart className="h-5 w-5 text-orange-600 fill-current" />
                        <span className="font-semibold text-orange-800 dark:text-orange-200">
                          Your Motivation Boost
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap font-medium">
                          {pepTalkResult}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
