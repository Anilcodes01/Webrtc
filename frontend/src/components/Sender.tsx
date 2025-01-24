import { useEffect, useState } from "react";

export function Sender() {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
  }, []);

  async function startSendingVideo() {
    if (!socket) return;
    // create an offer
    const pc = new RTCPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket?.send(
      JSON.stringify({ type: "createOffer", sdp: pc.localDescription })
    );

    // catch the answer from browser 2

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "createAnswer") {
        pc.setRemoteDescription(data.sdp);
      }
    };
  }

  return (
    <div>
      This is Sender
      <button onClick={startSendingVideo}>Send video</button>
    </div>
  );
}
