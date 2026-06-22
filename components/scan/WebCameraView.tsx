import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Platform, StyleSheet, type StyleProp, View, type ViewStyle } from "react-native";
import type { CameraCapturedPicture, CameraPictureOptions } from "expo-camera";

export type WebCameraHandle = {
  getAvailablePictureSizesAsync: () => Promise<string[]>;
  takePictureAsync: (options?: CameraPictureOptions) => Promise<CameraCapturedPicture>;
};

type Props = {
  active: boolean;
  enableTorch?: boolean;
  facing: "back" | "front";
  onCameraReady?: () => void;
  style?: StyleProp<ViewStyle>;
};

const HIGH_QUALITY_SIZES = ["1920x1080", "1600x900", "1280x720", "640x480"];

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

async function requestCameraStream(facing: "back" | "front") {
  const facingMode = facing === "back" ? "environment" : "user";
  const attempts: MediaStreamConstraints[] = [
    {
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30, max: 30 },
      },
    },
    {
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
    { audio: false, video: { facingMode: { ideal: facingMode } } },
    { audio: false, video: true },
  ];

  let lastError: unknown;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Camera unavailable");
}

function captureVideoFrame(
  video: HTMLVideoElement,
  facing: "back" | "front",
  options?: CameraPictureOptions
): CameraCapturedPicture {
  if (video.readyState < video.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) {
    throw new Error("Camera is not ready yet");
  }

  const scale = options?.scale ?? 1;
  const width = Math.max(1, Math.round(video.videoWidth * scale));
  const height = Math.max(1, Math.round(video.videoHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Could not read camera frame");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  if (facing === "front") {
    context.translate(width, 0);
    context.scale(-1, 1);
  }
  context.drawImage(video, 0, 0, width, height);

  const format = options?.imageType === "png" ? "png" : "jpg";
  const mimeType = format === "png" ? "image/png" : "image/jpeg";
  const uri = canvas.toDataURL(mimeType, options?.quality ?? 0.96);

  return {
    base64: options?.base64 ? uri.split(",")[1] ?? "" : undefined,
    format,
    height,
    uri,
    width,
  };
}

const WebCameraView = forwardRef<WebCameraHandle, Props>(function WebCameraView(
  { active, enableTorch = false, facing, onCameraReady, style },
  ref
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useImperativeHandle(ref, () => ({
    getAvailablePictureSizesAsync: async () => HIGH_QUALITY_SIZES,
    takePictureAsync: async (options) => {
      if (!videoRef.current) throw new Error("Camera is not ready yet");
      return captureVideoFrame(videoRef.current, facing, options);
    },
  }), [facing]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    let cancelled = false;

    async function start() {
      stopStream(streamRef.current);
      streamRef.current = null;
      if (!active) return;

      const stream = await requestCameraStream(facing);
      if (cancelled) {
        stopStream(stream);
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (!cancelled) onCameraReady?.();
        };
        await videoRef.current.play().catch(() => undefined);
      }
    }

    start().catch(() => undefined);

    return () => {
      cancelled = true;
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, [active, facing, onCameraReady]);

  useEffect(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track || typeof track.applyConstraints !== "function") return;
    track
      .applyConstraints({ advanced: [{ torch: enableTorch } as MediaTrackConstraintSet] })
      .catch(() => undefined);
  }, [enableTorch]);

  if (Platform.OS !== "web") return <View style={style} />;

  return (
    <View style={[styles.wrapper, style]}>
      {React.createElement("video", {
        autoPlay: true,
        muted: true,
        playsInline: true,
        ref: videoRef,
        style: {
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
          position: "absolute",
          transform: facing === "front" ? "scaleX(-1)" : undefined,
          width: "100%",
        },
      })}
    </View>
  );
});

export default WebCameraView;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#000",
    overflow: "hidden",
  },
});
