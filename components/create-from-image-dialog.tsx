"use client";

import type React from "react";
import { useState, useRef } from "react";
import {
  ScanSearch,
  Loader2,
  Upload,
  ImageIcon,
  CheckCircle,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateFromImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTodos: (todos: string[]) => Promise<void>;
  user: { id: string; is_anonymous: boolean | undefined } | null;
  recordFeatureUsage: ReturnType<
    typeof import("@/lib/graphql/generated/graphql").useRecordFeatureUsageMutation
  >[0];
  refetchFeatureUsage: () => void;
  hasUsedFeature: (feature: string) => boolean;
  isAnonymous: boolean | undefined;
}

export function CreateFromImageDialog({
  open,
  onOpenChange,
  onAddTodos,
  user,
  recordFeatureUsage,
  refetchFeatureUsage,
  hasUsedFeature,
  isAnonymous,
}: CreateFromImageDialogProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageTodosLoading, setImageTodosLoading] = useState(false);
  const [imageTodosResult, setImageTodosResult] = useState<string[] | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [addingTodos, setAddingTodos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImageTodosResult(null);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleExtractTodosFromImage = async () => {
    if (!imageFile) return;

    if (isAnonymous && hasUsedFeature("create_from_image")) {
      toast.error(
        "Anonymous users can only use Create from Image once. Please log in."
      );
      return;
    }
    setImageTodosLoading(true);
    setImageTodosResult(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch("/api/create-from-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to extract todos from image");

      const result = await response.json();
      setImageTodosResult(result.todos);

      if (user)
        await recordFeatureUsage({
          variables: { userId: user.id, feature: "create_from_image" },
        });
      if (refetchFeatureUsage) refetchFeatureUsage();
      toast.success(`Found ${result.todos.length} tasks in your image! 🎉`);
    } catch (error) {
      toast.error("Failed to extract todos from image");
      console.error("Image Extraction Error:", error);
    } finally {
      setImageTodosLoading(false);
    }
  };

  const handleAddExtractedTodos = async () => {
    if (!imageTodosResult || imageTodosResult.length === 0) return;
    setAddingTodos(true);
    try {
      await onAddTodos(imageTodosResult);
      if (refetchFeatureUsage) refetchFeatureUsage();
      handleClose();
      toast.success("Tasks added successfully! 📝");
    } catch (error) {
      toast.error("Failed to add todos from image");
      console.error("Add Todos Error:", error);
    } finally {
      setAddingTodos(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setImageFile(null);
      setImageTodosResult(null);
      setImagePreview(null);
      setAddingTodos(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 200);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full">
              <ScanSearch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Create from Image
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Upload a photo of your handwritten or printed todo list and I
                will extract the tasks
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <Card
                className={`border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-primary/50 hover:bg-muted/30 ${
                  imageFile
                    ? "border-primary/30 bg-muted/20"
                    : "border-muted-foreground/30"
                }`}
                onClick={handleUploadClick}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="max-w-full max-h-32 rounded-lg shadow-md object-contain"
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        {imageFile ? imageFile.name : "Choose an image"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {imageFile
                          ? "Click to change image"
                          : "Click to upload or drag and drop your todo list image"}
                      </p>
                    </div>

                    {!imageFile && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Browse Files
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={handleExtractTodosFromImage}
              disabled={!imageFile || imageTodosLoading}
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {imageTodosLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing your image...
                </motion.div>
              ) : (
                <div className="flex items-center gap-2">
                  <ScanSearch className="h-4 w-4" />
                  Extract Tasks from Image
                </div>
              )}
            </Button>

            <AnimatePresence>
              {imageTodosResult && imageTodosResult.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-blue-600 fill-current" />
                        <span className="font-semibold text-blue-800 dark:text-blue-200">
                          Found {imageTodosResult.length} Tasks
                        </span>
                      </div>
                      <ScrollArea className="h-28">
                        <div className="space-y-2 pr-4">
                          {imageTodosResult.map((todo, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-start gap-3 p-3 bg-background/50 rounded-lg"
                            >
                              <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                                {idx + 1}
                              </div>
                              <p className="text-sm text-foreground/90 leading-relaxed">
                                {todo}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={handleAddExtractedTodos}
                    disabled={addingTodos}
                    className="w-full h-12 text-base font-semibold"
                    variant="default"
                  >
                    {addingTodos ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding tasks to your list...
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add All {imageTodosResult.length} Tasks to My List
                      </div>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
