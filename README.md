# Lone Star Cup Rocket Telemetry Protocol

## Overview

This guide explains how to connect your team's rocket to the Lone Star Cup telemetry server. The protocol is based on the WebSocket standard using Socket.IO, but can be implemented in any programming language that supports WebSockets.

## Connection Details

- **Server URL**: Will be provided at the competition
- **Protocol**: Socket.IO WebSocket
- **Port**: 3005 (default)

## Implementation Requirements

### 1. Establish WebSocket Connection

Connect to the Socket.IO server using your preferred language/library:

**Key considerations:**
- Your implementation must support Socket.IO protocol
- Handle connection, disconnection, and reconnection scenarios
- Implement error handling for connection failures

### 2. Register Your Team

Immediately after connecting, register your team by emitting a `register` event with the following data structure:

```
{
  "role": "team",
  "teamId": YOUR_ASSIGNED_TEAM_ID,
  "name": "YOUR_TEAM_NAME",  // Optional
  "motorManufacturer": "MANUFACTURER_NAME", // Optional
  "motorDesignation": "MOTOR_MODEL" // Optional
}
```

**Note:** If you include both `motorManufacturer` and `motorDesignation`, the system will automatically fetch and display performance statistics for that motor during the competition. This is optional but recommended for enhanced telemetry display.

### 3. Send Telemetry Data

Transmit telemetry data at regular intervals (recommended: 1 second intervals) by emitting a `telemetry` event with the following data structure:

```
{
  "id": FLIGHT_ID,
  "teamId": YOUR_ASSIGNED_TEAM_ID,
  "timestamp": "ISO_TIMESTAMP",
  "altitude": CURRENT_ALTITUDE,
  "velocity": CURRENT_VELOCITY,
  "acceleration": CURRENT_ACCELERATION,
  "temperature": CURRENT_TEMPERATURE,
  "maxAltitude": MAX_ALTITUDE_REACHED,
  "maxVelocity": MAX_VELOCITY_REACHED,
  "pressure": CURRENT_PRESSURE,
  "status": "FLIGHT_STATUS"
}
```

**Important:** If your system doesn't collect a particular metric, use `null` for that field rather than omitting it.

### 4. Listen for Commands

Your system should listen for the `command` event from the server and handle commands appropriately.

### 5. Handle Telemetry History

When reconnecting, listen for the `telemetry-history` event to receive previously recorded telemetry data.

## Telemetry Data Field Specifications

| Field | Type | Description | If Unavailable |
|-------|------|-------------|---------------|
| id | number | Unique identifier for this flight | Use a random number |
| teamId | number | Your assigned Lone Star Cup team ID | Required |
| timestamp | string | ISO format timestamp | Server will add if missing |
| altitude | number | Current altitude in meters | Use null |
| velocity | number | Current velocity in m/s | Use null |
| acceleration | number | Current acceleration in m/s² | Use null |
| temperature | number | Temperature in °C | Use null |
| maxAltitude | number | Maximum altitude reached | Use null |
| maxVelocity | number | Maximum velocity reached | Use null |
| pressure | number | Atmospheric pressure in kPa | Use null |
| status | string | Flight phase (e.g., "pre-launch", "boost", "coast", "apogee", "descent", "landed") | Use "unknown" |

## Motor Specification (Optional)

You can include motor information during registration to enhance your telemetry display:

| Field | Type | Description |
|-------|------|-------------|
| motorManufacturer | string | Motor manufacturer name (e.g., "Aerotech", "Estes") |
| motorDesignation | string | Motor model designation (e.g., "F42", "H128") |

When both fields are provided, the server will automatically fetch performance data for your motor from the ThrustCurve database, including:
- Total impulse
- Maximum thrust
- Burn time
- Common name

This information will be displayed alongside your telemetry data, providing context for your rocket's performance.

## Implementation Examples in Various Languages

Below are conceptual examples of how to implement the protocol in different languages. Adapt these to your specific implementation needs.

### Python (using python-socketio)

