import { useEffect, useRef } from "react";

export default function StreamViewer() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://192.168.10.182:8080");

    ws.onopen = () => {
      console.log("Connected to WebSocket relay");
    };

    ws.onmessage = async (event) => {
      try {
        let dataText: string;

        // If event.data is a Blob, convert to text first
        if (event.data instanceof Blob) {
          dataText = await event.data.text();
        } else {
          dataText = event.data;
        }

        const msg = JSON.parse(dataText);

        if (msg.type === "frame" && imgRef.current) {
          imgRef.current.src = `data:image/jpeg;base64,${msg.data}`;
        }
      } catch (err) {
        console.error("Invalid frame data:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.log("🔌 WebSocket closed");

    return () => ws.close();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Jetson Stream via Node</h2>
      <img
        ref={imgRef}
        alt="Video Stream"
        style={{ width: "1920px", height: "1080px", border: "1px solid #ccc" }}
      />
    </div>
  );
}
