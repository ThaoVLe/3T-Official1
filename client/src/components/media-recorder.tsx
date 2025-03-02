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

  const startRecording = async (type: "audio" | "video") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
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
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="image-upload"
        onChange={handleImageUpload}
      />
      <label htmlFor="image-upload">
        <Button type="button" variant="outline" asChild>
          <span>
            <Camera className="w-4 h-4 mr-2" />
            Add Image
          </span>
        </Button>
      </label>

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
  );
}
