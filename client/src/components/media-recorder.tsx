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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices?.getUserMedia) {
      toast({
        title: "Error",
        description: "Audio recording is not supported in your browser",
        variant: "destructive"
      });
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      // Initialize recorder with basic configuration
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      // Handle data as it becomes available
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording completion
      recorder.onstop = () => {
        try {
          const audioBlob = new Blob(chunksRef.current);
          const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, {
            type: "audio/webm"
          });

          // Stop tracks and clean up
          stream.getTracks().forEach(track => track.stop());
          onCapture(audioFile);

          // Reset state
          setIsRecording(false);
          mediaRecorderRef.current = null;
          chunksRef.current = [];

        } catch (error) {
          console.error('Error creating audio file:', error);
          toast({
            title: "Error",
            description: "Failed to save the recording",
            variant: "destructive"
          });
        }
      };

      // Start recording with 1 second timeslices
      recorder.start(1000);
      setIsRecording(true);

    } catch (error) {
      console.error('Recording error:', error);
      let message = "Failed to start recording. ";

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          message = "Please allow microphone access in your browser settings.";
        }
      }

      toast({
        title: "Recording Error",
        description: message,
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
        accept="image/*,video/*,audio/*"
        className="hidden"
        id="media-upload"
        onChange={handleFileUpload}
      />

      <div className="flex gap-2">
        <label htmlFor="media-upload">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="h-9 w-9"
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
        >
          <Mic className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}