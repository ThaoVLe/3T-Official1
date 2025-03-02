import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Camera, Video, Square, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaRecorderProps {
  onCapture: (file: File) => void;
}

export default function MediaRecorder({ onCapture }: MediaRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<string>('');
  const { toast } = useToast();

  const checkPermissions = async (type: 'audio' | 'video') => {
    try {
      const result = await navigator.permissions.query({ 
        name: type === 'audio' ? 'microphone' as PermissionName : 'camera' as PermissionName 
      });
      setPermissionStatus(result.state);
      return result.state === 'granted';
    } catch (err) {
      console.error('Permission check failed:', err);
      return false;
    }
  };

  const requestPermissions = async (type: 'audio' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: type === 'audio',
        video: type === 'video' ? { facingMode: "user" } : false,
      });
      return stream;
    } catch (err) {
      console.error('Permission request failed:', err);
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          toast({
            title: "Permission Denied",
            description: `Please allow access to your ${type === 'audio' ? 'microphone' : 'camera'} in your browser settings.`,
            variant: "destructive"
          });
        } else if (err.name === 'NotFoundError') {
          toast({
            title: "Device Not Found",
            description: `No ${type === 'audio' ? 'microphone' : 'camera'} found on your device.`,
            variant: "destructive"
          });
        }
      }
      throw err;
    }
  };

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      // First check if we have permission
      await checkPermissions(type);

      // Request permissions and get stream
      const stream = await requestPermissions(type);

      // Create and configure MediaRecorder
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks((chunks) => [...chunks, e.data]);
        }
      };

      recorder.onstop = () => {
        const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';
        const blob = new Blob(recordedChunks, { type: mimeType });
        const file = new File([blob], `recording.${type === 'audio' ? 'webm' : 'webm'}`, {
          type: mimeType,
        });
        onCapture(file);
        setRecordedChunks([]);

        // Show success message
        toast({
          title: "Recording Complete",
          description: `Your ${type} has been recorded successfully.`
        });
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);

      // Show recording started message
      toast({
        title: "Recording Started",
        description: `${type === 'audio' ? 'Audio' : 'Video'} recording in progress...`
      });

    } catch (err) {
      // Error handling is done in requestPermissions
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const takePhoto = async () => {
    try {
      await checkPermissions('video');
      const stream = await requestPermissions('video');

      // Create video element to capture the frame
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Create canvas to draw the video frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current frame
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(video, 0, 0);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
      });

      // Create file and capture
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);

      // Cleanup
      stream.getTracks().forEach(track => track.stop());

      toast({
        title: "Photo Captured",
        description: "Your photo has been taken successfully."
      });

    } catch (err) {
      // Error handling is done in requestPermissions
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/webm'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image, video, or audio file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (50MB max)
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
          onClick={takePhoto}
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
    </div>
  );
}