import { useEffect, useRef } from "react";
import { Room, createLocalVideoTrack } from "livekit-client";

const serverUrl = import.meta.env.VITE_LIVEKIT_URL as string;
const token = import.meta.env.VITE_LIVEKIT_TOKEN as string;

export default function StreamPublisher() {
  const roomRef = useRef<Room | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const room = new Room();
    roomRef.current = room;

    (async () => {
      try {
        console.log("Connecting to LiveKit:", serverUrl);
        await room.connect(serverUrl, token);
        console.log("Connected to LiveKit");

        // Access the local webcam
        const localTrack = await createLocalVideoTrack({
          deviceId: undefined,
          resolution: { width: 1920, height: 1080 },
          facingMode: "user",
        });

        // Show video locally
        const element = videoRef.current;
        if (element) localTrack.attach(element);

        // Publish to LiveKit
        await room.localParticipant.publishTrack(localTrack, {
          name: "usb_camera_stream",
          simulcast: false,
          videoCodec: "h264",
          degradationPreference: "maintain-resolution",
          videoEncoding: {
            maxBitrate: 25_000_000,
            maxFramerate: 30,
          },
        });
      } catch (err) {
        console.error("Error:", err);
      }
    })();

    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "640px",
          borderRadius: "8px",
          border: "2px solid #333",
        }}
      />
    </div>
  );
}
