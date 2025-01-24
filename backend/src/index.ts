import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: any = null;
let receiverSocket: any = null;

wss.on("connection", function connection(ws) {
  ws.on("message", function message(data: any) {
    const message = JSON.parse(data);

    if (message.type === "identify-as-sender") {
      senderSocket = ws;
    } else if (message.type === "identify-as-receiver") {
      receiverSocket = ws;
    } else if (message.type === "create-offer") {
      receiverSocket.sender(
        JSON.stringify({ type: "offer", offer: message.offer })
      );
    } else if (message.type === "create-answer") {
      senderSocket.sender(
        JSON.stringify({ type: "offer", offer: message.offer })
      );
    } 
    console.log(message);
  });
});
