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
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";
import { useState, useEffect } from 'react';

export default function Editor() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Query for fetching entry data
  const { data: entry, isLoading: isLoadingEntry } = useQuery<DiaryEntry>({
    queryKey: ['/api/entries', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest("GET", `/api/entries/${id}`);
      return response;
    },
    enabled: !!id
  });

  const form = useForm<InsertEntry>({
    resolver: zodResolver(insertEntrySchema),
    defaultValues: {
      title: "",
      content: "",
      mediaUrls: [],
    },
  });

  // Update form when entry data loads
  useEffect(() => {
    if (entry) {
      console.log("Setting form data from entry:", entry);
      form.reset({
        title: entry.title || "",
        content: entry.content || "",
        mediaUrls: Array.isArray(entry.mediaUrls) ? entry.mediaUrls : [],
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Show loading state while fetching entry data
  if (id && isLoadingEntry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-10">
        <Input 
          {...form.register("title")}
          className="text-xl font-semibold border-0 px-0 h-auto focus-visible:ring-0 flex-1 max-w-2xl"
          placeholder="Untitled Entry..."
        />
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/")}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            type="button"
            size="sm"
            onClick={form.handleSubmit((data) => mutation.mutate(data))}
            disabled={mutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-1" />
            {id ? "Update" : "Create"}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="flex-1 p-6">
          <TipTapEditor 
            value={form.watch("content")} 
            onChange={(value) => {
              form.setValue("content", value);
            }} 
          />
        </div>
      </div>
    </div>
  );
}