import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket server listening on ws://localhost:8080");

wss.on("connection", (ws) => {
  console.log("Client connected (Python or Browser)");

  ws.on("message", (msg) => {
    // Broadcast the message to all other connected clients
    for (const client of wss.clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
