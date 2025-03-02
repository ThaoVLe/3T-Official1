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
        description: "Please allow microphone access in your browser settings",
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const validImageTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/heic', 'image/heif'
    ];

    const validVideoTypes = [
      'video/mp4', 'video/quicktime', 'video/x-m4v',  // iOS formats
      'video/webm', 'video/3gpp', 'video/x-matroska'  // Android formats
    ];

    // Convert FileList to Array to process multiple files
    Array.from(files).forEach(file => {
      if ([...validImageTypes, ...validVideoTypes].includes(file.type)) {
        onCapture(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image or video file",
          variant: "destructive"
        });
      }
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
        accept="image/*,video/*"
        className="hidden"
        id="media-upload"
        onChange={handleFileUpload}
        multiple // Enable multiple file selection
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