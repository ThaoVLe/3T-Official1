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
import { Save, X } from "lucide-react";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { PageTransition } from "@/components/animations";

// Added KeyboardAware component
const KeyboardAware = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      const keyboardIsShown = vh < window.innerHeight;
      setKeyboardHeight(keyboardIsShown ? window.innerHeight - vh : 0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={ref} style={{ marginBottom: keyboardHeight }} className="relative">
      {children}
    </div>
  );
};


export default function Editor() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempMediaUrls, setTempMediaUrls] = useState<string[]>([]);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(touchEndY - touchStartY);
      const swipeTime = touchEndTime - touchStartTime;

      if (swipeDistance > 50 && swipeTime < 300 && verticalDistance < 30) {
        if (id) {
          sessionStorage.setItem('lastViewedEntryId', id);
        }
        const container = document.querySelector('.diary-content');
        if (container) {
          sessionStorage.setItem('homeScrollPosition', container.scrollTop.toString());
        }
        setIsExiting(true);
        setTimeout(() => navigate('/'), 100);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [id, navigate]);

  const isMobile = () => {
    return window.innerWidth < 768;
  };

  const { data: entry } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id,
  });

  const form = useForm<InsertEntry>({
    resolver: zodResolver(insertEntrySchema),
    defaultValues: {
      title: "",
      content: "",
      mediaUrls: [],
      feeling: null,
      location: null,
    },
  });

  useEffect(() => {
    if (entry) {
      form.reset({
        title: entry.title,
        content: entry.content,
        mediaUrls: entry.mediaUrls || [],
        feeling: entry.feeling,
        location: entry.location,
      });
    }
  }, [entry, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertEntry) => {
      if (id) {
        await apiRequest("PUT", `/api/entries/${id}`, data);
      } else {
        await apiRequest("POST", "/api/entries", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Success",
        description: id ? "Entry updated" : "Entry created",
      });
      navigate("/");
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

  // Function to hide keyboard on mobile devices
  const hideKeyboard = useCallback(() => {
    if (!isMobile()) return;

    // Force any active element to lose focus
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // More aggressive iOS keyboard dismissal
    // Create an offscreen input and force it to focus and blur
    const temporaryInput = document.createElement('input');
    temporaryInput.setAttribute('type', 'text');
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.top = '-100px';
    temporaryInput.style.left = '0';
    temporaryInput.style.opacity = '0';
    temporaryInput.style.height = '0';
    temporaryInput.style.width = '100%';
    temporaryInput.style.fontSize = '16px'; // Prevents iOS zoom

    // Append to body, focus, then blur and remove
    document.body.appendChild(temporaryInput);

    // Force focus then immediately blur
    setTimeout(() => {
      temporaryInput.focus();
      setTimeout(() => {
        temporaryInput.blur();
        document.body.removeChild(temporaryInput);
      }, 50);
    }, 50);

    // Additional fix - add a slight delay before showing sheet
    return new Promise(resolve => setTimeout(resolve, 100));
  }, []);

  return (
    <PageTransition direction={1}>
      <KeyboardAware>
        <div className={`min-h-screen flex flex-col bg-white w-full ${isExiting ? 'pointer-events-none' : ''}`}>
          {/* Header */}
          <div className="relative px-4 sm:px-6 py-3 border-b bg-white sticky top-0 z-10 w-full">
            <div className="absolute top-3 right-4 sm:right-6 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (id) {
                    sessionStorage.setItem('lastViewedEntryId', id);
                  }
                  setIsExiting(true);
                  setTimeout(() => navigate("/"), 100);
                }}
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
                className="text-xl font-semibold border-0 px-0 h-auto focus-visible:ring-0 w-full"
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

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-auto w-full">
            <div className="flex-1 p-4 sm:p-6 w-full max-w-full">
              <TipTapEditor
                value={form.watch("content")}
                onChange={(value) => form.setValue("content", value)}
              />
            </div>

            {/* Media Preview moved here */}
            {form.watch("mediaUrls")?.length > 0 && (
              <div className="p-4 pb-[80px]"> {/* Increased padding to 80px */}
                <MediaPreview
                  urls={form.watch("mediaUrls")}
                  onRemove={onMediaRemove}
                  loading={isUploading}
                  uploadProgress={uploadProgress}
                />
              </div>
            )}

            {/* Media Controls - Now in floating bar */}
            <div 
              className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-2 z-50 floating-bar"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
            >
              <div className="flex items-center justify-between gap-4">
                <FeelingSelector
                  selectedFeeling={form.getValues("feeling")}
                  onSelect={async (feeling) => {
                    await hideKeyboard();
                    form.setValue("feeling", feeling);
                  }}
                />

                <MediaRecorder onCapture={onMediaUpload} />

                <LocationSelector
                  selectedLocation={form.getValues("location")}
                  onSelect={(location) => {
                    hideKeyboard();
                    form.setValue("location", location);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      <div className="floating-bar">
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </KeyboardAware>
    </PageTransition>
  );
}