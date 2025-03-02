import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Mic, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface MediaRecorderProps {
  onCapture: (file: File) => void;
  className?: string;
}

export default function MediaRecorder({ onCapture, className }: MediaRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);

        // Convert to File and capture
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        onCapture(file);

        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/webm',
      'audio/mpeg', 'audio/wav', 'audio/webm'
    ];

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image, video, or audio file",
        variant: "destructive"
      });
      return;
    }

    onCapture(file);
    toast({
      title: "Success",
      description: "File uploaded successfully"
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [isRecording, audioURL]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="file"
        accept="image/*,video/*,audio/*"
        className="hidden"
        id="media-upload"
        onChange={handleFileUpload}
      />

      <label htmlFor="media-upload">
        <Button type="button" variant="outline" size="sm" asChild>
          <span>
            <ImageIcon className="w-4 h-4 mr-2" />
            Upload Media
          </span>
        </Button>
      </label>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={isRecording ? stopRecording : startRecording}
        className={isRecording ? "bg-red-100 hover:bg-red-200" : ""}
      >
        <Mic className={`w-4 h-4 mr-2 ${isRecording ? "text-red-500" : ""}`} />
        {isRecording ? "Stop Recording" : "Record Audio"}
      </Button>
    </div>
  );
}