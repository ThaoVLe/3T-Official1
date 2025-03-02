import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Camera, Video, Square, Upload, FlipHorizontal, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
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

  const checkDeviceSupport = async (type: 'audio' | 'video') => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudio = devices.some(device => device.kind === 'audioinput');
      const hasVideo = devices.some(device => device.kind === 'videoinput');

      if (type === 'audio' && !hasAudio) {
        throw new Error('No microphone found');
      }
      if (type === 'video' && !hasVideo) {
        throw new Error('No camera found');
      }

      return true;
    } catch (err) {
      console.error('Error checking device support:', err);
      return false;
    }
  };

  const startCamera = async () => {
    try {
      const hasCamera = await checkDeviceSupport('video');
      if (!hasCamera) {
        throw new Error('No camera available');
      }

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
      let errorMessage = 'Failed to access camera.';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access was denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found on your device.';
        }
      }
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
      setIsCameraOpen(false);
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
        title: "Success",
        description: "Photo captured successfully"
      });
    }, 'image/jpeg', 0.95);
  };

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      const hasDevice = await checkDeviceSupport(type);
      if (!hasDevice) {
        throw new Error(`No ${type === 'audio' ? 'microphone' : 'camera'} found`);
      }

      // Clear previous recording data
      setRecordedChunks([]);
      stopCurrentStream();

      // Request media access with appropriate constraints
      const constraints = {
        audio: true,
        video: type === 'video' ? { facingMode: "user" } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Create MediaRecorder with basic configuration
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          setRecordedChunks(prev => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        const extension = type === 'audio' ? 'webm' : 'webm';
        const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';

        const blob = new Blob(recordedChunks, { type: mimeType });
        const file = new File([blob], `recording-${Date.now()}.${extension}`, { type: mimeType });

        onCapture(file);
        setRecordedChunks([]);
        stopCurrentStream();

        toast({
          title: "Success",
          description: `${type === 'audio' ? 'Audio' : 'Video'} recording completed`
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
      let errorMessage = 'Failed to start recording.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          errorMessage = `Please allow ${type === 'audio' ? 'microphone' : 'camera'} access in your browser settings.`;
        } else if (err.name === 'NotFoundError') {
          errorMessage = `No ${type === 'audio' ? 'microphone' : 'camera'} found on your device.`;
        }
      }
      toast({
        title: "Recording Error",
        description: errorMessage,
        variant: "destructive"
      });
      stopCurrentStream();
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
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
      title: "Success",
      description: "File uploaded successfully"
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
        <DialogContent className="max-w-none w-screen h-screen p-0 gap-0">
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Camera Controls */}
            <div className="absolute top-4 right-4">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="bg-black/50 hover:bg-black/70 border-white/20"
                onClick={() => setIsCameraOpen(false)}
              >
                <X className="w-6 h-6 text-white" />
              </Button>
            </div>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
              <Button
                type="button"
                size="icon"
                className="w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 border-2 border-white/20"
                onClick={toggleCamera}
              >
                <FlipHorizontal className="w-8 h-8 text-white" />
              </Button>

              <Button
                type="button"
                size="icon"
                className="w-20 h-20 rounded-full bg-white hover:bg-white/90"
                onClick={takePhoto}
              >
                <div className="w-16 h-16 rounded-full border-4 border-black">
                  <div className="w-14 h-14 rounded-full bg-black m-[2px]" />
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}