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
import React, { useState, useCallback, useEffect } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { PageTransition } from "@/components/animations";
import { FloatingActionBar } from "@/components/floating-action-bar";

const formatTimeAgo = (currentTime: Date) => {
  const seconds = Math.floor((Date.now() - currentTime.getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
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

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
      }

      const data = await response.json();

      const currentMediaUrls = form.watch('mediaUrls') || [];
      const updatedMediaUrls = [...currentMediaUrls, data.url];
      form.setValue('mediaUrls', updatedMediaUrls);
      console.log("Media URLs after upload:", updatedMediaUrls);

      if (id) {
        const currentValues = form.getValues();
        await apiRequest(`/api/entries/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...currentValues,
            mediaUrls: updatedMediaUrls
          }),
        });
        console.log("Auto-saved entry with new media");
      }

      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading media:', error);
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload media",
        variant: "destructive",
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

  useEffect(() => {
    if (id) {
      const fetchEntry = async () => {
        try {
          const entryData = await apiRequest(`/api/entries/${id}`);
          console.log("Loaded entry data:", entryData);
          const mediaUrls = Array.isArray(entryData.mediaUrls) ? entryData.mediaUrls : [];
          form.reset({
            title: entryData.title,
            content: entryData.content,
            mediaUrls: mediaUrls,
            feeling: entryData.feeling,
            location: entryData.location
          });
          console.log("Form reset with mediaUrls:", form.getValues().mediaUrls);
        } catch (error) {
          console.error('Error fetching entry:', error);
          toast({
            title: "Error",
            description: "Failed to fetch entry",
            variant: "destructive",
          });
          navigate("/");
        }
      };
      fetchEntry();
    } else {
      form.setValue('mediaUrls', []);
    }
  }, [id, form, navigate, toast]);

  return (
    <PageTransition direction={1}>
      <div className={`min-h-screen flex flex-col bg-white w-full ${isExiting ? 'pointer-events-none' : ''}`}>
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

        <div className="flex-1 flex flex-col overflow-auto w-full">
          <div className="flex-1 p-4 sm:p-6 w-full max-w-full">
            <TipTapEditor
              value={form.watch("content")}
              onChange={(value) => form.setValue("content", value)}
            />
          </div>

          {form.watch("mediaUrls")?.length > 0 && (
            <div className="mt-8 flex flex-col gap-4 pb-20">
              <h3 className="text-sm font-medium text-muted-foreground">Attached Media</h3>
              <div className="flex flex-wrap gap-4">
                {form.watch("mediaUrls").map((url, i) => {
                  const isVideo = /\.(mp4|webm|mov|MOV)$/i.test(url);
                  const currentTime = new Date();
                  return (
                    <div
                      key={url}
                      className="relative rounded-md overflow-hidden"
                      style={{ width: 'calc(50% - 10px)' }}
                    >
                      {isVideo ? (
                        <video
                          src={url}
                          className="w-full object-cover"
                          controls
                          playsInline
                          preload="metadata"
                          style={{ aspectRatio: '1/1' }}
                        />
                      ) : (
                        <img
                          src={url}
                          alt={`Media ${i + 1}`}
                          className="w-full object-cover"
                          loading="lazy"
                          style={{ aspectRatio: '1/1' }}
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                        <span className="text-white text-xs">{formatTimeAgo(currentTime)}</span>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => {
                          const newMediaUrls = [...form.watch("mediaUrls")];
                          newMediaUrls.splice(i, 1);
                          form.setValue("mediaUrls", newMediaUrls);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <FloatingActionBar
            onMediaUpload={onMediaUpload}
            onFeelingSelect={(feeling) => {
              hideKeyboard();
              form.setValue("feeling", feeling);
            }}
            onLocationSelect={(location) => {
              hideKeyboard();
              form.setValue("location", location);
            }}
            selectedFeeling={form.watch("feeling")}
            selectedLocation={form.watch("location")}
          />
        </div>
      </div>
    </PageTransition>
  );
}