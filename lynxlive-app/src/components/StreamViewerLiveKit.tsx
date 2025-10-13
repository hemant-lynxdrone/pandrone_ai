import { useEffect, useRef } from "react";
import { Room, LocalVideoTrack } from "livekit-client";

const serverUrl = import.meta.env.VITE_LIVEKIT_URL as string;
const token = import.meta.env.VITE_LIVEKIT_TOKEN as string;

export default function StreamViewer() {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    // ---- CONNECT TO LIVEKIT ----
    const room = new Room();
    roomRef.current = room;

    (async () => {
      try {
        console.log("Connecting to LiveKit:", serverUrl);
        await room.connect(serverUrl, token);
        console.log("Connected to LiveKit");

        // prepare to publish video later
      } catch (err) {
        console.error("LiveKit connection failed:", err);
      }
    })();

    // ---- CONNECT TO WEBSOCKET RELAY ----
    const ws = new WebSocket("ws://192.168.1.238:8080"); // RU 5G

    // const ws = new WebSocket("ws://192.168.10.182:8080"); // Lynx 5G

    ws.onopen = () => console.log("Connected to WebSocket relay");

    ws.onmessage = async (event) => {
      try {
        let dataText: string;
        if (event.data instanceof Blob) {
          dataText = await event.data.text();
        } else {
          dataText = event.data;
        }

        const msg = JSON.parse(dataText);

        if (msg.type === "frame" && imgRef.current && canvasRef.current) {
          // Display frame in <img>
          imgRef.current.src = `data:image/jpeg;base64,${msg.data}`;

          // Draw frame to canvas
          const ctx = canvasRef.current.getContext("2d");
          const img = new Image();
          img.src = imgRef.current.src;
          img.onload = () => {
            ctx?.drawImage(
              img,
              0,
              0,
              canvasRef.current!.width,
              canvasRef.current!.height
            );
          };
        }
      } catch (err) {
        console.error("Invalid frame data:", err);
      }
    };

    return () => {
      ws.close();
      room.disconnect();
    };
  }, []);

  // ---- PUBLISH CANVAS TO LIVEKIT ----
  useEffect(() => {
    const startPublishing = async () => {
      const room = roomRef.current;
      if (!room) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const stream = canvas.captureStream(30); // 30 FPS
      const [videoTrack] = stream.getVideoTracks();

      const localTrack = new LocalVideoTrack(videoTrack);
      await room.localParticipant.publishTrack(localTrack);
      //   console.log("Canvas stream published to LiveKit");
    };

    // wait 3 seconds for connection
    const t = setTimeout(startPublishing, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>{serverUrl}</h3>
      <img ref={imgRef} width={640} height={480} />
      <canvas
        ref={canvasRef}
        width={3840}
        height={2180}
        style={{ display: "none" }}
      />
      {/* <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{ display: "none" }}
      /> */}
    </div>
  );
}
