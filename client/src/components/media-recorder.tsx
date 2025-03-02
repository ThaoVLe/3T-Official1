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
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Audio recording is not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 44100
        }
      });

      // Try different MIME types based on browser support
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `recording-${Date.now()}.webm`, { 
          type: mimeType
        });
        onCapture(file);

        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
        toast({
          title: "Success",
          description: "Audio recording saved"
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
      let errorMessage = "Failed to start recording. ";

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = "Please allow microphone access in your browser settings.";
        } else {
          errorMessage += err.message;
        }
      }

      toast({
        title: "Recording Error",
        description: errorMessage,
        variant: "destructive"
      });
      setIsRecording(false);
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