```python
import socketio
import time
import json
from datetime import datetime

# Initialize Socket.IO client
sio = socketio.Client()
TEAM_ID = 42  # Replace with your assigned team ID

@sio.event
def connect():
    print("Connected to server")
    # Register team with motor information
    sio.emit('register', {
        'role': 'team',
        'teamId': TEAM_ID,
        'name': 'Team Name',
        'motorManufacturer': 'Aerotech',  # Optional
        'motorDesignation': 'H550'  # Optional
    })

@sio.event
def disconnect():
    print("Disconnected from server")

@sio.on('command')
def on_command(data):
    print(f"Received command: {data}")
    # Handle command

def send_telemetry(flight_data):
    # Format and send telemetry data
    telemetry = {
        'id': int(time.time()),
        'teamId': TEAM_ID,
        'timestamp': datetime.now().isoformat(),
        'altitude': flight_data.get('altitude', None),
        'velocity': flight_data.get('velocity', None),
        'acceleration': flight_data.get('acceleration', None),
        'temperature': flight_data.get('temperature', None),
        'maxAltitude': flight_data.get('maxAltitude', None),
        'maxVelocity': flight_data.get('maxVelocity', None),
        'pressure': flight_data.get('pressure', None),
        'status': flight_data.get('status', 'unknown')
    }
    sio.emit('telemetry', telemetry)

# Connect to server
try:
    sio.connect('http://localhost:3005')
    
    # Main telemetry loop
    while True:
        # Get your sensor data here
        flight_data = get_sensor_data()  # Your implementation
        send_telemetry(flight_data)
        time.sleep(1)
        
except Exception as e:
    print(f"Error: {e}")
finally:
    sio.disconnect()
```

### C/C++ (Conceptual)

```cpp
// This is a conceptual example - implement using your preferred Socket.IO library
// (e.g., socket.io-client-cpp, WebSockets++, etc.)

#include <socketio_client>
#include <json>
#include <chrono>
#include <thread>

void setupTelemetryClient() {
    // Initialize Socket.IO client
    SocketIO client("http://localhost:3005");
    
    // Set up handlers
    client.on("connect", []() {
        std::cout << "Connected to server" << std::endl;
        
        // Register team with motor information
        json registration = {
            {"role", "team"},
            {"teamId", 42},  // Your team ID
            {"name", "Team Name"},
            {"motorManufacturer", "Cesaroni"}, // Optional
            {"motorDesignation", "L1720"}      // Optional
        };
        client.emit("register", registration);
    });
    
    client.on("command", [](json command) {
        std::cout << "Received command: " << command.dump() << std::endl;
        // Handle command
    });
    
    // Connect to server
    client.connect();
    
    // Main telemetry loop
    while (true) {
        // Get your sensor data
        SensorData data = getSensorData();  // Your implementation
        
        // Create telemetry packet
        json telemetry = {
            {"id", getCurrentTimeMillis()},
            {"teamId", 42},  // Your team ID
            {"timestamp", getCurrentISOTime()},
            {"altitude", data.altitude},
            {"velocity", data.velocity},
            {"acceleration", data.acceleration},
            {"temperature", data.temperature},
            {"maxAltitude", data.maxAltitude},
            {"maxVelocity", data.maxVelocity},
            {"pressure", data.pressure},
            {"status", data.status}
        };
        
        // Send telemetry
        client.emit("telemetry", telemetry);
        
        // Wait before sending next packet
        std::this_thread::sleep_for(std::chrono::milliseconds(1000));
    }
}
```

## Best Practices

1. **Send Complete Data Sets**: Include all fields in your telemetry packets, using `null` for unavailable data
2. **Regular Transmission**: Maintain consistent transmission intervals (1 second recommended)
3. **Reconnection Logic**: Implement automatic reconnection in case of connection loss
4. **Error Handling**: Add robust error handling for all network operations
5. **Data Validation**: Verify your data before sending to ensure proper formatting
6. **Time Synchronization**: Ensure your system clock is accurate for proper timestamping
7. **Motor Specification**: If you know your motor details, include them during registration for enhanced telemetry display

## Troubleshooting

If you experience connection issues:

1. Verify the server URL and port are correct
2. Ensure your teamId is consistent between registration and telemetry events
3. Check your network connection and firewall settings
4. Validate your data format matches the specification exactly
5. Implement logging to track the data being sent and received
6. For motor data issues, verify the manufacturer name and motor designation match the ThrustCurve database format

## Competition Notes

This protocol is specifically designed for the Lone Star Cup rocket competition. All participating teams must implement this protocol correctly to ensure their rocket's telemetry data is properly recorded and displayed during the event.