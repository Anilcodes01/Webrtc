import { useEffect, useState } from "react";

export function Receiver() {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      let pc: RTCPeerConnection | null = null;

      if (message.type === "createOffer") {
        const pc = new RTCPeerConnection();
        pc.setRemoteDescription(message.sdp);

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
          }
        };

        pc.ontrack = (event) => {
          const stream = new MediaStream([event.track]);
          setMediaStream(stream); // Store the stream to play later
        };

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.send(
          JSON.stringify({ type: "createAnswer", sdp: pc.localDescription })
        );
      } else if (message.type === "iceCandidate") {
        if (pc !== null) {
          // @ts-ignore
          pc.addIceCandidate(message.candidate);
        }
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const handlePlay = () => {
    if (videoElement && mediaStream) {
      videoElement.srcObject = mediaStream;
      videoElement.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  };

  return (
    <div>
      <h1>This is receiver</h1>
      <video
        ref={(video) => setVideoElement(video)}
        style={{ width: "500px", height: "300px", border: "1px solid black" }}
        controls
      />
      <button onClick={handlePlay}>Play Video</button>
    </div>
  );
}
