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
    <div className="flex min-h-screen w-full">
      {/* Main Content Column */}
      <div className="flex-1 max-w-3xl px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
            <div className="space-y-4 py-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="text-lg p-3 h-12 w-full"
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
                      <div className="h-[calc(100vh-280px)]">
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
            </div>
          </form>
        </Form>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 shrink-0 border-l bg-background p-6 space-y-6 hidden lg:block">
        <div>
          <h3 className="font-semibold mb-4">Recent Entries</h3>
          <div className="space-y-2">
            {/* We'll implement recent entries list here */}
            <p className="text-sm text-muted-foreground">No recent entries</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Quick Tips</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Use Markdown for formatting</p>
            <p>• Add images and videos</p>
            <p>• Record audio notes</p>
          </div>
        </div>
      </div>
    </div>
  );
}