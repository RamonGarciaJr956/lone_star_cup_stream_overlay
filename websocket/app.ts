import { Server } from "socket.io";
import { type Socket } from 'socket.io';

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
  motorManufacturer?: string | null;
  motorDesignation?: string | null;
  motorStats?: { commonName: string, totImpulseNs: number, maxThrustN: number, burnTimeS: number } | null;
}

const connectedClients = new Map<string, ClientData>();
const teamTelemetry = new Map<number, TelemetryData[]>();

type Data = {
  role: string;
  teamId: number;
  name: string;
  motorManufacturer: string;
  motorDesignation: string;
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
  motorManufacturer: string;
  motorDesignation: string;
  motorStats: { commonName: string, totImpulseNs: number, maxThrustN: number, burnTimeS: number } | null;
}

interface CriterionItem {
  name: string;
  value: string;
  matches: number;
}

interface MotorData {
  motorId: string;
  manufacturer: string;
  manufacturerAbbrev: string;
  designation: string;
  commonName: string;
  impulseClass: string;
  diameter: number;
  length: number;
  type: string;
  certOrg: string;
  avgThrustN: number;
  maxThrustN: number;
  totImpulseNs: number;
  burnTimeS: number;
  dataFiles: number;
  totalWeightG: number;
  propWeightG: number;
  caseInfo: string;
  propInfo: string;
  sparky: boolean;
  updatedOn: string;
  availability: string;
}

interface ThrustCurveApiResponse {
  criteria: CriterionItem[];
  matches: number;
  results: MotorData[];
}

async function fetchMotorData(motorManufacturer: string, motorDesignation: string): Promise<ThrustCurveApiResponse> {
  try {
    const response = await fetch("https://www.thrustcurve.org/api/v1/search.json", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        manufacturer: motorManufacturer,
        designation: motorDesignation
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: ThrustCurveApiResponse = await response.json() as ThrustCurveApiResponse;
    return data;
  } catch (error) {
    console.error("Error fetching motor data:", error);
    throw error;
  }
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
      const clientInfo = {
        role: data.role,
        teamId: data.teamId || null,
        name: data.name || null,
        motorManufacturer: data.motorManufacturer || null,
        motorDesignation: data.motorDesignation || null
      } as ClientData;

      // Check if both motor manufacturer and designation are provided
      if (data.motorManufacturer && data.motorDesignation) {
        // Fetch motor data only if both values are provided
        fetchMotorData(data.motorManufacturer, data.motorDesignation)
          .then((response) => {
            const motorStats = response.results[0]!;
            clientInfo.motorStats = {
              commonName: motorStats.commonName,
              totImpulseNs: motorStats.totImpulseNs,
              maxThrustN: motorStats.maxThrustN,
              burnTimeS: motorStats.burnTimeS
            };

            // Register with motor data
            completeRegistration(socket, clientInfo, data);
          })
          .catch((error) => {
            console.error("Error fetching motor data:", error);
            // Register without motor data if fetch fails
            completeRegistration(socket, clientInfo, data);
          });
      } else {
        // Register immediately without attempting to fetch motor data
        completeRegistration(socket, clientInfo, data);
      }
    }
  });

  // Helper function to avoid code duplication
  function completeRegistration(socket: Socket, clientInfo: ClientData, data: Data) {
    console.log(`Client ${socket.id} registered as ${data.role}`);
    connectedClients.set(socket.id, clientInfo);

    // If this is a team's telemetry source, send them the latest data we have
    if (data.role === 'team' && data.teamId) {
      const latestData = teamTelemetry.get(data.teamId);
      if (latestData) {
        socket.emit('telemetry-history', latestData);
      }
    }

    // Broadcast new client connection to admins
    socket.broadcast.emit('client-connected', clientInfo);
  }

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
      status: data.status ?? "N/A",
      motorManufacturer: client.motorManufacturer ?? "N/A",
      motorDesignation: client.motorDesignation ?? "N/A",
      motorStats: client.motorStats ?? null
    } as TelemetryData;

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