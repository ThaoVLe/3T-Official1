import React, { useState, useCallback } from 'react';
import { FeelingSelector } from "@/components/feeling-selector";
import { LocationSelector } from "@/components/location-selector";
import { TipTapEditor } from "@/components/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Camera, Image as ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";

// Simulate useIsMobile hook - replace with actual implementation
const useIsMobile = () => {
  return window.innerWidth < 768;
};

const formSchema = z.object({
  title: z.string(),
  content: z.string(),
  feeling: z.string().optional(),
  location: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditorPage() {
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeelingOpen, setIsFeelingOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      feeling: "",
      location: "",
      images: [],
    },
  });

  const handleSave = useCallback(async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Simulate API call
      console.log("Saving entry:", values);

      // Navigate to home after save
      setTimeout(() => {
        setLocation("/");
      }, 500);

    } catch (error) {
      console.error("Error saving entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [setLocation]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImages((prev) => [...prev, base64]);
        form.setValue("images", [...(form.getValues("images") || []), base64]);
      };
      reader.readAsDataURL(file);
    }
  }, [form]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <div className="bg-white py-2 px-4 border-b border-border flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/")}
        >
          Cancel
        </Button>
        <div className="text-sm font-medium">
          {format(new Date(), "EEEE, MMMM d")}
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          onClick={form.handleSubmit(handleSave)}
        >
          {isSubmitting ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col w-full">
        <div className="flex-1 p-4 sm:p-6 w-full max-w-full overflow-y-auto no-scrollbar">
          <TipTapEditor
            value={form.watch("content")}
            onChange={(value) => form.setValue("content", value)}
          />

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img 
                    src={image} 
                    alt={`Uploaded ${index}`} 
                    className="object-cover w-full h-full rounded-md"
                  />
                </div>
              ))}
            </div>
          )}

          {(isFeelingOpen || isLocationOpen) && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center pb-4">
              {isFeelingOpen && (
                <FeelingSelector 
                  onSelect={(feeling) => {
                    form.setValue("feeling", feeling);
                    setIsFeelingOpen(false);
                  }}
                  onClose={() => setIsFeelingOpen(false)}
                />
              )}
              {isLocationOpen && (
                <LocationSelector 
                  onSelect={(location) => {
                    form.setValue("location", location);
                    setIsLocationOpen(false);
                  }}
                  onClose={() => setIsLocationOpen(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}