import React, { useState, useEffect } from 'react';
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
import { Save, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PageTransition } from "@/components/animations";
import { SmilePlus, ImagePlus, MapPin } from 'lucide-react';
import { auth } from "@/lib/firebase";

const NewEntry: React.FC = () => {
  const [feeling, setFeeling] = useState<{ emoji: string; label: string } | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempMediaUrls, setTempMediaUrls] = useState<string[]>([]);
  const [content, setContent] = useState('');

  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/auth");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const form = useForm<InsertEntry>({
    resolver: zodResolver(insertEntrySchema),
    defaultValues: {
      title: "",
      content: "",
      mediaUrls: [],
      feeling: feeling,
      location: location,
      userId: auth.currentUser?.uid || "",
    },
  });

  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: InsertEntry) => {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to create entries");
      }

      const entryData = {
        ...data,
        userId: auth.currentUser.uid,
      };
      await apiRequest("POST", "/api/entries", entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Success",
        description: "Entry created",
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

  return (
    <PageTransition direction={1}>
      <div className="relative min-h-screen">
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
          <div className="flex flex-col bg-white w-full">
            {/* Header */}
            <div className="relative px-4 sm:px-6 py-3 border-b bg-white sticky top-0 z-10 w-full">
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
                  type="submit"
                  size="sm"
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
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 sm:p-6 mb-[72px] overflow-auto">
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

            {/* Floating Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t">
              <div className="flex items-center justify-around px-4 py-2">
                <FeelingSelector
                  selectedFeeling={form.getValues("feeling")}
                  onSelect={(feeling) => {
                    setFeeling(feeling);
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
                    setLocation(location);
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
        </form>
      </div>
    </PageTransition>
  );
};

export default NewEntry;