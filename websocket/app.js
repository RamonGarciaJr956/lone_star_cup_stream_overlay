import { Server } from "socket.io";

const PORT = 3005;
const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
 
    socket.on('command', (message) => {
      console.log('command:', message
      );
      socket.broadcast.emit('command', message)
    });
   
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
});

const server = io.listen(PORT);
server.on('listening', () => {
    console.log(`Server is running on port ${PORT}`);
});