import { Server } from "socket.io";

const PORT = 3005;
const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

interface ClientData {
  role: string;
  teamId: number | null;
  name?: string | null;
}

// Track connected clients
const connectedClients = new Map<string, ClientData>();
// Store latest telemetry by team
const teamTelemetry = new Map<number, TelemetryData[]>();

type Data = {
  role: string;
  teamId: number;
  name: string;
  id: number;
  timestamp?: string;
  altitude?: number;
  velocity?: number;
  acceleration?: number;
  temperature?: number;
  maxAltitude?: number | null;
  maxVelocity?: number;
  pressure?: number;
  status?: string;
}

type altitudePlotPoint = {
  altitude: number;
  time: string;
}

type TelemetryData = {
  id: number;
  teamId: number;
  timestamp: string;
  altitude: number;
  altitudePlot: altitudePlotPoint[];
  velocity: number;
  acceleration: number;
  temperature: number;
  maxAltitude: number | null;
  maxVelocity: number;
  pressure: number;
  status: string;
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Store client with default role
  connectedClients.set(socket.id, {
    role: 'viewer',
    teamId: null
  });

  // Identify client type
  socket.on('register', (data: Data) => {
    if (data?.role) {
      console.log(`Client ${socket.id} registered as ${data.role}`);
      connectedClients.set(socket.id, {
        role: data.role,
        teamId: data.teamId || null,
        name: data.name || null
      });

      // If this is a team's telemetry source, send them the latest data we have
      if (data.role === 'team' && data.teamId) {
        const latestData = teamTelemetry.get(data.teamId);
        if (latestData) {
          socket.emit('telemetry-history', latestData);
        }
      }

      // Broadcast new client connection to admins
      socket.broadcast.emit('client-connected', {
        id: socket.id,
        role: data.role,
        teamId: data.teamId,
        name: data.name
      });
    }
  });

  // Handle telemetry data
  socket.on('telemetry', (data: Data) => {
    const client = connectedClients.get(socket.id);
    const existingData = teamTelemetry.get(data.teamId) ?? [];
    const lastDataPoint = existingData[existingData.length - 1];
    const currentAltitudePlot = lastDataPoint?.altitudePlot ?? [];

    if (!client) {
      console.log(`Invalid telemetry data from ${socket.id}`);
      return;
    }

    // Basic validation to ensure teamId matches registered team
    if (!data?.teamId || (client.role === 'team' && client.teamId !== data.teamId)) {
      console.log(`Invalid telemetry data from ${socket.id}`);
      return;
    }

    // Standard telemetry packet format with defaults for missing fields
    const standardizedData = {
      id: data.id || Math.floor(Math.random() * 100000),
      teamId: data.teamId,
      timestamp: data.timestamp ?? new Date().toISOString(),
      altitude: data.altitude ?? 0,
      altitudePlot: [...currentAltitudePlot, { altitude: data.altitude ?? 0, time: data.timestamp ?? new Date().toISOString() }],
      velocity: data.velocity ?? 0,
      acceleration: data.acceleration ?? 0,
      temperature: data.temperature ?? 0,
      maxAltitude: data.maxAltitude ?? null,
      maxVelocity: data.maxVelocity ?? 0,
      pressure: data.pressure ?? 0,
      status: data.status ?? "N/A"
    };

    // Store latest telemetry
    let teamData = teamTelemetry.get(standardizedData.teamId) ?? [];
    teamData.push(standardizedData);

    // Keep only last 100 data points per team
    if (teamData.length > 100) {
      teamData = teamData.slice(-100);
    }

    teamTelemetry.set(standardizedData.teamId, teamData);

    // Broadcast to all clients including admins and overlays
    socket.broadcast.emit('telemetry-update', standardizedData);
  });

  // Handle command broadcasts from admin panel
  socket.on('command', (message) => {
    const client = connectedClients.get(socket.id);

    // Only allow admins to send commands
    if (client && client.role === 'admin') {
      console.log('Admin command:', message);
      socket.broadcast.emit('command', message);
    } else {
      console.log('Unauthorized command attempt from:', socket.id);
    }
  });

  socket.on('current-team-telemetry-update', (data: Data) => {
    socket.broadcast.emit('current-team-telemetry-update', data);
  });

  // Allow admins to request telemetry history
  socket.on('request-telemetry-history', (teamId: string) => {
    const client = connectedClients.get(socket.id);

    if (client && client.role === 'admin' && teamId) {
      const history = teamTelemetry.get(parseInt(teamId)) ?? [];
      socket.emit('telemetry-history', history);
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    const client = connectedClients.get(socket.id);
    console.log(`Client disconnected: ${socket.id}, role: ${client?.role ?? 'unknown'}`);

    // Notify admins about disconnection
    socket.broadcast.emit('client-disconnected', {
      id: socket.id,
      role: client?.role,
      teamId: client?.teamId
    });

    connectedClients.delete(socket.id);
  });
});

const server = io.listen(PORT);
server.on('listening', () => {
  console.log(`Telemetry server running on port ${PORT}`);
  console.log(`Ready to receive connections from teams and admin panels`);
});