import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Camera, Video, Square, Upload, FlipHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MediaRecorderProps {
  onCapture: (file: File) => void;
}

export default function MediaRecorder({ onCapture }: MediaRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const stopCurrentStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCurrentStream();
    };
  }, []);

  const startCamera = async () => {
    try {
      stopCurrentStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to start camera:', err);
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    startCamera();
  };

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCurrentStream();
    }
  }, [isCameraOpen]);

  const takePhoto = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
      setIsCameraOpen(false);
      toast({
        title: "Photo Captured",
        description: "Your photo has been taken successfully."
      });
    }, 'image/jpeg', 0.95);
  };

  // Helper function to check MediaRecorder MIME type support
  const getSupportedMimeType = (type: 'audio' | 'video'): string | null => {
    const mimeTypes = type === 'audio' 
      ? ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg']
      : ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];

    return mimeTypes.find(mimeType => MediaRecorder.isTypeSupported(mimeType)) || null;
  };

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      const mimeType = getSupportedMimeType(type);
      if (!mimeType) {
        throw new Error(`${type} recording is not supported in this browser`);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });

      const options: MediaRecorderOptions = { mimeType };
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          setRecordedChunks(chunks => [...chunks, e.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: mimeType });
        const file = new File([blob], `recording-${Date.now()}.${mimeType.includes('webm') ? 'webm' : 'mp4'}`, { type: mimeType });
        onCapture(file);
        setRecordedChunks([]);
        stream.getTracks().forEach(track => track.stop());

        toast({
          title: "Recording Complete",
          description: `Your ${type} has been recorded successfully.`
        });
      };

      recorder.start(1000); // Record in 1-second chunks
      setMediaRecorder(recorder);
      setIsRecording(true);

      toast({
        title: "Recording Started",
        description: `${type === 'audio' ? 'Audio' : 'Video'} recording in progress...`
      });
    } catch (err) {
      console.error('Recording failed:', err);
      toast({
        title: "Recording Error",
        description: err instanceof Error ? err.message : `Failed to start ${type} recording. Please check your permissions.`,
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/webm'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image, video, or audio file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 50MB.",
        variant: "destructive"
      });
      return;
    }

    onCapture(file);
    toast({
      title: "File Uploaded",
      description: "Your file has been uploaded successfully."
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          type="file"
          accept="image/*,video/*,audio/*"
          className="hidden"
          id="media-upload"
          onChange={handleFileUpload}
        />

        <label htmlFor="media-upload">
          <Button type="button" variant="outline" asChild>
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </span>
          </Button>
        </label>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsCameraOpen(true)}
          disabled={isRecording}
        >
          <Camera className="w-4 h-4 mr-2" />
          Take Photo
        </Button>

        {!isRecording ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => startRecording('audio')}
            >
              <Mic className="w-4 h-4 mr-2" />
              Record Audio
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => startRecording('video')}
            >
              <Video className="w-4 h-4 mr-2" />
              Record Video
            </Button>
          </>
        ) : (
          <Button 
            type="button" 
            variant="destructive" 
            onClick={stopRecording}
            className="animate-pulse"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        )}
      </div>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Take Photo</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="bg-white"
                onClick={toggleCamera}
              >
                <FlipHorizontal className="w-6 h-6" />
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={takePhoto}
                className="bg-white hover:bg-white/90"
              >
                <Camera className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}