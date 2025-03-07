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
import React, { useState, useCallback } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";

// Simulate useIsMobile hook - replace with actual implementation
const useIsMobile = () => {
  return window.innerWidth < 768;
};

export default function Editor() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempMediaUrls, setTempMediaUrls] = useState<string[]>([]);
  const isMobile = useIsMobile();

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

  React.useEffect(() => {
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
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();
      const finalUrls = tempUrls.map(u => u === tempUrl ? url : u);
      form.setValue("mediaUrls", finalUrls);
      setTempMediaUrls([]);

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
    if (!isMobile) return;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [isMobile]);

  // Add swipe to go back gesture
  React.useEffect(() => {
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX;

      if (swipeDistance > 100) {
        navigate('/');
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Header - Fixed at top */}
      <div className="flex-none px-4 sm:px-6 py-3 border-b bg-white z-20">
        <div className="absolute top-3 right-4 sm:right-6 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
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
                {form.watch("feeling")?.label} {form.watch("feeling")?.emoji}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 relative bg-white z-10">
        <div className="absolute inset-0 overflow-auto">
          <div className="h-full max-w-full sm:max-w-2xl mx-auto px-4 sm:px-6">
            <TipTapEditor
              value={form.watch("content")}
              onChange={(value) => form.setValue("content", value)}
            />
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-none border-t bg-white z-20" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
        <div className="max-w-full sm:max-w-2xl mx-auto px-4 sm:px-6 py-3 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">How are you feeling today?</span>
            <FeelingSelector
              selectedFeeling={form.getValues("feeling")}
              onSelect={async (feeling) => {
                await hideKeyboard();
                form.setValue("feeling", feeling);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Checking in at:</span>
            <LocationSelector
              selectedLocation={form.getValues("location")}
              onSelect={(location) => {
                hideKeyboard();
                form.setValue("location", location);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Add media:</span>
            <MediaRecorder onCapture={onMediaUpload} />
          </div>
        </div>

        {form.watch("mediaUrls")?.length > 0 && (
          <div className="max-w-full sm:max-w-2xl mx-auto px-4 sm:px-6 pt-2 pb-4">
            <MediaPreview
              urls={form.watch("mediaUrls")}
              onRemove={onMediaRemove}
              loading={isUploading}
              uploadProgress={uploadProgress}
            />
          </div>
        )}
      </div>
    </div>
  );
}