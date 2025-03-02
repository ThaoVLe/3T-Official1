import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertEntrySchema, type DiaryEntry, type InsertEntry } from "@shared/schema";
import TipTapEditor from "@/components/tiptap-editor";
import MediaRecorder from "@/components/media-recorder";
import MediaPreview from "@/components/media-preview";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, VideoCamera, Save, X } from "lucide-react";

export default function Editor() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: entry } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !!id,
  });

  const form = useForm<InsertEntry>({
    resolver: zodResolver(insertEntrySchema),
    defaultValues: {
      title: entry?.title || "",
      content: entry?.content || "",
      mediaUrls: entry?.mediaUrls || [],
    },
  });

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

  const onSubmit = (data: InsertEntry) => {
    mutation.mutate(data);
  };

  const onMediaUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const { url } = await res.json();
    const currentUrls = form.getValues("mediaUrls") || [];
    form.setValue("mediaUrls", [...currentUrls, url]);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-1 max-w-2xl">
              <FormControl>
                <Input 
                  {...field} 
                  className="text-xl font-semibold border-0 px-0 h-auto focus-visible:ring-0"
                  placeholder="Untitled Entry..."
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/")}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            type="submit"
            size="sm"
            onClick={form.handleSubmit(onSubmit)}
            disabled={mutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {id ? "Update" : "Create"} Entry
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Form {...form}>
          <form className="flex-1 flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex-1 flex flex-col max-w-full px-6 py-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <TipTapEditor value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Media Controls */}
            <div className="border-t bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-4 max-w-2xl">
                <MediaRecorder onCapture={onMediaUpload} />
              </div>
              <div className="mt-4">
                <MediaPreview urls={form.watch("mediaUrls")} />
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}