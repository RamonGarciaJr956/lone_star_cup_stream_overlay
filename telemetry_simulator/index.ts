import { io } from "socket.io-client";
import * as readline from 'readline';

// Configuration
const SERVER_URL = "http://localhost:3005";
const UPDATE_INTERVAL = 1000; // milliseconds

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Mock flight phases for more realistic data
type FlightPhase = "pre-launch" | "boost" | "coast" | "apogee" | "descent" | "landed";

interface ClientData {
  role: string;
  teamId: number | null;
  id?: number;
  motorManufacturer?: string | null;
  motorDesignation?: string | null;
}

class TelemetrySimulator {
  private flightId: number;
  public teamId: number;
  public motorManufacturer?: string;
  public motorDesignation?: string;
  private startTime: Date;
  private currentTime: Date;
  private flightPhase: FlightPhase;
  private currentAltitude: number;
  private currentVelocity: number;
  private currentAcceleration: number;
  private currentTemperature: number;
  private maxAltitude: number;
  private maxVelocity: number;
  private currentPressure: number;
  private flightDuration: number; // seconds
  private timeElapsed: number; // seconds
  private intervalId: NodeJS.Timeout | null;

  constructor(teamId: number, motorManufacturer?: string, motorDesignation?: string) {
    this.flightId = Math.floor(Math.random() * 100000);
    this.teamId = teamId;
    this.motorManufacturer = motorManufacturer;
    this.motorDesignation = motorDesignation;
    this.startTime = new Date();
    this.currentTime = new Date();
    this.flightPhase = "pre-launch";
    this.currentAltitude = 0;
    this.currentVelocity = 0;
    this.currentAcceleration = 0;
    this.currentTemperature = 25;
    this.maxAltitude = 0;
    this.maxVelocity = 0;
    this.currentPressure = 101.325; // sea level pressure in kPa
    this.flightDuration = 120; // 2 minutes total flight time
    this.timeElapsed = 0;
    this.intervalId = null;
  }

