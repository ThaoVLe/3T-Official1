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

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopStream();
    }
  }, [isCameraOpen, facingMode]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const checkMediaRecorderSupport = () => {
    if (!window.MediaRecorder) {
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support media recording.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const requestMediaPermissions = async (type: 'camera' | 'microphone' | 'both') => {
    try {
      const constraints = {
        audio: type === 'microphone' || type === 'both',
        video: type === 'camera' || type === 'both' ? { facingMode } : false
      };

      console.log(`Requesting permissions for ${type}`, constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got media stream:', stream);
      return stream;
    } catch (err) {
      console.error('Permission error:', err);
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          toast({
            title: "Permission Denied",
            description: `Please allow ${type} access in your browser settings.`,
            variant: "destructive"
          });
        } else if (err.name === 'NotFoundError') {
          toast({
            title: "Device Not Found",
            description: `No ${type} found on your device.`,
            variant: "destructive"
          });
        }
      }
      return null;
    }
  };

  const startCamera = async () => {
    const stream = await requestMediaPermissions('camera');
    if (!stream) {
      setIsCameraOpen(false);
      return;
    }

    try {
      stopStream();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to start camera:', err);
      setIsCameraOpen(false);
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

  const startRecording = async (type: 'audio' | 'video') => {
    if (!checkMediaRecorderSupport()) return;

    try {
      console.log(`Starting ${type} recording...`);
      stopStream();
      setRecordedChunks([]);

      const stream = await requestMediaPermissions(type === 'audio' ? 'microphone' : 'both');
      if (!stream) return;

      streamRef.current = stream;
      console.log('Creating MediaRecorder...');
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        console.log('Data available:', e.data.size);
        if (e.data.size > 0) {
          setRecordedChunks(prev => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        console.log('Recording stopped, processing chunks...');
        const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';
        const blob = new Blob(recordedChunks, { type: mimeType });
        const file = new File([blob], `${type}-${Date.now()}.webm`, { type: mimeType });
        onCapture(file);
        setRecordedChunks([]);
        stopStream();
        toast({
          title: "Success",
          description: `${type} recording completed`
        });
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        stopStream();
        setIsRecording(false);
        toast({
          title: "Recording Error",
          description: "An error occurred while recording",
          variant: "destructive"
        });
      };

      console.log('Starting MediaRecorder...');
      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: `${type} recording in progress...`
      });
    } catch (err) {
      console.error('Recording failed:', err);
      stopStream();
      setIsRecording(false);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
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