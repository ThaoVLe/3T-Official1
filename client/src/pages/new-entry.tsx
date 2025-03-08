import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { insertEntrySchema, type InsertEntry } from "@shared/schema";
import TipTapEditor from "@/components/tiptap-editor";
import MediaRecorder from "@/components/media-recorder";
import MediaPreview from "@/components/media-preview";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PageTransition } from "@/components/animations";
import { KeyboardAware } from "@/components/keyboard-aware";

export default function NewEntry() {
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
  }, [navigate]);

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

  const isMobile = () => {
    return window.innerWidth < 768;
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
                Create
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

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-auto w-full">
            <div className="flex-1 p-4 sm:p-6 w-full max-w-full">
              <TipTapEditor
                value={form.watch("content")}
                onChange={(value) => form.setValue("content", value)}
              />
            </div>

            {/* Media Preview */}
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

            {/* Media Controls - Now in floating bar */}
            <div 
              className="floating-bar"
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
      </KeyboardAware>
    </PageTransition>
  );
}