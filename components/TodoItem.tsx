import {
  Trash2,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  GripVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SortableItem } from "react-easy-sort";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Todo } from "@/lib/graphql/generated/graphql";

export function TodoItem({
  todo,
  index,
  handleToggle,
  handleSuggestSubtasks,
  handleDelete,
  loadingSuggestions,
  expandedSuggestions,
  isReordering,
}: {
  todo: Todo;
  index: number;
  handleToggle: (id: number) => void;
  handleSuggestSubtasks: (id: number, e: React.MouseEvent) => void;
  handleDelete: (id: number, e: React.MouseEvent) => void;
  loadingSuggestions: number | null;
  expandedSuggestions: number | null;
  isReordering: boolean;
}) {
  return (
    <SortableItem>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        layout
        layoutId={`todo-${todo.id}`}
      >
        <Card
          className={`transition-all duration-200 hover:shadow-md ${
            isReordering ? "pointer-events-none" : ""
          }`}
        >
          <CardContent className="p-0">
            <div className="p-4 transition-colors duration-150">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-1 cursor-grab active:cursor-grabbing hover:bg-muted rounded-md transition-colors touch-none">
                  <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors text-primary" />
                </div>

                <div
                  className={`cursor-pointer flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? "bg-primary border-primary"
                      : "border-muted-foreground hover:border-primary"
                  }`}
                  onClick={() => {
                    if (expandedSuggestions !== todo.id && !isReordering) {
                      handleToggle(todo.id);
                    }
                  }}
                >
                  {todo.completed && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>

                <span
                  className={`flex-1 text-base select-none transition-all ${
                    todo.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {todo.text}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) =>
                    !isReordering && handleSuggestSubtasks(todo.id, e)
                  }
                  disabled={loadingSuggestions === todo.id || isReordering}
                  className="min-w-[110px] justify-between h-8"
                >
                  <div className="flex items-center gap-2">
                    {loadingSuggestions === todo.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-primary" />
                    )}
                    <span className="text-xs">Suggest</span>
                  </div>
                  {todo.suggestion && todo.suggestion.length > 0 && (
                    <div className="flex-shrink-0 ml-1">
                      {expandedSuggestions === todo.id ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => !isReordering && handleDelete(todo.id, e)}
                  disabled={isReordering}
                  className="flex-shrink-0 w-8 h-8 p-0"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {expandedSuggestions === todo.id &&
                todo.suggestion &&
                todo.suggestion.length > 0 && (
                  <motion.div
                    key="suggestions"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                    layout
                  >
                    <div className="border-t bg-muted/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          AI Suggestions
                        </span>
                      </div>
                      <ol className="space-y-2 list-none">
                        {todo?.suggestion?.map((suggestion, index) => {
                          if (suggestion == null) return null;

                          return (
                            <li key={index} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <span className="text-sm text-foreground/80 leading-relaxed">
                                {suggestion}
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </SortableItem>
  );
}
