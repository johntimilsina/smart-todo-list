import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Image as Img, Plus } from 'lucide-react'

interface TodoInputProps {
    onAddTask: (task: string) => void
    onCreateFromImage: () => void
}

export function TodoInput({ onAddTask, onCreateFromImage }: TodoInputProps) {
    const [task, setTask] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (task.trim()) {
            onAddTask(task.trim())
            setTask('')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="relative glass-effect border rounded-2xl p-6 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <Textarea
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="What would you like to accomplish today?"
                                className="min-h-[70px] text-base border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onCreateFromImage}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <Img className="w-4 h-4 mr-2" />
                                Image
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="submit"
                                variant="default"
                                size="sm"
                                disabled={!task.trim()}
                                className="px-6"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Task
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
