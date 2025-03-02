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

  const requestMicrophonePermission = async () => {
    try {
      const permissionResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });

      if (permissionResult.state === 'granted') {
        return true;
      } else if (permissionResult.state === 'prompt') {
        // This will trigger the browser's permission popup
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } else {
        toast({
          title: "Permission Denied",
          description: "Please allow microphone access in your browser settings",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/mp3' });
        const audioFile = new File([audioBlob], `audio-${Date.now()}.mp3`, { 
          type: 'audio/mp3'
        });

        stream.getTracks().forEach(track => track.stop());
        onCapture(audioFile);
        setIsRecording(false);
      };

      recorder.start(100);
      setIsRecording(true);

    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive"
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const validImageTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/heic', 'image/heif'
    ];

    const validVideoTypes = [
      'video/mp4', 'video/quicktime', 'video/x-m4v',  // iOS formats
      'video/webm', 'video/3gpp', 'video/x-matroska'  // Android formats
    ];

    setIsUploading(true);

    try {
      // Process files sequentially to maintain order
      for (const file of Array.from(files)) {
        if ([...validImageTypes, ...validVideoTypes].includes(file.type)) {
          await onCapture(file);
        } else {
          toast({
            title: "Invalid File Type",
            description: "Please upload an image or video file",
            variant: "destructive"
          });
        }
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