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

  const getMimeType = (type: 'audio' | 'video'): string => {
    const options = {
      audio: ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'],
      video: ['video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8', 'video/webm']
    };

    const supported = options[type].find(mimeType => {
      try {
        return MediaRecorder.isTypeSupported(mimeType);
      } catch {
        return false;
      }
    });

    if (!supported) {
      throw new Error(`No supported ${type} recording MIME type found in this browser`);
    }

    return supported;
  };

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      let mimeType: string;
      try {
        mimeType = getMimeType(type);
      } catch (err) {
        toast({
          title: "Recording Error",
          description: err instanceof Error ? err.message : `${type} recording is not supported in this browser`,
          variant: "destructive"
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video' ? { facingMode: "user" } : false
      });

      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks(chunks => [...chunks, e.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: mimeType });
        const extension = mimeType.includes('webm') ? 'webm' : 'ogg';
        const file = new File([blob], `recording-${Date.now()}.${extension}`, { type: mimeType });
        onCapture(file);
        setRecordedChunks([]);
        stopCurrentStream();

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
      stopCurrentStream();
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check your camera/microphone permissions.",
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