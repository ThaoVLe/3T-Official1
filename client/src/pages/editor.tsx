
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
import { LocationSelector } from "@/components/location-selector";
import { apiRequest } from "@/lib/queryClient";

export default function Editor() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Always declare all hooks at the top level
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempMediaUrls, setTempMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
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

  // Fetch entry data if editing an existing entry
  const { data: entry, isLoading: isLoadingEntry } = useQuery<DiaryEntry>({
    queryKey: ['entries', id],
    queryFn: () => apiRequest(`/api/entries/${id}`),
    enabled: !!id,
  });

  // Create entry mutation
  const createEntry = useMutation({
    mutationFn: (data: InsertEntry) => apiRequest('/api/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      toast({
        title: "Entry created",
        description: "Your diary entry has been saved.",
      });
      navigate('/');
    },
    onError: (error) => {
      console.error("Error creating entry:", error);
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Update entry mutation
  const updateEntry = useMutation({
    mutationFn: (data: InsertEntry) => apiRequest(`/api/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      toast({
        title: "Entry updated",
        description: "Your diary entry has been updated.",
      });
      navigate('/');
    },
    onError: (error) => {
      console.error("Error updating entry:", error);
      toast({
        title: "Error",
        description: "Failed to update entry. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Reset form with entry data when editing
  useEffect(() => {
    if (entry && !isLoadingEntry) {
      console.log("Resetting form with entry:", entry);
      form.reset({
        title: entry.title,
        content: entry.content,
        mediaUrls: entry.mediaUrls || [],
        feeling: entry.feeling,
        location: entry.location,
      });
    }
  }, [entry, isLoadingEntry, form]);

  // Handle form submission
  const onSubmit = async (data: InsertEntry) => {
    setIsSubmitting(true);
    
    try {
      // Include any temporary media URLs that were uploaded during this session
      const allMediaUrls = [...(data.mediaUrls || []), ...tempMediaUrls];
      const formData = { ...data, mediaUrls: allMediaUrls };
      
      if (id) {
        await updateEntry.mutateAsync(formData);
      } else {
        await createEntry.mutateAsync(formData);
      }
    } catch (error) {
      console.error("Error submitting entry:", error);
      setIsSubmitting(false);
    }
  };

  // Handle media upload for the diary entry
  const handleMediaUpload = async (files: File[]) => {
    if (!files.length) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    files.forEach(file => formData.append('media', file));
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // This would ideally include upload progress tracking
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      setTempMediaUrls(prev => [...prev, ...result.urls]);
      
      // Add the media URLs to the form
      const currentUrls = form.getValues('mediaUrls') || [];
      form.setValue('mediaUrls', [...currentUrls, ...result.urls]);
      
      toast({
        title: "Upload complete",
        description: `${files.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error("Error uploading media:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload media. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle media removal
  const handleRemoveMedia = (urlToRemove: string) => {
    const currentUrls = form.getValues('mediaUrls') || [];
    form.setValue(
      'mediaUrls', 
      currentUrls.filter(url => url !== urlToRemove)
    );
    
    // Also remove from temporary URLs if it exists there
    setTempMediaUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
          >
            <X className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">{id ? 'Edit Entry' : 'New Entry'}</h1>
        </div>
        <Button 
          type="submit" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
          <div className="p-4 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
            {/* Left column: Title and content */}
            <div className="space-y-4">
              <Input
                placeholder="Title (optional)"
                {...form.register("title")}
                className="text-xl font-medium"
              />
              
              {/* Content Editor */}
              <TipTapEditor 
                value={form.watch("content")} 
                onChange={(value) => form.setValue("content", value)} 
              />
              
              {/* Media Preview */}
              {form.watch("mediaUrls")?.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-lg font-medium mb-2">Media</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {form.watch("mediaUrls")?.map((url, index) => (
                      <MediaPreview 
                        key={index} 
                        url={url} 
                        onRemove={() => handleRemoveMedia(url)} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column: Media upload, feeling, location */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h2 className="text-lg font-medium mb-2">Add to entry</h2>
                
                {/* Media Recorder */}
                <div className="mb-4">
                  <MediaRecorder 
                    onCapture={handleMediaUpload} 
                    isUploading={isUploading} 
                    progress={uploadProgress} 
                  />
                </div>
                
                {/* Feeling Selector */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">How are you feeling?</h3>
                  <FeelingSelector
                    value={form.watch("feeling")}
                    onChange={(feeling) => form.setValue("feeling", feeling)}
                  />
                </div>
                
                {/* Location Selector */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Add location</h3>
                  <LocationSelector
                    value={form.watch("location")}
                    onChange={(location) => form.setValue("location", location)}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
