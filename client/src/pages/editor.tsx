import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertEntrySchema, type DiaryEntry, type InsertEntry } from "@shared/schema";
import TipTapEditor from "@/components/tiptap-editor";
import MediaRecorder from "@/components/media-recorder";
import MediaPreview from "@/components/media-preview";
import { useToast } from "@/hooks/use-toast";
import { X, Image } from "lucide-react";
import React, { useState } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { Avatar } from "@/components/ui/avatar";

export default function Editor() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      const currentUrls = form.getValues("mediaUrls") || [];
      form.setValue("mediaUrls", [...currentUrls, url]);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload media. Please try again.",
        variant: "destructive"
      });
    } finally {
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
    <div className="fixed inset-0 bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-2 border-b bg-white z-20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">
            Create post
          </h1>
        </div>
        <Button
          onClick={form.handleSubmit((data) => mutation.mutate(data))}
          disabled={mutation.isPending}
          className="bg-primary font-semibold px-4"
        >
          Post
        </Button>
      </div>

      {/* Content Area */}
      <div className="mt-14 mb-32 h-[calc(100vh-8.5rem)] overflow-y-auto">
        <div className="max-w-full sm:max-w-2xl mx-auto px-4">
          {/* User Info */}
          <div className="flex items-center gap-3 py-4">
            <Avatar className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Your Name</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {form.watch("feeling") && (
                  <span>{form.watch("feeling")?.label} {form.watch("feeling")?.emoji}</span>
                )}
                {form.watch("location") && (
                  <span>at {form.watch("location")} 📍</span>
                )}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="py-2">
            <TipTapEditor
              value={form.watch("content")}
              onChange={(value) => form.setValue("content", value)}
            />
          </div>

          {/* Media Preview */}
          {form.watch("mediaUrls")?.length > 0 && (
            <div className="mt-4">
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

      {/* Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white z-20" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
        <div className="max-w-full sm:max-w-2xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-1 py-2">
            <MediaRecorder onCapture={onMediaUpload}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-12 flex flex-col items-center justify-center gap-1 hover:bg-transparent"
              >
                <Image className="h-6 w-6 text-green-500" />
                <span className="text-xs">Photo/video</span>
              </Button>
            </MediaRecorder>
            <FeelingSelector
              selectedFeeling={form.getValues("feeling")}
              onSelect={(feeling) => form.setValue("feeling", feeling)}
            />
            <LocationSelector
              selectedLocation={form.getValues("location")}
              onSelect={(location) => form.setValue("location", location)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-12 flex flex-col items-center justify-center gap-1 hover:bg-transparent"
              disabled
            >
              <span className="h-6 w-6 rounded-full bg-slate-200" />
              <span className="text-xs">More</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}