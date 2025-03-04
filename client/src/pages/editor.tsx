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
import React, { useState } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";


export default function Editor() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempMediaUrls, setTempMediaUrls] = useState<string[]>([]);

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
      feeling: "", // Added feeling field to default values
    },
  });

  React.useEffect(() => {
    if (entry) {
      form.reset({
        title: entry.title,
        content: entry.content,
        mediaUrls: entry.mediaUrls || [],
        feeling: entry.feeling, // Ensure feeling is loaded from entry data
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

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-auto w-full">
        <div className="flex-1 p-4 sm:p-6 w-full max-w-full">
          <TipTapEditor 
            value={form.watch("content")} 
            onChange={(value) => form.setValue("content", value)} 
          />
        </div>

        {/* Media Controls - Fixed at bottom */}
        <div className="border-t bg-white sticky bottom-0 w-full">
          <div className="px-4 sm:px-6 py-3 flex items-center gap-4">
            <MediaRecorder onCapture={onMediaUpload} />
            <FeelingSelector 
              selectedFeeling={form.getValues("feeling")}
              onSelect={(feeling) => form.setValue("feeling", feeling)}
            />
          </div>
          {form.watch("mediaUrls")?.length > 0 && (
            <div className="px-4 sm:px-6 pt-2 pb-4 overflow-x-auto">
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
    </div>
  );
}