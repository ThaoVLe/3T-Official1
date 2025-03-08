import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { insertEntrySchema, type InsertEntry } from "@shared/schema";
import TipTapEditor from "@/components/tiptap-editor";
import MediaRecorder from "@/components/media-recorder";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { KeyboardAware } from "@/components/keyboard-aware";
import { PageTransition } from "@/components/animations";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function NewEntryForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

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

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-auto w-full">
            <div className="flex-1 p-4 sm:p-6 w-full max-w-full">
              <TipTapEditor
                value={form.watch("content")}
                onChange={(value) => form.setValue("content", value)}
              />
            </div>

            {/* Media Preview moved here */}
            {form.watch("mediaUrls")?.length > 0 && (
              <div className="p-4 pb-[80px]">
                <MediaPreview
                  urls={form.watch("mediaUrls")}
                  onRemove={(index) => {
                    const currentUrls = form.getValues("mediaUrls") || [];
                    const newUrls = [...currentUrls];
                    newUrls.splice(index, 1);
                    form.setValue("mediaUrls", newUrls);
                  }}
                />
              </div>
            )}

            {/* Media Controls - Now in floating bar */}
            <div 
              className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-2 z-50 floating-bar"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
            >
              <div className="flex items-center justify-between gap-4">
                <FeelingSelector
                  selectedFeeling={form.getValues("feeling")}
                  onSelect={(feeling) => {
                    form.setValue("feeling", feeling);
                  }}
                />

                <MediaRecorder 
                  onCapture={(file) => {
                    const tempUrl = URL.createObjectURL(file);
                    const currentUrls = form.getValues("mediaUrls") || [];
                    form.setValue("mediaUrls", [...currentUrls, tempUrl]);
                  }} 
                />

                <LocationSelector
                  selectedLocation={form.getValues("location")}
                  onSelect={(location) => {
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