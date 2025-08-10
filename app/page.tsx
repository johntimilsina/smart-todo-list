'use client'

//TODO: implement captcha if anonymous users is enabled

import type React from 'react'
import { useState } from 'react'
import {
    Rabbit,
    Loader2,
    ArrowUpIcon as ClockArrowUp,
    DumbbellIcon as BicepsFlexed,
    XCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import SortableList from 'react-easy-sort'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Header } from '@/components/header'
import { PepTalkDialog } from '@/components/pep-talk-dialog'
import { CreateFromImageDialog } from '@/components/create-from-image-dialog'
import { TodoItem } from '@/components/TodoItem'
import { TodoInput } from '@/components/TodoInput'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useSupabaseUser } from '@/components/AuthProvider'
import {
    useGetTodosQuery,
    useAddTodoMutation,
    useDeleteTodoMutation,
    useToggleTodoMutation,
    useAddSuggestionMutation,
    useReorderTodosMutation,
    useRecordFeatureUsageMutation,
    useFeatureUsageQuery,
    type Todo,
} from '@/lib/graphql/generated/graphql'

export default function Page() {
    const { user, loading: userLoading } = useSupabaseUser()
    const isAnonymous = user?.is_anonymous

    // Fix: Pass userId to useGetTodosQuery
    const { data, loading, error, refetch } = useGetTodosQuery({
        variables: { userId: user?.id ?? '' },
        skip: !user,
    })

    const [addTodo] = useAddTodoMutation()
    const [deleteTodo] = useDeleteTodoMutation()
    const [toggleTodo] = useToggleTodoMutation()
    const [addSuggestion] = useAddSuggestionMutation()
    const [reorderTodos] = useReorderTodosMutation()
    const [recordFeatureUsage] = useRecordFeatureUsageMutation()

    const { data: featureUsageData, refetch: refetchFeatureUsage } =
        useFeatureUsageQuery({
            variables: { userId: user?.id ?? '' },
            skip: !user,
        })

    const [showLoginPrompt, setShowLoginPrompt] = useState(false)
    const [loadingSuggestions, setLoadingSuggestions] = useState<number | null>(
        null
    )
    const [expandedSuggestions, setExpandedSuggestions] = useState<
        number | null
    >(null)
    const [isReordering, setIsReordering] = useState(false)
    const [optimisticTodos, setOptimisticTodos] = useState<Todo[]>([])
    const [prioritizing, setPrioritizing] = useState(false)
    const [prioritizedResult, setPrioritizedResult] = useState<string | null>(
        null
    )
    const [pepTalkOpen, setPepTalkOpen] = useState(false)
    const [imageDialogOpen, setImageDialogOpen] = useState(false)

    console.log('user', user)

    const handleAdd = async (text: string) => {
        if (!text.trim() || !user) return

        if (isAnonymous && (data?.todos?.length ?? 0) >= 3) {
            setShowLoginPrompt(true)
            toast.error(
                'Anonymous users can only add 3 todos. Please log in to add more.'
            )
            return
        }

        try {
            await addTodo({ variables: { text, userId: user.id } })
            await refetch()
            toast.success('Task added successfully')
        } catch (error: unknown) {
            if (
                isAnonymous &&
                typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as { message?: string }).message === 'string' &&
                (error as { message: string }).message.includes('add 3 todos')
            ) {
                //setShowLoginPrompt(true)
            }
            toast.error('Failed to add task')
        }
    }

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await deleteTodo({ variables: { id, userId: user?.id ?? '' } })
            await refetch()
            toast.success('Task deleted')
        } catch (error) {
            toast.error('Failed to delete task')
            console.error('Delete error:', error)
        }
    }

    const handleToggle = async (id: number) => {
        const todo = data?.todos.find((t) => t.id === id)
        try {
            await toggleTodo({ variables: { id, userId: user?.id ?? '' } })
            refetch()
            if (todo?.completed) {
                toast.success('Task marked as incomplete')
            } else {
                toast.success('Task completed! 🎉')
            }
        } catch (error) {
            toast.error('Failed to update task')
            console.error('Toggle error:', error)
        }
    }

    // Helper to check if anonymous user has used a feature
    const hasUsedFeature = (feature: string) => {
        if (!isAnonymous) return false
        return (
            featureUsageData?.featureUsage?.some(
                (f) => f.feature === feature
            ) ?? false
        )
    }

    const handleSuggestSubtasks = async (
        todoId: number,
        e: React.MouseEvent
    ) => {
        e.stopPropagation()
        const todo = data?.todos.find((t) => t.id === todoId)
        if (!todo) return

        if (todo.suggestion && todo.suggestion.length > 0) {
            setExpandedSuggestions(
                expandedSuggestions === todoId ? null : todoId
            )
            return
        }

        /* if (isAnonymous && hasUsedFeature('pep_talk')) {
            setShowLoginPrompt(true)
            toast.error(
                'Anonymous users can only use Pep Talk once. Please log in.'
            )
            return
        } */

        setLoadingSuggestions(todoId)
        try {
            const response = await fetch('/api/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: todo.text }),
            })

            if (!response.ok) throw new Error('Failed to fetch suggestions')

            const dataRes = await response.json()
            const { suggestions } = dataRes

            await addSuggestion({
                variables: {
                    id: todoId,
                    suggestion: suggestions,
                    userId: user?.id ?? '',
                },
            })

            if (user)
                await recordFeatureUsage({
                    variables: { userId: user.id, feature: 'pep_talk' },
                })

            refetch()
            refetchFeatureUsage()
            setExpandedSuggestions(todoId)
            toast.success('AI suggestions generated!')
        } catch (error: unknown) {
            if (
                isAnonymous &&
                typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as { message?: string }).message === 'string' &&
                (error as { message: string }).message.includes('feature once')
            ) {
                //setShowLoginPrompt(true)
            }
            console.error(error)
            toast.error('Failed to generate suggestions')
        } finally {
            setLoadingSuggestions(null)
        }
    }

    const onSortEnd = async (oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex) return

        /* if (isAnonymous && hasUsedFeature('prioritize')) {
            setShowLoginPrompt(true)
            toast.error(
                'Anonymous users can only prioritize once. Please log in.'
            )
            return
        } */

        const todos = data?.todos || []
        const sortedTodos = [...todos].sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order
            }
            return a.id - b.id
        })

        const reorderedTodos = [...sortedTodos]
        const [removed] = reorderedTodos.splice(oldIndex, 1)
        reorderedTodos.splice(newIndex, 0, removed)

        setOptimisticTodos(reorderedTodos)
        setIsReordering(true)

        try {
            const todoIds = reorderedTodos.map((todo) => todo.id)
            await reorderTodos({
                variables: { todoIds, userId: user?.id ?? '' },
            })

            if (user)
                await recordFeatureUsage({
                    variables: { userId: user.id, feature: 'prioritize' },
                })

            refetchFeatureUsage()
            toast.success('Tasks reordered successfully')
        } catch (error: unknown) {
            if (
                isAnonymous &&
                typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as { message?: string }).message === 'string' &&
                (error as { message: string }).message.includes('feature once')
            ) {
                // setShowLoginPrompt(true)
            }
            toast.error('Failed to reorder tasks')
            setOptimisticTodos([])
            refetch()
        } finally {
            setIsReordering(false)
            setTimeout(() => setOptimisticTodos([]), 100)
        }
    }

    const handlePrioritize = async () => {
        if (!data?.todos || data.todos.length < 3) return

        /*  if (isAnonymous && hasUsedFeature('prioritize')) {
            setShowLoginPrompt(true)
            toast.error(
                'Anonymous users can only prioritize once. Please log in.'
            )
            return
        } */

        setPrioritizing(true)
        setPrioritizedResult(null)

        try {
            const todosText = data.todos.map((t: Todo) => t.text)
            const response = await fetch('/api/prioritize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todos: todosText }),
            })

            if (!response.ok) throw new Error('Failed to prioritize tasks')

            const result = await response.json()
            setPrioritizedResult(result.prioritized)

            if (
                result.ordered &&
                Array.isArray(result.ordered) &&
                result.ordered.length > 0
            ) {
                const todosCopy = [...data.todos]
                const orderedTodos = result.ordered
                    .map((orderedText: string) => {
                        let bestMatch = null
                        let bestScore = 0

                        for (const todo of todosCopy) {
                            const orderedWords = orderedText
                                .toLowerCase()
                                .split(/\s+/)
                            const todoWords = todo.text
                                .toLowerCase()
                                .split(/\s+/)
                            const matchCount = orderedWords.filter((w) =>
                                todoWords.includes(w)
                            ).length

                            if (matchCount > bestScore) {
                                bestScore = matchCount
                                bestMatch = todo
                            }
                        }

                        if (bestMatch) {
                            todosCopy.splice(todosCopy.indexOf(bestMatch), 1)
                            return bestMatch
                        }
                        return null
                    })
                    .filter(Boolean)

                const finalOrder = [...orderedTodos, ...todosCopy]
                setOptimisticTodos(finalOrder)
                setIsReordering(true)

                try {
                    const todoIds = finalOrder.map((todo) => todo.id)
                    await reorderTodos({
                        variables: { todoIds, userId: user?.id ?? '' },
                    })

                    if (user)
                        await recordFeatureUsage({
                            variables: {
                                userId: user.id,
                                feature: 'prioritize',
                            },
                        })

                    refetchFeatureUsage()
                    toast.success('Tasks reordered successfully')
                } catch (error: unknown) {
                    if (
                        isAnonymous &&
                        typeof error === 'object' &&
                        error !== null &&
                        'message' in error &&
                        typeof (error as { message?: string }).message ===
                            'string' &&
                        (error as { message: string }).message.includes(
                            'feature once'
                        )
                    ) {
                        //setShowLoginPrompt(true)
                    }
                    toast.error('Failed to reorder tasks')
                    setOptimisticTodos([])
                    refetch()
                } finally {
                    setIsReordering(false)
                    setTimeout(() => setOptimisticTodos([]), 100)
                }
            }

            if (user)
                await recordFeatureUsage({
                    variables: { userId: user.id, feature: 'prioritize' },
                })

            refetchFeatureUsage()
            toast.success('Tasks prioritized!')
        } catch (error) {
            toast.error('Failed to prioritize tasks')
            console.error('Prioritize error:', error)
        } finally {
            setPrioritizing(false)
        }
    }

    const handleAddTodosFromImage = async (todos: string[]) => {
        // Check restriction BEFORE adding todos
        if (isAnonymous && hasUsedFeature('create_from_image')) {
            setShowLoginPrompt(true)
            toast.error(
                'Anonymous users can only use Create from Image once. Please log in.'
            )
            return
        }

        let added = 0
        try {
            await Promise.all(
                todos.map(async (text) => {
                    await addTodo({
                        variables: { text, userId: user?.id ?? '' },
                    })
                    added++
                })
            )

            if (user && added > 0)
                await recordFeatureUsage({
                    variables: {
                        userId: user.id,
                        feature: 'create_from_image',
                    },
                })

            refetch()
            refetchFeatureUsage()
        } catch (error) {
            toast.error('Failed to add todos from image')
            console.error('Add from image error:', error)
        }
    }

    if (!user && !userLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-3"
                >
                    <span className="text-lg font-medium">
                        Please sign in or wait for anonymous session...
                    </span>
                </motion.div>
            </div>
        )
    }

    if (userLoading || loading) {
        return (
            <div>
                <LoadingScreen loading={true} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-center"
                >
                    <p className="text-lg">Error: {error.message}</p>
                </motion.div>
            </div>
        )
    }

    const todosToDisplay =
        isReordering && optimisticTodos.length > 0
            ? optimisticTodos
            : data?.todos
            ? [...data.todos].sort((a, b) => {
                  if (a.order !== undefined && b.order !== undefined) {
                      return a.order - b.order
                  }
                  return a.id - b.id
              })
            : []

    return (
        <div className="flex h-screen flex-col bg-background">
            <Header />

            {/* Fixed buttons section at top */}
            <div className="flex-shrink-0 px-6 py-4">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center space-x-2"
                    >
                        <Button
                            size="lg"
                            variant="secondary"
                            disabled={
                                loading ||
                                (data?.todos?.length ?? 0) < 3 ||
                                prioritizing
                            }
                            onClick={handlePrioritize}
                        >
                            {prioritizing ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />{' '}
                                    Prioritizing...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <ClockArrowUp className="h-5 w-5 text-primary" />
                                    Prioritize My Day
                                </span>
                            )}
                        </Button>
                        <Button
                            size="lg"
                            variant="secondary"
                            disabled={loading || !data?.todos.length}
                            onClick={() => setPepTalkOpen(true)}
                        >
                            <span className="flex items-center gap-2">
                                <BicepsFlexed className="h-5 w-5 text-primary" />
                                Pep Talk
                            </span>
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Scrollable main content area */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="px-6 py-4">
                        <div className="max-w-2xl mx-auto">
                            {prioritizedResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="bg-muted border rounded-lg p-4 mb-8 shadow"
                                >
                                    <h4 className="font-semibold mb-2 flex items-center justify-between">
                                        <span>Prioritized List</span>
                                        <span
                                            className="cursor-pointer"
                                            onClick={() =>
                                                setPrioritizedResult(null)
                                            }
                                        >
                                            <XCircle className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                        </span>
                                    </h4>
                                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                                        {prioritizedResult}
                                    </pre>
                                </motion.div>
                            )}

                            <div className="relative">
                                <AnimatePresence>
                                    {isReordering && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center rounded-lg"
                                        >
                                            <div className="bg-background border rounded-lg p-4 shadow-lg flex items-center gap-3">
                                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                <span className="text-sm font-medium">
                                                    Reordering tasks...
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {todosToDisplay.length > 0 && (
                                    <motion.div layout>
                                        <SortableList
                                            onSortEnd={onSortEnd}
                                            className="space-y-4"
                                            draggedItemClassName="opacity-50 scale-105"
                                        >
                                            {todosToDisplay.map(
                                                (todo, index) => (
                                                    <TodoItem
                                                        key={todo.id}
                                                        todo={todo}
                                                        index={index}
                                                        handleToggle={
                                                            handleToggle
                                                        }
                                                        handleSuggestSubtasks={
                                                            handleSuggestSubtasks
                                                        }
                                                        handleDelete={
                                                            handleDelete
                                                        }
                                                        loadingSuggestions={
                                                            loadingSuggestions
                                                        }
                                                        expandedSuggestions={
                                                            expandedSuggestions
                                                        }
                                                        isReordering={
                                                            isReordering
                                                        }
                                                    />
                                                )
                                            )}
                                        </SortableList>
                                    </motion.div>
                                )}

                                {todosToDisplay.length === 0 &&
                                    !isReordering && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.6,
                                                delay: 0.2,
                                            }}
                                            className="text-center py-16"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    duration: 0.5,
                                                    delay: 0.4,
                                                }}
                                                className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6"
                                            >
                                                <Rabbit className="h-8 w-8" />
                                            </motion.div>
                                            <h3 className="text-xl font-medium mb-2">
                                                No tasks yet
                                            </h3>
                                            <p className="text-muted-foreground">
                                                Add your first task to get
                                                started with AI-powered
                                                suggestions
                                            </p>
                                        </motion.div>
                                    )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Fixed input section at bottom */}
            <div className="flex-shrink-0 px-6 py-4 bg-background">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <div className="flex gap-4">
                            <TodoInput
                                onAddTask={handleAdd}
                                onCreateFromImage={() => {
                                    setImageDialogOpen(true)
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            <PepTalkDialog
                open={pepTalkOpen}
                onOpenChange={setPepTalkOpen}
                todos={data?.todos || []}
                user={user}
                recordFeatureUsage={recordFeatureUsage}
                refetchFeatureUsage={refetchFeatureUsage}
                hasUsedFeature={hasUsedFeature}
                isAnonymous={isAnonymous}
            />

            <CreateFromImageDialog
                open={imageDialogOpen}
                onOpenChange={setImageDialogOpen}
                onAddTodos={handleAddTodosFromImage}
                user={user}
                recordFeatureUsage={recordFeatureUsage}
                refetchFeatureUsage={refetchFeatureUsage}
                hasUsedFeature={hasUsedFeature}
                isAnonymous={isAnonymous}
            />

            {/* Show login prompt modal if needed */}
            {/* You can replace this with your own modal implementation */}
            {showLoginPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-background p-8 rounded-lg shadow-lg text-center">
                        <h2 className="text-xl font-bold mb-4">
                            Login Required
                        </h2>
                        <p className="mb-4">
                            You have reached the limit for anonymous users.
                            Please log in or sign up to continue using all
                            features.
                        </p>
                        <Button
                            onClick={() => {
                                /* trigger your login flow here */
                            }}
                        >
                            Log In / Sign Up
                        </Button>
                        <Button
                            variant="secondary"
                            className="ml-4"
                            onClick={() => setShowLoginPrompt(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
