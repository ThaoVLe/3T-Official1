import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from "wouter";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getEntry, updateEntry } from '../shared/api/entries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PageTransition } from '@/components/animations';
import { MapPin } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  location: z.string().optional(),
  media: z.array(z.string()).optional(),
});

export default function EditEntry() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      location: undefined,
      media: [],
    },
  });

  // Fetch entry data
  useEffect(() => {
    if (!id) return;

    async function fetchEntry() {
      try {
        setLoading(true);
        const data = await getEntry(id);
        form.reset({
          title: data.title,
          content: data.content,
          location: data.location,
          media: data.mediaUrls || [],
        });
      } catch (err) {
        console.error('Failed to fetch entry:', err);
        setError('Failed to load journal entry');
      } finally {
        setLoading(false);
      }
    }

    fetchEntry();
  }, [id, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!id) return;

    try {
      await updateEntry(id, values);
      toast({
        title: "Entry updated",
        description: "Your journal entry has been updated.",
      });
      navigate(`/entries/${id}`);
    } catch (error) {
      console.error("Failed to update entry:", error);
      toast({
        title: "Error",
        description: "Failed to update your entry. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <Button onClick={() => navigate('/home')} className="mt-4">
          Go back to home
        </Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Entry</h1>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              placeholder="Title"
              {...form.register("title")}
              className="text-2xl font-semibold"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Textarea
              placeholder="What's on your mind today?"
              {...form.register("content")}
              className="min-h-[300px]"
            />
            {form.formState.errors.content && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = `/entries/${id}`}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                onClick={(e) => {
                  if (form.formState.isSubmitting) e.preventDefault(); // Prevent double submission
                }}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}