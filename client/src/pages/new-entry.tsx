import React, { useState } from 'react';
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEntrySchema, type InsertEntry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TipTapEditor from "@/components/tiptap-editor";
import MediaRecorder from "@/components/media-recorder";
import MediaPreview from "@/components/media-preview";
import { useToast } from "@/hooks/use-toast";
import { Save, X, SmilePlus, ImagePlus, MapPin } from 'lucide-react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PageTransition } from "@/components/animations";
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";

export default function NewEntry() {
  const [, navigate] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const userEmail = localStorage.getItem('userEmail');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Redirect if not logged in
  if (!userEmail) {
    navigate("/auth");
    return null;
  }

  const form = useForm<InsertEntry>({
    resolver: zodResolver(insertEntrySchema),
    defaultValues: {
      title: "",
      content: "",
      mediaUrls: [],
      feeling: null,
      location: null,
      userId: userEmail,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertEntry) => {
      const response = await apiRequest("POST", "/api/entries", {
        ...data,
        userId: userEmail,
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate both the general entries query and the user-specific query
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries", userEmail] });

      toast({
        title: "Success",
        description: "Entry created successfully",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create entry",
        variant: "destructive",
      });
    },
  });

  const onMediaUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

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

  const handleSubmit = form.handleSubmit((data) => {
    console.log("Submitting entry:", { ...data, userId: userEmail });
    mutation.mutate(data);
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-card border-b">
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex-1">
              <Input
                {...form.register("title")}
                className="text-xl font-semibold border-0 px-0 h-auto focus-visible:ring-0 w-full bg-transparent"
                placeholder="Untitled Entry..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <TipTapEditor
              value={form.watch("content")}
              onChange={(value) => form.setValue("content", value)}
            />

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

            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t">
              <div className="flex items-center justify-around px-4 py-2">
                <FeelingSelector
                  selectedFeeling={form.getValues("feeling")}
                  onSelect={(feeling) => form.setValue("feeling", feeling)}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-full hover:bg-muted"
                    >
                      <SmilePlus className="h-6 w-6" />
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
                    </Button>
                  }
                />

                <LocationSelector
                  onSelect={(location) => form.setValue("location", location)}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-full hover:bg-muted"
                    >
                      <MapPin className="h-6 w-6" />
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}