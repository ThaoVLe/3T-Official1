import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaRecorderProps {
  onCapture: (file: File) => void;
  className?: string;
}

export default function MediaRecorder({ onCapture, className }: MediaRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Create recorder with basic configuration
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        try {
          const audioBlob = new Blob(chunksRef.current);
          const audioFile = new File([audioBlob], `recording-${Date.now()}.mp3`, {
            type: "audio/mp3"
          });

          // Clean up
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
          onCapture(audioFile);

        } catch (error) {
          console.error('Error creating audio file:', error);
          toast({
            title: "Error",
            description: "Failed to save the recording",
            variant: "destructive"
          });
        }
      };

      // Start recording
      recorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Microphone Required",
        description: "Please allow microphone access to record audio",
        variant: "destructive"
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    try {
      // Process files sequentially to maintain order
      for (const file of Array.from(files)) {
        await onCapture(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="file"
        accept="image/*,video/*"
        className="hidden"
        id="media-upload"
        onChange={handleFileUpload}
        multiple
      />

      <div className="flex gap-2">
        <label htmlFor="media-upload">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="h-9 w-9"
            disabled={isUploading}
            asChild
          >
            <span>
              <ImageIcon className="h-5 w-5" />
            </span>
          </Button>
        </label>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-9 w-9 ${isRecording ? "text-red-500" : ""}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isUploading}
        >
          <Mic className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}