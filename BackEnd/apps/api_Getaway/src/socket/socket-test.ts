import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNDY2ZDExMGZjMDdiYmFjZTVjZTk3NCIsImVtYWlsIjoibW9oYW1lZGFkZWxoYXJlaWR5QGdtYWlsLmNvbSIsInZlcmlmaWVkIjp0cnVlLCJpYXQiOjE3ODMwMDg0MzksImV4cCI6MTc4MzAwOTMzOX0.NnwcjaquOS9NKAPc2Ax1gZhr0B5btdx_AtIAt7O-vVM";

const socket = io("http://localhost:3000", {
  auth: {
    token,
  },
});

socket.on("connect", () => {
  console.log("✅ Connected");
  console.log("Socket ID:", socket.id);
});

socket.on("user.profile.get.succeeded", (data) => {
  console.log("Profile:", data);
});

socket.on("user.profile.get.failed", (data) => {
  console.log("Failed:", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});