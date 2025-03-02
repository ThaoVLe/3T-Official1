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
    <div className="h-screen w-full p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">Title</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="text-lg p-3 h-12"
                    placeholder="Give your entry a title..."
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-lg font-medium">Content</FormLabel>
                <FormControl>
                  <div className="h-full">
                    <TipTapEditor value={field.value} onChange={field.onChange} />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <MediaRecorder onCapture={onMediaUpload} />
            <MediaPreview urls={form.watch("mediaUrls")} />
          </div>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              size="lg"
              className="px-6"
            >
              {id ? "Update" : "Create"} Entry
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate("/")}
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}