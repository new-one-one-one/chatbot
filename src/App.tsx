import React, { useState, useEffect } from "react";
import {
  TelepartyClient,
  SocketEventHandler,
  SocketMessageTypes,
  SessionChatMessage,
} from "teleparty-websocket-lib";
import { TextField, Button, Box, Typography, Paper, List, ListItem, Avatar } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const ChatApp: React.FC = () => {
  const [client, setClient] = useState<TelepartyClient | null>(null);
  const [roomId, setRoomId] = useState("");
  const [nickname, setNickname] = useState("");
  const [userIcon, setUserIcon] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<SessionChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventHandler: SocketEventHandler = {
      onConnectionReady: () => {
        setConnected(true);
      },
      onClose: () => alert("Connection closed"),
      onMessage: (msg) => {
        if (msg.type === SocketMessageTypes.SEND_MESSAGE) {
          setMessages((prev) => [...prev, msg.data]);
        }
      },
    };
    
    const newClient = new TelepartyClient(eventHandler);
    setClient(newClient);
  }, []);

  const createRoom = async () => {
    if (client) {
      const newRoomId = await client.createChatRoom(nickname, userIcon);
      setRoomId(newRoomId);
    }
  };

  const joinRoom = () => {
    if (client && roomId) {
      client.joinChatRoom(nickname, roomId, userIcon);
    }
  };

  const sendMessage = () => {
    if (client && message) {
      client.sendMessage(SocketMessageTypes.SEND_MESSAGE, { body: message });
      setMessage("");
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 5, p: 2 }}>
      <Typography variant="h5">Real-Time Chat</Typography>
      <TextField fullWidth label="Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} sx={{ mb: 2 }} />
      <TextField fullWidth label="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} sx={{ mb: 2 }} />
      <Button variant="contained" onClick={createRoom} sx={{ mr: 2 }}>Create Room</Button>
      <Button variant="outlined" onClick={joinRoom}>Join Room</Button>
      <Paper sx={{ height: 300, overflow: "auto", my: 2, p: 1 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.isSystemMessage ? "flex-start" : "flex-end",
                maxWidth: "80%",
                marginLeft: msg.isSystemMessage ? 0 : "auto",
                marginRight: msg.isSystemMessage ? "auto" : 0,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  ml: msg.isSystemMessage ? 1 : -10,
                  fontWeight: "bold",
                  alignSelf: msg.isSystemMessage ? "flex-start" : "flex-end",
                }}
              >
                { msg.isSystemMessage  ? "Bot" : msg.userNickname || "Anonymous"}
              </Typography>
              <Paper
                sx={{
                  m: 1,
                  p: 1,
                  bgcolor: msg.isSystemMessage ? "#f4f4f4" : "#cfe8fc",
                  borderRadius: 2,
                  alignSelf: msg.isSystemMessage ? "flex-start" : "flex-end",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {msg.isSystemMessage ? (
                  <>
                    <SmartToyIcon sx={{ mr: 1 }} />
                    <Typography>{msg.body}</Typography>
                  </>
                ) : (
                  <>
                    {msg.userIcon && <Avatar src={msg.userIcon} sx={{ mr: 2 }} />}
                    <Typography>{msg.body}</Typography>
                  </>
                )}
              </Paper>
            </ListItem>
          ))}
        </List>
      </Paper>
      <TextField fullWidth label="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} sx={{ mb: 2 }} />
      <Button variant="contained" fullWidth onClick={sendMessage}>Send</Button>
    </Box>
  );
};

export default ChatApp;
