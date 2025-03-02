
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Camera, Video, Square } from "lucide-react";

interface MediaRecorderProps {
  onCapture: (file: File) => void;
}

export default function MediaRecorder({ onCapture }: MediaRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startRecording = async (type: "audio" | "video") => {
    try {
      // Reset any previous error message
      setErrorMessage(null);
      
      // Request permissions for audio/video
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video" ? { facingMode: "user" } : false,
      });

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks((chunks) => [...chunks, e.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, {
          type: type === "audio" ? "audio/webm" : "video/webm",
        });
        const file = new File([blob], `recording.${type === "audio" ? "webm" : "webm"}`, {
          type: blob.type,
        });
        onCapture(file);
        setRecordedChunks([]);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setErrorMessage("Could not access camera/microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const takePhoto = async () => {
    try {
      // Reset any previous error message
      setErrorMessage(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      
      // Create a video element to capture the frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Wait for the video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = () => {
          resolve(null);
        };
      });
      
      // Create a canvas to draw the video frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current frame to the canvas
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to a blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/jpeg', 0.95);
      });
      
      // Create a file from the blob
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      
      // Send the file to the parent component
      onCapture(file);
      
    } catch (err) {
      console.error("Error accessing camera:", err);
      setErrorMessage("Could not access camera. Please check your permissions.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  return (
    <div className="space-y-2">
      {errorMessage && (
        <div className="p-2 text-sm text-red-500 bg-red-50 rounded-md">
          {errorMessage}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        <input
          type="file"
          accept="image/*,video/*"
          className="hidden"
          id="media-upload"
          onChange={handleImageUpload}
        />
        
        <label htmlFor="media-upload">
          <Button type="button" variant="outline" asChild>
            <span>
              <Camera className="w-4 h-4 mr-2" />
              Upload Media
            </span>
          </Button>
        </label>

        <Button
          type="button"
          variant="outline"
          onClick={takePhoto}
        >
          <Camera className="w-4 h-4 mr-2" />
          Take Photo
        </Button>

        {!isRecording ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => startRecording("audio")}
            >
              <Mic className="w-4 h-4 mr-2" />
              Record Audio
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => startRecording("video")}
            >
              <Video className="w-4 h-4 mr-2" />
              Record Video
            </Button>
          </>
        ) : (
          <Button type="button" variant="destructive" onClick={stopRecording}>
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        )}
      </div>
    </div>
  );
}
