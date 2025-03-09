import React, { useState, useEffect, useRef } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEntrySchema, type InsertEntry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import TipTapEditor from "@/components/tiptap-editor";
import MediaRecorder from "@/components/media-recorder";
import MediaPreview from "@/components/media-preview";
import { useToast } from "@/hooks/use-toast";
import { Save, X, Heart, Activity } from "lucide-react"; // Added Activity icon
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PageTransition } from "@/components/animations";
import { KeyboardAware } from "@/components/keyboard-aware";

const NewEntry: React.FC = () => {
  const [feeling, setFeeling] = useState<{ emoji: string; label: string } | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempMediaUrls, setTempMediaUrls] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const target = e.target as HTMLElement;
      const isInsideEditor = target.closest('.tiptap-container, .ProseMirror') !== null;

      if (isInsideEditor) {
        isDragging = false;
        return;
      }

      const touchMoveX = e.touches[0].clientX;
      const touchMoveY = e.touches[0].clientY;
      const verticalDistance = Math.abs(touchMoveY - touchStartY);

      if (verticalDistance > 30) return;

      const moveDistance = touchMoveX - touchStartX;

      if (moveDistance > 0) {
        if (containerRef.current) {
          const dampenedDistance = Math.sqrt(moveDistance) * 6;
          containerRef.current.style.transform = `translateX(${Math.min(dampenedDistance, 100)}px)`;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      isDragging = false;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const swipeDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(touchEndY - touchStartY);
      const swipeTime = touchEndTime - touchStartTime;

      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.3s ease-out';
      }

      if ((swipeDistance > 80 || (swipeDistance > 50 && swipeTime < 300)) && verticalDistance < 30) {
        setShowSaveDialog(true);
        if (containerRef.current) {
          containerRef.current.style.transform = 'translateX(0)';
        }
      } else {
        if (containerRef.current) {
          containerRef.current.style.transform = 'translateX(0)';
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const form = useForm<InsertEntry>({
    resolver: zodResolver(insertEntrySchema),
    defaultValues: {
      title: "",
      content: "",
      mediaUrls: [],
      feeling: feeling,
      location: location,
    },
  });

  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: InsertEntry) => {
      await apiRequest("POST", "/api/entries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Success",
        description: "Entry created",
      });
      navigate("/");
    },
  });

  const handleCancel = () => {
    setShowSaveDialog(false);
    setIsExiting(true);
    setTimeout(() => navigate('/'), 100);
  };

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

  return (
    <PageTransition direction={1}>
      <KeyboardAware>
        <div ref={containerRef} className="relative min-h-screen">
          <form ref={formRef}>
            <div className={`flex flex-col bg-white w-full ${isExiting ? 'pointer-events-none' : ''}`}>
              <div className="relative px-4 sm:px-6 py-3 border-b bg-white sticky top-0 z-10 w-full">
                <div className="absolute top-3 right-4 sm:right-6 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="whitespace-nowrap"
                  >
                    <X className="h-4 w-4 mr-1" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={form.handleSubmit((data) => mutation.mutate(data))}
                    disabled={mutation.isPending}
                    className="bg-primary hover:bg-primary/90 whitespace-nowrap"
                  >
                    <Save className="h-4 w-4 mr-1" />
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
                        {form.watch("feeling").label} {form.watch("feeling").emoji}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 sm:p-6 mb-[72px] overflow-auto">
                <TipTapEditor
                  value={form.watch("content")}
                  onChange={(value) => form.setValue("content", value)}
                />
              </div>

              {form.watch("mediaUrls")?.length > 0 && (
                <div className="p-4 pb-[80px]">
                  <MediaPreview
                    urls={form.watch("mediaUrls")}
                    onRemove={onMediaRemove}
                    loading={isUploading}
                    uploadProgress={uploadProgress}
                  />
                </div>
              )}

              <div className="floating-bar flex items-center justify-evenly gap-4 p-2"> {/* Standardized floating bar */}
                <FeelingSelector
                  selectedFeeling={form.getValues("feeling")}
                  onSelect={(feeling) => {
                    setFeeling(feeling);
                    form.setValue("feeling", feeling);
                  }}
                  icon={<Heart className="h-6 w-6" />} {/* Replaced with Heart icon */}
                />
                <MediaRecorder onCapture={onMediaUpload} icon={<img src="/camera-icon.svg" alt="Record" />} /> {/* Added placeholder for media icon */}
                <LocationSelector
                  selectedLocation={form.getValues("location")}
                  onSelect={(location) => {
                    setLocation(location);
                    form.setValue("location", location);
                  }}
                  icon={<Activity className="h-6 w-6" />} {/* Replaced with Activity icon */}
                />
              </div>
            </div>
          </form>
        </div>
      </KeyboardAware>
    </PageTransition>
  );
};

export default NewEntry;