  register() {
    // Create base registration data
    const registrationData: ClientData = {
      role: "team",
      teamId: this.teamId,
      id: this.flightId
    };

    // Only add motor information if both manufacturer and designation are provided
    if (this.motorManufacturer && this.motorDesignation) {
      registrationData.motorManufacturer = this.motorManufacturer;
      registrationData.motorDesignation = this.motorDesignation;
    }

    socket.emit("register", registrationData);

    // Log registration details
    let registrationMessage = `Registered as Team ${this.teamId}`;
    if (this.motorManufacturer && this.motorDesignation) {
      registrationMessage += ` with motor ${this.motorManufacturer} ${this.motorDesignation}`;
    }
    console.log(registrationMessage);

    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Handle connection-related events
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      this.stopSimulation();
    });
  }

  startFlightSimulation() {
    // Reset values for a new flight
    this.startTime = new Date();
    this.flightPhase = "pre-launch";
    this.currentAltitude = 0;
    this.currentVelocity = 0;
    this.currentAcceleration = 0;
    this.maxAltitude = 0;
    this.maxVelocity = 0;
    this.timeElapsed = 0;

    console.log("Starting flight simulation...");

    // Start sending telemetry data
    this.intervalId = setInterval(() => this.updateAndSendTelemetry(), UPDATE_INTERVAL);
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Simulation stopped");
    }
  }

  resetSimulation() {
    this.stopSimulation();
    this.flightPhase = "pre-launch";
    this.currentAltitude = 0;
    this.currentVelocity = 0;
    this.currentAcceleration = 0;
    this.currentTemperature = 25;
    this.maxAltitude = 0;
    this.maxVelocity = 0;
    this.currentPressure = 101.325;
    this.timeElapsed = 0;
    console.log("Simulation reset");
    
    // Automatically restart the simulation after resetting
    this.startFlightSimulation();
  }

  updateAndSendTelemetry() {
    this.currentTime = new Date();
    this.timeElapsed = (this.currentTime.getTime() - this.startTime.getTime()) / 1000;
    const flightPercentage = this.timeElapsed / this.flightDuration;

    // Update flight phase
    this.updateFlightPhase(flightPercentage);

    // Calculate new values based on flight phase
    this.calculateTelemetry(flightPercentage);

    // Update max values
    this.maxAltitude = Math.max(this.maxAltitude, this.currentAltitude);
    this.maxVelocity = Math.max(this.maxVelocity, Math.abs(this.currentVelocity));

    // Send telemetry data
    const telemetryData = {
      id: this.flightId,
      teamId: this.teamId,
      timestamp: new Date().toISOString(),
      altitude: this.currentAltitude,
      velocity: this.currentVelocity,
      acceleration: this.currentAcceleration,
      temperature: this.currentTemperature,
      maxAltitude: this.maxAltitude,
      maxVelocity: this.maxVelocity,
      pressure: this.currentPressure,
      status: this.flightPhase
    };

    socket.emit("telemetry", telemetryData);
    console.log(`Sent telemetry: Altitude: ${this.currentAltitude.toFixed(2)}m, Velocity: ${this.currentVelocity.toFixed(2)}m/s, Phase: ${this.flightPhase}`);

    // End simulation if the flight is complete
    if (this.flightPhase === "landed" && this.currentAltitude <= 0) {
      console.log("Flight simulation complete");
      this.stopSimulation();
      
      // Auto-restart with a small delay
      setTimeout(() => {
        console.log("Restarting simulation automatically...");
        this.startFlightSimulation();
      }, 3000);
    }
  }

  updateFlightPhase(flightPercentage: number) {
    if (flightPercentage < 0.1) {
      this.flightPhase = "boost";
    } else if (flightPercentage < 0.4) {
      this.flightPhase = "coast";
    } else if (flightPercentage < 0.5) {
      this.flightPhase = "apogee";
    } else if (flightPercentage < 0.9) {
      this.flightPhase = "descent";
    } else {
      this.flightPhase = "landed";
    }
  }

  calculateTelemetry(flightPercentage: number) {
    // Realistic physics-inspired calculations (simplified)
    switch (this.flightPhase) {
      case "pre-launch":
        this.currentAltitude = 0;
        this.currentVelocity = 0;
        this.currentAcceleration = 0;
        break;
        
      case "boost":
        // Acceleration during boost phase - increasing exponentially
        this.currentAcceleration = 30 + (10 * Math.sin(flightPercentage * 10));
        this.currentVelocity += this.currentAcceleration * (UPDATE_INTERVAL / 1000);
        this.currentAltitude += this.currentVelocity * (UPDATE_INTERVAL / 1000);
        this.currentTemperature = 25 + 40 * flightPercentage; // Engine heat
        break;
        
      case "coast":
        // Decreasing acceleration due to gravity
        this.currentAcceleration = -9.8;
        this.currentVelocity += this.currentAcceleration * (UPDATE_INTERVAL / 1000);
        this.currentAltitude += this.currentVelocity * (UPDATE_INTERVAL / 1000);
        this.currentTemperature = Math.max(25, this.currentTemperature - 2);
        break;
        
      case "apogee":
        // At apogee, velocity is near zero
        this.currentAcceleration = -9.8;
        this.currentVelocity = this.currentVelocity * 0.5; // Rapid deceleration at apogee
        this.currentAltitude += this.currentVelocity * (UPDATE_INTERVAL / 1000);
        this.currentTemperature = Math.max(0, this.currentTemperature - 5);
        break;
        
      case "descent":
        // Falling with parachute
        this.currentAcceleration = -9.8;
        // Terminal velocity with parachute around -15 m/s
        if (this.currentVelocity < -15) {
          this.currentVelocity = -15;
        } else {
          this.currentVelocity += this.currentAcceleration * (UPDATE_INTERVAL / 1000);
        }
        this.currentAltitude += this.currentVelocity * (UPDATE_INTERVAL / 1000);
        // Ensure altitude doesn't go below 0
        this.currentAltitude = Math.max(0, this.currentAltitude);
        this.currentTemperature = Math.max(10, this.currentTemperature - 1);
        break;
        
      case "landed":
        this.currentAcceleration = 0;
        this.currentVelocity = 0;
        this.currentAltitude = 0;
        this.currentTemperature = 25;
        break;
    }

    // Update pressure based on altitude (simplified barometric formula)
    this.currentPressure = 101.325 * Math.exp(-0.0001 * this.currentAltitude);

    // Add some noise to the data
    this.currentAltitude += (Math.random() - 0.5) * 2;
    this.currentVelocity += (Math.random() - 0.5) * 1;
    this.currentTemperature += (Math.random() - 0.5) * 0.5;
    this.currentPressure += (Math.random() - 0.5) * 0.1;
  }
}

