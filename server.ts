import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { prisma } from "./src/lib/prisma";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface Client {
  ws: WebSocket;
  userId: string;
}

interface WebSocketMessage {
  type: "auth" | "message" | "typing" | "read";
  userId?: string;
  content?: string;
  receiverId?: string;
  messageId?: string;
  senderId?: string;
}

const clients = new Map<string, Client>();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // Create WebSocket server
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrade
  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url!, true);

    if (pathname === "/api/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", (ws: WebSocket) => {
    console.log("New WebSocket connection");
    let clientUserId: string | null = null;

    ws.on("message", async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());

        switch (message.type) {
          case "auth":
            if (message.userId) {
              clientUserId = message.userId;
              clients.set(message.userId, { ws, userId: message.userId });
              console.log(`User ${message.userId} authenticated via WebSocket`);

              ws.send(
                JSON.stringify({
                  type: "auth_success",
                  userId: message.userId,
                })
              );
            }
            break;

          case "message":
            if (message.content && message.receiverId && clientUserId) {
              const savedMessage = await prisma.message.create({
                data: {
                  content: message.content,
                  senderId: clientUserId,
                  receiverId: message.receiverId,
                },
                include: {
                  sender: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      image: true,
                    },
                  },
                },
              });

              // Send to receiver if online
              const receiverClient = clients.get(message.receiverId);
              if (receiverClient) {
                receiverClient.ws.send(
                  JSON.stringify({
                    type: "message",
                    message: savedMessage,
                  })
                );
              }
            }
            break;

          case "typing":
            if (message.receiverId) {
              const receiverClient = clients.get(message.receiverId);
              if (receiverClient) {
                receiverClient.ws.send(
                  JSON.stringify({
                    type: "typing",
                    senderId: clientUserId,
                  })
                );
              }
            }
            break;

          case "read":
            if (message.messageId && clientUserId) {
              await prisma.message.update({
                where: { id: message.messageId },
                data: { read: true },
              });

              const senderClient = clients.get(message.senderId || "");
              if (senderClient) {
                senderClient.ws.send(
                  JSON.stringify({
                    type: "read",
                    messageId: message.messageId,
                  })
                );
              }
            }
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Failed to process message",
          })
        );
      }
    });

    ws.on("close", () => {
      if (clientUserId) {
        clients.delete(clientUserId);
        console.log(`User ${clientUserId} disconnected`);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  server.listen(port, () => {
    console.log(`✅ Server ready on http://${hostname}:${port}`);
    console.log(`✅ WebSocket ready on ws://${hostname}:${port}/api/ws`);
  });
});
