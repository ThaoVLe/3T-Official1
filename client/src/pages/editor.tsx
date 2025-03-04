
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { insertEntrySchema, type DiaryEntry, type InsertEntry } from "@shared/schema";
import TipTapEditor from "@/components/tiptap-editor";
import MediaRecorder from "@/components/media-recorder";
import MediaPreview from "@/components/media-preview";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
// Placeholder import - replace with actual component import
import { LocationSelector } from "@/components/location-selector";
import { apiRequest } from "@/lib/queryClient";

export default function Editor() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Always declare all hooks at the top level, regardless of conditions
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempMediaUrls, setTempMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Use the useQuery hook regardless of whether id exists
  const { data: entry, isLoading: isLoadingEntry } = useQuery({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id, // Only enable the query if id exists
    onSuccess: (data: DiaryEntry) => {
      console.log("Successfully loaded entry:", data);
      if (data) {
        form.reset({
          title: data.title || "",
          content: data.content || "",
          mediaUrls: data.mediaUrls || [],
          feeling: data.feeling || null,
          location: data.location || null,
        });
      }
    },
    onError: (error) => {
      console.error("Error loading entry:", error);
      toast({
        title: "Error",
        description: "Failed to load entry. Please try again.",
        variant: "destructive",
      });
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertEntry) => {
      setIsSubmitting(true);
      try {
        const payload = {
          ...data,
          feeling: data.feeling || null,
          location: data.location || null,
          mediaUrls: data.mediaUrls || []
        };

        if (id) {
          return await apiRequest("PUT", `/api/entries/${id}`, payload);
        } else {
          return await apiRequest("POST", "/api/entries", payload);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: [`/api/entries/${id}`] });
      }
      toast({
        title: "Success",
        description: id ? "Entry updated" : "Entry created",
      });
      navigate("/");
    },
    onError: (error) => {
      console.error("Error saving entry:", error);
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive",
      });
    }
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

  // Effects should be declared after all hooks
  useEffect(() => {
    if (id && entry) {
      form.reset({
        title: entry.title || "",
        content: entry.content || "",
        mediaUrls: entry.mediaUrls || [],
        feeling: entry.feeling || null,
        location: entry.location || null
      });
      console.log("Resetting form with entry:", entry);
    }
  }, [entry, id, form]);

  // Loading indicator for when entry is being fetched
  if (id && isLoadingEntry) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white sticky top-0 z-10 w-full">
        <div className="flex-1 max-w-full sm:max-w-2xl">
          <Input 
            {...form.register("title")}
            className="text-xl font-semibold border-0 px-0 h-auto focus-visible:ring-0 w-full"
            placeholder="Untitled Entry..."
          />
          {form.watch("feeling") && (
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <span>is feeling</span>
              <span className="font-medium">{form.watch("feeling").label}</span>
              <span className="text-lg">{form.watch("feeling").emoji}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
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
      </div>

      {/* Feeling & Location Selectors */}
      <div className="border-b bg-white w-full">
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2 overflow-x-auto">
          <FeelingSelector 
            value={form.watch("feeling")} 
            onChange={(feeling) => form.setValue("feeling", feeling)} 
          />
          <LocationSelector 
            value={form.watch("location")} 
            onChange={(location) => form.setValue("location", location)} 
          />
        </div>
      </div>

      {/* Media Attachment */}
      <div className="border-b bg-white w-full">
        <div className="px-4 sm:px-6 py-2">
          <MediaRecorder onCapture={onMediaUpload} />
        </div>
        {(form.watch("mediaUrls")?.length > 0 || tempMediaUrls.length > 0) && (
          <div className="px-4 sm:px-6 pb-3">
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
              {form.watch("mediaUrls")?.map((url, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <MediaPreview 
                    url={url} 
                    onRemove={() => onMediaRemove(index)} 
                  />
                </div>
              ))}
              {isUploading && (
                <div className="relative h-24 w-24 flex-shrink-0 bg-muted rounded overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-medium">{uploadProgress}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-auto w-full">
        <div className="flex-1 p-4 sm:p-6 w-full max-w-full">
          <TipTapEditor 
            value={form.watch("content")} 
            onChange={(value) => form.setValue("content", value)} 
          />
        </div>
      </div>
    </div>
  );
}
