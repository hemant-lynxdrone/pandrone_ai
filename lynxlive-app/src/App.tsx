// import {
//   ControlBar,
//   GridLayout,
//   ParticipantTile,
//   RoomAudioRenderer,
//   useTracks,
//   RoomContext,
// } from "@livekit/components-react";
// import { Room, Track } from "livekit-client";
// import "@livekit/components-styles";
// import { useState, useEffect } from "react";

// const serverUrl = import.meta.env.VITE_LIVEKIT_URL as string;
// const token = import.meta.env.VITE_LIVEKIT_TOKEN as string;

// export default function App() {
//   const [room] = useState(
//     () =>
//       new Room({
//         adaptiveStream: true,
//         dynacast: true,
//       })
//   );

//   useEffect(() => {
//     let mounted = true;
//     const connect = async () => {
//       if (mounted) {
//         console.log(serverUrl, token);
//         await room.connect(serverUrl, token);
//       }
//     };
//     connect();

//     return () => {
//       mounted = false;
//       room.disconnect();
//     };
//   }, [room]);

//   return (
//     <RoomContext.Provider value={room}>
//       <div data-lk-theme="default" style={{ height: "100vh" }}>
//         <MyVideoConference />
//         <RoomAudioRenderer />
//         <ControlBar />
//       </div>
//     </RoomContext.Provider>
//   );
// }

// function MyVideoConference() {
//   const tracks = useTracks(
//     [
//       { source: Track.Source.Camera, withPlaceholder: true },
//       { source: Track.Source.ScreenShare, withPlaceholder: false },
//     ],
//     { onlySubscribed: false }
//   );

//   return (
//     <GridLayout
//       tracks={tracks}
//       style={{ height: "calc(90vh - var(--lk-control-bar-height))" }}
//     >
//       <ParticipantTile />
//     </GridLayout>
//   );
// }
// import StreamViewer from "./components/StreamViewer";

import StreamPublisher from "./components/StreamPublisher";
import StreamViewerLiveKit from "./components/StreamViewerLiveKit";
import StreamViewerLK from "./components/StreamViewerLK";

export default function App() {
  return <StreamPublisher />;
}
