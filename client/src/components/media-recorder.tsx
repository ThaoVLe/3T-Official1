import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { UploadCloud, Mic, Video, Camera } from "lucide-react";
import MediaPreview from "./media-preview";

export interface MediaFile {
  url: string;
  type: string;
}

interface MediaRecorderProps {
  onMediaCaptured: (file: MediaFile) => void;
  onCancel: () => void;
}

export default function MediaRecorder({
  onMediaCaptured,
  onCancel,
}: MediaRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to get supported MIME types
  const getSupportedMimeType = (types: string[]) => {
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return null;
  };

  const startRecording = async (audioOnly = false) => {
    setError(null);
    try {
      // Clear previous media if any
      stopMediaTracks();
      chunksRef.current = [];

      const constraints = audioOnly 
        ? { audio: true } 
        : { audio: true, video: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Find supported MIME types
      const mimeType = audioOnly 
        ? getSupportedMimeType(['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav']) 
        : getSupportedMimeType(['video/webm', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=h264']);

      if (!mimeType) {
        throw new Error("No supported MIME type found for this browser");
      }

      const options = { mimeType };
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setMediaFile({
          url,
          type: audioOnly ? 'audio' : 'video'
        });
        setRecording(false);
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError("An error occurred while recording.");
        setRecording(false);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(`Failed to start recording. ${err instanceof Error ? err.message : "Please make sure you've granted permission to use your camera/microphone."}`);
      stopMediaTracks();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image, video or audio
    if (!/^(image|video|audio)\//.test(file.type)) {
      setError("Please select an image, video, or audio file.");
      return;
    }

    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('image/') 
      ? 'image' 
      : file.type.startsWith('video/') 
        ? 'video' 
        : 'audio';

    setMediaFile({ url, type });
  };

  const takePhoto = async () => {
    setError(null);
    try {
      // Clear previous media if any
      stopMediaTracks();

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      // Create a video element to capture the frame
      const video = document.createElement('video');
      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();

        // Create a canvas to draw the video frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError("Failed to create canvas context");
          return;
        }

        // Draw the current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            setError("Failed to capture photo");
            return;
          }

          const url = URL.createObjectURL(blob);
          setMediaFile({ url, type: 'image' });

          // Stop the camera stream
          stopMediaTracks();
        }, 'image/jpeg', 0.95);
      };
    } catch (err) {
      console.error("Error taking photo:", err);
      setError(`Failed to take photo. ${err instanceof Error ? err.message : "Please make sure you've granted permission to use your camera."}`);
      stopMediaTracks();
    }
  };

  const handleSubmit = () => {
    if (mediaFile) {
      onMediaCaptured(mediaFile);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p><strong>Recording Error:</strong> {error}</p>
        </div>
      )}

      {mediaFile ? (
        <>
          <MediaPreview media={mediaFile} />
          <div className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => {
              setMediaFile(null);
              setError(null);
            }}>
              Retake
            </Button>
            <Button onClick={handleSubmit}>Use this</Button>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-4 w-4" />
              Upload Media
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={takePhoto}
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
            <Button 
              variant={recording && !mediaRecorderRef.current?.mimeType.includes('video') ? "destructive" : "outline"}
              className="flex items-center gap-2"
              onClick={() => {
                if (recording && mediaRecorderRef.current?.mimeType.includes('audio') && !mediaRecorderRef.current?.mimeType.includes('video')) {
                  stopRecording();
                } else {
                  startRecording(true);
                }
              }}
            >
              <Mic className="h-4 w-4" />
              {recording && mediaRecorderRef.current?.mimeType.includes('audio') && !mediaRecorderRef.current?.mimeType.includes('video') 
                ? "Stop Recording" 
                : "Record Audio"}
            </Button>
            <Button 
              variant={recording && mediaRecorderRef.current?.mimeType.includes('video') ? "destructive" : "outline"}
              className="flex items-center gap-2"
              onClick={() => {
                if (recording && mediaRecorderRef.current?.mimeType.includes('video')) {
                  stopRecording();
                } else {
                  startRecording(false);
                }
              }}
            >
              <Video className="h-4 w-4" />
              {recording && mediaRecorderRef.current?.mimeType.includes('video') 
                ? "Stop Recording" 
                : "Record Video"}
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*,audio/*"
            onChange={handleFileUpload}
          />

          <div className="flex justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}