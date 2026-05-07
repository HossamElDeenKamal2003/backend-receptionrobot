const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
    console.log("connected:", socket.id);
});

socket.on("new-delivery-order", (data) => {
    console.log("📦 ORDER RECEIVED:", data);
});