// Connect to server
const socket = io(SERVER_URL);

let simulator: TelemetrySimulator;

// Default value
const DEFAULT_TEAM_ID = 1;

// Get user input for simulator configuration
const getSimulatorConfig = () => {
  rl.question('Enter team ID: ', (teamIdInput) => {
    const teamId = parseInt(teamIdInput, 10);
    
    if (isNaN(teamId) || teamId <= 0) {
      console.log(`Invalid team ID. Using default team ID ${DEFAULT_TEAM_ID}.`);
    }
    
    rl.question('Enter motor manufacturer (optional, press Enter to skip): ', (manufacturerInput) => {
      const motorManufacturer = manufacturerInput.trim() || undefined;
      
      // If motor manufacturer is provided, ask for designation
      if (motorManufacturer) {
        rl.question('Enter motor designation: ', (designationInput) => {
          const motorDesignation = designationInput.trim() || undefined;
          
          // Create simulator with provided values
          simulator = new TelemetrySimulator(
            isNaN(teamId) || teamId <= 0 ? DEFAULT_TEAM_ID : teamId,
            motorManufacturer,
            motorDesignation
          );
          
          logConfigAndStartInterface();
        });
      } else {
        // Create simulator without motor info
        simulator = new TelemetrySimulator(
          isNaN(teamId) || teamId <= 0 ? DEFAULT_TEAM_ID : teamId
        );
        
        logConfigAndStartInterface();
      }
    });
  });
};

// Log configuration and start command interface
const logConfigAndStartInterface = () => {
  console.log(`Simulator initialized for Team ID: ${simulator.teamId}`);
  if (simulator.motorManufacturer && simulator.motorDesignation) {
    console.log(`- Motor: ${simulator.motorManufacturer} ${simulator.motorDesignation}`);
  } else {
    console.log(`- No motor specified`);
  }
  console.log(`Connecting to server...`);
  
  // Start command interface
  startCommandInterface();
};

// Command line interface for manual control
const startCommandInterface = () => {
  console.log("\nROCKET TELEMETRY SIMULATOR");
  console.log("Commands: start, stop, reset, exit");
  
  rl.on('line', (input) => {
    const command = input.trim().toLowerCase();
    
    switch (command) {
      case 'start':
        simulator.register();
        simulator.startFlightSimulation();
        break;
      case 'stop':
        simulator.stopSimulation();
        break;
      case 'reset':
        simulator.resetSimulation();
        break;
      case 'exit':
        console.log("Exiting simulator...");
        simulator.stopSimulation();
        socket.disconnect();
        rl.close();
        process.exit(0);
        break;
      default:
        console.log("Unknown command. Available commands: start, stop, reset, exit");
    }
  });
};

// Start the configuration process
getSimulatorConfig();

// Handle process termination
process.on('SIGINT', () => {
  console.log("Shutting down simulator...");
  if (simulator) {
    simulator.stopSimulation();
  }
  socket.disconnect();
  rl.close();
  process.exit(0);
});