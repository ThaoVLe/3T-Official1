
import { Edit2, Trash2, Share } from "lucide-react";
import type { DiaryEntry } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useState } from 'react';
import { format } from "date-fns";

// Create API client
import axios from "axios";

const API_BASE_URL = "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiRequest = {
  get: async (url: string) => {
    const response = await apiClient.get(url);
    return response.data;
  },
  post: async (url: string, data: any) => {
    const response = await apiClient.post(url, data);
    return response.data;
  },
  put: async (url: string, data: any) => {
    const response = await apiClient.put(url, data);
    return response.data;
  },
  delete: async (url: string) => {
    const response = await apiClient.delete(url);
    return response.data;
  },
};

// Create query client
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Create toast component
export const useToast = () => {
  return {
    toast: (props: any) => {
      console.log("Toast:", props);
    }
  };
};

interface EntryCardProps {
  entry: DiaryEntry;
  onEdit?: (entry: DiaryEntry) => void;
  onDelete?: (id: number) => void;
}

export const EntryCard = ({ entry, onEdit, onDelete }: EntryCardProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest.delete(`/entries/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      toast({
        title: "Entry deleted",
        description: "Your entry has been deleted successfully."
      });
      if (onDelete) {
        onDelete(entry.id);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not delete entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDelete = () => {
    if (confirmDelete) {
      deleteMutation.mutate(entry.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            {entry.feeling && (
              <span title={entry.feeling.label} className="text-2xl">
                {entry.feeling.emoji}
              </span>
            )}
            <h3 className="text-lg font-medium">
              {format(new Date(entry.createdAt), "PPP")}
            </h3>
          </div>
          {entry.location && (
            <p className="text-sm text-gray-500 mt-1">{entry.location}</p>
          )}
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(entry)}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Edit entry"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className={`p-1 rounded ${
              confirmDelete ? "bg-red-100 text-red-600" : "hover:bg-gray-100"
            }`}
            aria-label="Delete entry"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Share entry"
          >
            <Share className="h-4 w-4" />
          </button>
        </div>
      </div>
      {entry.content && <p className="mt-2">{entry.content}</p>}
      {confirmDelete && (
        <div className="mt-2 text-sm text-red-600">
          Click again to confirm deletion
        </div>
      )}
    </div>
  );
};
