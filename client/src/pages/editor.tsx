import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertEntrySchema, type DiaryEntry, type InsertEntry } from "@shared/schema";
import TipTapEditor from "@/components/tiptap-editor";
import MediaRecorder from "@/components/media-recorder";
import MediaPreview from "@/components/media-preview";
import { useToast } from "@/hooks/use-toast";
import { Save, X, SmilePlus, ImagePlus, MapPin } from "lucide-react";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { PageTransition } from "@/components/animations";
import { KeyboardProvider, useKeyboard } from "@/lib/keyboard-context";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

const SWIPE_THRESHOLD = 50; // Minimum distance to trigger swipe
const VELOCITY_THRESHOLD = 0.5; // Minimum velocity to trigger swipe

const EditorContent = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempMediaUrls, setTempMediaUrls] = useState<string[]>([]);
  const [isExiting, setIsExiting] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isDraggingRef = useRef(false);

  // Authentication check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/auth");
      }
      setIsAuthChecked(true);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const swipeTime = Date.now() - touchStartRef.current.time;

    // Only handle horizontal swipes (prevent interference with vertical scrolling)
    if (deltaY > 40) {
      setSwipeProgress(0);
      return;
    }

    // Prevent default if it's likely a horizontal swipe
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      e.preventDefault();
    }

    // Right to left swipe for exiting
    if (deltaX < 0) {
      // Calculate swipe progress (0 to 1) with easing
      const progress = Math.min(1, Math.pow(Math.abs(deltaX) / 200, 0.8));

      // Add haptic feedback if supported
      if (progress > 0.5 && 'vibrate' in navigator) {
        try {
          navigator.vibrate(10); // Short vibration for feedback
        } catch (e) {
          // Ignore vibration errors
        }
      }

      setSwipeProgress(progress);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartRef.current.x;
    const swipeTime = Date.now() - touchStartRef.current.time;
    const swipeVelocity = Math.abs(deltaX) / swipeTime;

    // If swiped enough or with enough velocity, trigger exit
    if (swipeProgress > 0.4 || (swipeProgress > 0.2 && swipeVelocity > 0.8)) {
      // Add haptic feedback if supported
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(20); // Stronger vibration for confirmation
        } catch (e) {
          // Ignore vibration errors
        }
      }

      setIsExiting(true);
      setTimeout(() => {
        handleSave();
        navigate('/');
      }, 300);
    } else {
      // Spring back animation
      setSwipeProgress(0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate]);

  const { data: entry } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id && !!auth.currentUser && isAuthChecked,
  });

  const form = useForm<InsertEntry>({
    resolver: zodResolver(insertEntrySchema),
    defaultValues: {
      title: "",
      content: "",
      mediaUrls: [],
      feeling: null,
      location: null,
      userId: auth.currentUser?.uid || "",
    },
  });

  useEffect(() => {
    if (entry && auth.currentUser) {
      form.reset({
        ...entry,
        userId: auth.currentUser.uid,
      });
    }
  }, [entry, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertEntry) => {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to create or edit entries");
      }

      const entryData = {
        ...data,
        userId: auth.currentUser.uid,
      };

      if (id) {
        await apiRequest("PUT", `/api/entries/${id}`, entryData);
      } else {
        await apiRequest("POST", "/api/entries", entryData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Success",
        description: id ? "Entry updated" : "Entry created",
      });
      navigate("/home");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save entry",
        variant: "destructive",
      });
    },
  });

  const onMediaUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const tempUrl = URL.createObjectURL(file);
    const currentUrls = form.getValues("mediaUrls") || [];
    const tempUrls = [...currentUrls, tempUrl];
    setTempMediaUrls(tempUrls);
    form.setValue("mediaUrls", tempUrls);

    try {
      const uploadPromise = new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", file);

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const { url } = JSON.parse(xhr.responseText);
            const finalUrls = tempUrls.map(u => u === tempUrl ? url : u);
            form.setValue("mediaUrls", finalUrls);
            setTempMediaUrls([]);
            resolve(url);
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      await uploadPromise;

    } catch (error) {
      console.error('Upload error:', error);
      const currentUrls = form.getValues("mediaUrls") || [];
      const finalUrls = currentUrls.filter(url => url !== tempUrl);
      form.setValue("mediaUrls", finalUrls);
      setTempMediaUrls([]);

      toast({
        title: "Upload Error",
        description: "Failed to upload media. Please try again.",
        variant: "destructive"
      });
    } finally {
      URL.revokeObjectURL(tempUrl);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onMediaRemove = (index: number) => {
    const currentUrls = form.getValues("mediaUrls") || [];
    const newUrls = [...currentUrls];
    newUrls.splice(index, 1);
    form.setValue("mediaUrls", newUrls);
  };

  const hideKeyboard = useCallback(() => {
    if (!isMobile()) return;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const temporaryInput = document.createElement('input');
    temporaryInput.setAttribute('type', 'text');
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.top = '-100px';
    temporaryInput.style.left = '0';
    temporaryInput.style.opacity = '0';
    temporaryInput.style.height = '0';
    temporaryInput.style.width = '100%';
    temporaryInput.style.fontSize = '16px';

    document.body.appendChild(temporaryInput);

    setTimeout(() => {
      temporaryInput.focus();
      setTimeout(() => {
        temporaryInput.blur();
        document.body.removeChild(temporaryInput);
      }, 50);
    }, 50);

    return new Promise(resolve => setTimeout(resolve, 100));
  }, []);

  const isMobile = () => {
    return window.innerWidth < 768;
  };

  const handleSave = () => {
    form.handleSubmit((data) => mutation.mutate(data))
  }

  if (!isAuthChecked) {
    return <div>Loading...</div>;
  }

  if (!auth.currentUser) {
    navigate("/auth");
    return null;
  }

  return (
    <div 
      className={`min-h-screen bg-background overflow-hidden relative ${isExiting ? 'transition-opacity duration-300 opacity-0' : ''}`} 
      ref={containerRef}
      style={{
        '--swipe-progress': swipeProgress,
      } as React.CSSProperties}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicator overlay - becomes visible during swipe */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-start pl-4 opacity-0 transition-opacity"
        style={{
          opacity: swipeProgress * 0.8,
        }}
      >
        <div className="rounded-full bg-primary/20 p-3 backdrop-blur-sm">
          <svg 
            className="w-6 h-6 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            style={{
              transform: `translateX(${-10 + swipeProgress * 10}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </div>

      {isExiting && (
        <div className="fixed inset-0 bg-background z-50 animate-fade-in" />
      )}

      {!isAuthChecked ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="relative px-4 sm:px-6 py-3 border-b border-border bg-card sticky top-0 z-10">
          <div className="absolute top-3 right-4 sm:right-6 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/home")}
              className="whitespace-nowrap"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={form.handleSubmit((data) => mutation.mutate(data))}
              disabled={mutation.isPending}
              className="bg-primary hover:bg-primary/90 whitespace-nowrap"
            >
              <Save className="h-4 w-4 mr-1" />
              {id ? "Update" : "Create"}
            </Button>
          </div>
          <div className="max-w-full sm:max-w-2xl pr-24">
            <Input
              {...form.register("title")}
              className="text-xl font-semibold border-0 px-0 h-auto focus-visible:ring-0 w-full bg-transparent text-foreground"
              placeholder="Untitled Entry..."
            />
            {form.watch("feeling") && (
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <div className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium">
                  {form.watch("feeling").label.includes(',') ? (
                    <>
                      {form.watch("feeling").label.split(',')[0].trim()} {form.watch("feeling").emoji.split(' ')[0]}
                      {' - '}{form.watch("feeling").label.split(',')[1].trim()} {form.watch("feeling").emoji.split(' ')[1]}
                    </>
                  ) : (
                    <>
                      {form.watch("feeling").label} {form.watch("feeling").emoji}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="flex-1 flex flex-col overflow-auto w-full bg-background relative"
        >
          <div className="flex-1 p-4 sm:p-6 w-full max-w-full">
            <TipTapEditor
              value={form.watch("content")}
              onChange={(value) => form.setValue("content", value)}
            />
          </div>

          {form.watch("mediaUrls")?.length > 0 && (
            <div className="p-4 pb-[calc(env(safe-area-inset-bottom)+80px)]">
              <MediaPreview
                urls={form.watch("mediaUrls")}
                onRemove={onMediaRemove}
                loading={isUploading}
                uploadProgress={uploadProgress}
              />
            </div>
          )}

          <div className="fixed bottom-24 right-6 z-20">
            <Button
              type="button"
              size="icon"
              onClick={form.handleSubmit((data) => mutation.mutate(data))}
              disabled={mutation.isPending}
              className="h-11 w-11 rounded-full hover:bg-muted"
            >
              <Save className="h-6 w-6" />
            </Button>
          </div>

          <div
            className="fixed bottom-0 left-0 right-0 transform transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${isKeyboardVisible ? -keyboardHeight : 0}px)`,
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}
          >
            <div className="bg-background/80 backdrop-blur-sm border-t border-border">
              <div className="flex items-center justify-around px-4 py-2">
                <FeelingSelector
                  selectedFeeling={form.getValues("feeling")}
                  onSelect={async (feeling) => {
                    await hideKeyboard();
                    form.setValue("feeling", feeling);
                  }}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-full hover:bg-muted"
                    >
                      <SmilePlus className="h-6 w-6" />
                      <span className="sr-only">Select Feeling</span>
                    </Button>
                  }
                />

                <MediaRecorder
                  onCapture={onMediaUpload}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-full hover:bg-muted"
                    >
                      <ImagePlus className="h-6 w-6" />
                      <span className="sr-only">Add Media</span>
                    </Button>
                  }
                />

                <LocationSelector
                  selectedLocation={form.getValues("location")}
                  onSelect={(location) => {
                    hideKeyboard();
                    form.setValue("location", location);
                  }}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-full hover:bg-muted"
                    >
                      <MapPin className="h-6 w-6" />
                      <span className="sr-only">Add Location</span>
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Editor() {
  return (
    <PageTransition direction={1}>
      <KeyboardProvider>
        <EditorContent />
      </KeyboardProvider>
    </PageTransition>
  );
}