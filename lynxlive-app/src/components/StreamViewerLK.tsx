import { useEffect, useRef } from "react";
import { Room, LocalVideoTrack } from "livekit-client";

const serverUrl = import.meta.env.VITE_LIVEKIT_URL as string;
const token = import.meta.env.VITE_LIVEKIT_TOKEN as string;

export default function StreamPublisher() {
  const roomRef = useRef<Room | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const room = new Room();
    roomRef.current = room;

    (async () => {
      try {
        console.log("Connecting to LiveKit:", serverUrl);
        await room.connect(serverUrl, token);
        console.log("Connected to LiveKit");

        // Create an offscreen canvas for decoding frames
        const canvas = document.createElement("canvas");
        // canvas.width = 3840;
        // canvas.height = 2180;
        canvas.width = 1920;
        canvas.height = 1080;
        // canvas.width = 1280;
        // canvas.height = 720;

        // canvas.width = 640;
        // canvas.height = 480;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to create 2D context");
        canvasRef.current = canvas;
        ctxRef.current = ctx;

        // Capture the stream from the canvas
        const stream = canvas.captureStream(30); // 30 FPS
        const [videoTrack] = stream.getVideoTracks();
        const localTrack = new LocalVideoTrack(videoTrack);

        // Publish directly to LiveKit
        await room.localParticipant.publishTrack(videoTrack, {
          name: "lynx_stream",
          simulcast: false,
          videoCodec: "h264",
          videoEncoding: {
            maxBitrate: 100_000_000,
            maxFramerate: 30,
          },
        });

        console.log("Publishing started to LiveKit");

        // Connect to WebSocket
        // const ws = new WebSocket("ws://192.168.1.238:8080"); // RU 5G
        const ws = new WebSocket("ws://192.168.10.182:8080"); // Lynx 5G

        ws.onopen = () => console.log("Connected to WebSocket relay");
        ws.onmessage = async (event) => {
          try {
            const dataText =
              event.data instanceof Blob ? await event.data.text() : event.data;
            const msg = JSON.parse(dataText);

            if (msg.type === "frame" && ctxRef.current && canvasRef.current) {
              const img = new Image();
              img.src = `data:image/jpeg;base64,${msg.data}`;
              img.onload = () => {
                ctxRef.current!.drawImage(
                  img,
                  0,
                  0,
                  canvas.width,
                  canvas.height
                );
              };
            }
          } catch (err) {
            console.error("Invalid frame data:", err);
          }
        };

        ws.onclose = () => console.log("🔌 WebSocket closed");
      } catch (err) {
        console.error("Error:", err);
      }
    })();

    return () => {
      room.disconnect();
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>LiveKit Server: {serverUrl}</h3>
      {/* No canvas or image shown */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ display: "none" }}
      />
    </div>
  );
}
