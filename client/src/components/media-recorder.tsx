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

  // Cleanup function
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  // Handle camera effects
  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopStream();
    }
  }, [isCameraOpen, facingMode]);

  const startCamera = async () => {
    try {
      stopStream();

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser");
      }

      const constraints = {
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays on mobile devices
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraOpen(false);

      let message = "Failed to access camera. Please check permissions.";
      if (err instanceof Error) {
        message = err.message;
      } else if (err instanceof DOMException && err.name === 'NotAllowedError') {
        message = "Camera access denied. Please enable camera permissions in your browser settings.";
      }

      toast({
        title: "Camera Error",
        description: message,
        variant: "destructive"
      });
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
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

  const getSupportedMimeType = (type: 'audio' | 'video'): string => {
    const mimeTypes = type === 'audio' 
      ? ['audio/webm;codecs=opus', 'audio/webm']
      : ['video/webm;codecs=vp8,opus', 'video/webm'];

    //Removed MediaRecorder.isTypeSupported check - it's unreliable across browsers.  The MediaRecorder will throw an error if the mimeType isn't supported.

    return mimeTypes[0]; //Return the first mimeType in the list.

  };

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder is not supported in this browser");
      }

      stopStream();
      setRecordedChunks([]);

      // Get supported MIME type
      const mimeType = getSupportedMimeType(type);

      // Request permissions with appropriate constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video' ? { facingMode } : false
      });

      streamRef.current = stream;

      // Create MediaRecorder with supported MIME type
      const recorder = new MediaRecorder(stream, { mimeType });
      setMediaRecorder(recorder);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks(prev => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: mimeType });
        const extension = 'webm';
        const file = new File([blob], `${type}-${Date.now()}.${extension}`, { type: mimeType });

        onCapture(file);
        setRecordedChunks([]);
        stopStream();
        setMediaRecorder(null);
        setIsRecording(false);

        toast({
          title: "Success",
          description: `${type} recording completed`
        });
      };

      // Start recording with smaller chunks for better handling
      recorder.start(200);
      setIsRecording(true);

      toast({
        title: "Recording Started",
        description: `${type} recording in progress...`
      });

    } catch (err) {
      console.error('Recording failed:', err);
      stopStream();
      setMediaRecorder(null);
      setIsRecording(false);

      let message = "Failed to start recording";
      if (err instanceof Error) {
        message = err.message;
      } else if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          message = `Please allow ${type === 'audio' ? 'microphone' : 'camera/microphone'} access in your browser settings`;
        } else if (err.name === 'NotFoundError') {
          message = `No ${type === 'audio' ? 'microphone' : 'camera/microphone'} found`;
        }
      }

      toast({
        title: "Recording Error",
        description: message,
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
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

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
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