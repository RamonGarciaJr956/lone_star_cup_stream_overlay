"use client";

import React, { useState, useEffect } from 'react';
import {
    Rocket,
    ArrowUp,
    Thermometer,
    Wind,
    User,
    MapPin,
    BarChart3,
    Zap,
    Flag,
    Clock,
    Timer,
    Eye,
    EyeOff,
    Play,
    Check,
    X,
    Upload,
    Info,
    Settings,
    Radio
} from 'lucide-react';
import { useSocket } from '~/providers/SocketProvider';
import Image from 'next/image';

const AdminDashboard = () => {
    interface Team {
        id: number;
        name: string;
        rocketName: string;
        division: string;
        hasLiveTelemetry: boolean;
        location: string;
        events: Array<{
            id: string;
            text: string;
            status: string;
            time: string;
        }>;
    }

    const [activeTeam, setActiveTeam] = useState<Team | undefined>(undefined);
    const [status, setStatus] = useState<"general" | "flight">("general"); // "general" or "flight"
    const [showDetailed, setShowDetailed] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [connectionId, setConnectionId] = useState("Not connected");
    const socket = useSocket();

    // Mock data for teams
    const [teams, setTeams] = useState([
        {
            id: 1,
            name: "Houston Rocketeers",
            rocketName: "Texas Titan MK2",
            division: "Collegiate",
            hasLiveTelemetry: true,
            location: "Seymour Launch Site, TX",
            events: [
                { id: "launch", text: "LAUNCH", status: "pending", time: "T+0:00" },
                { id: "motorBurnout", text: "MOTOR BURNOUT", status: "pending", time: "T+0:03" },
                { id: "ascent", text: "ASCENT", status: "pending", time: "T+????" },
                { id: "apogee", text: "APOGEE", status: "pending", time: "T+????" },
                { id: "drogueDeploy", text: "DROGUE DEPLOY", status: "pending", time: "T+????" },
                { id: "mainChuteDeploy", text: "MAIN CHUTE DEPLOY", status: "pending", time: "T+????" },
                { id: "landing", text: "LANDING", status: "pending", time: "T+????" },
            ]
        },
        {
            id: 2,
            name: "Austin Aerospace",
            rocketName: "Longhorn Lifter",
            division: "Collegiate",
            hasLiveTelemetry: false,
            location: "Seymour Launch Site, TX",
            events: [
                { id: "launch", text: "LAUNCH", status: "pending", time: "T+0:00" },
                { id: "motorBurnout", text: "MOTOR BURNOUT", status: "pending", time: "T+0:03" },
                { id: "ascent", text: "ASCENT", status: "pending", time: "T+????" },
                { id: "apogee", text: "APOGEE", status: "pending", time: "T+????" },
                { id: "drogueDeploy", text: "DROGUE DEPLOY", status: "pending", time: "T+????" },
                { id: "mainChuteDeploy", text: "MAIN CHUTE DEPLOY", status: "pending", time: "T+????" },
                { id: "landing", text: "LANDING", status: "pending", time: "T+????" },
            ]
        },
        {
            id: 3,
            name: "Dallas Dynamics",
            rocketName: "Maverick Prime",
            division: "Collegiate",
            hasLiveTelemetry: true,
            location: "Seymour Launch Site, TX",
            events: [
                { id: "launch", text: "LAUNCH", status: "pending", time: "T+0:00" },
                { id: "motorBurnout", text: "MOTOR BURNOUT", status: "pending", time: "T+0:03" },
                { id: "ascent", text: "ASCENT", status: "pending", time: "T+????" },
                { id: "apogee", text: "APOGEE", status: "pending", time: "T+????" },
                { id: "drogueDeploy", text: "DROGUE DEPLOY", status: "pending", time: "T+????" },
                { id: "mainChuteDeploy", text: "MAIN CHUTE DEPLOY", status: "pending", time: "T+????" },
                { id: "landing", text: "LANDING", status: "pending", time: "T+????" },
            ]
        }
    ]);

    // Mock telemetry streams
    const [telemetryStreams, setTelemetryStreams] = useState([
        { id: 1, teamId: 1, timestamp: new Date().toISOString(), altitude: 1458, velocity: 242, acceleration: 21.4, temperature: 42, maxAltitude: null, maxVelocity: 324, pressure: 84.3, status: "OK" },
        { id: 2, teamId: 3, timestamp: new Date().toISOString(), altitude: 980, velocity: 198, acceleration: 19.2, temperature: 39, maxAltitude: null, maxVelocity: 289, pressure: 86.1, status: "OK" }
    ]);

    // Simulate telemetry updating
    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetryStreams(prev => prev.map(stream => ({
                ...stream,
                timestamp: new Date().toISOString(),
                altitude: stream.altitude + Math.floor(Math.random() * 10) - 2,
                velocity: stream.velocity + Math.floor(Math.random() * 6) - 3,
                acceleration: parseFloat((stream.acceleration + Math.random() - 0.5).toFixed(1)),
                temperature: stream.temperature + Math.floor(Math.random() * 2) - 1,
            })));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!socket) return;
        console.log("Socket connected");
        setSocketConnected(true);
        setConnectionId(`LSC-${Math.floor(100000 + Math.random() * 900000)}`);

        return () => {
            socket.off("commands");
        };

    }, [socket]);

    const sendCommand = (command: string) => {
        if (!socket) return;

        console.log(`Sending command: ${command}`);
        // In a real implementation, this would send the command to the socket
        socket.emit("command", command);

        // Simulate command responses for UI feedback
        if (command === "details-show") {
            setShowDetailed(true);
        } else if (command === "details-hide") {
            setShowDetailed(false);
        } else if (command === "status-general") {
            setStatus("general");
        } else if (command === "status-flight") {
            setStatus("flight");
        } else if (command.startsWith("event-")) {
            // Update local event status for UI feedback
            const eventId = command.split("-")[1];
            const eventStatus = command.split("-")[2];

            if (activeTeam) {
                const updatedTeams = teams.map(team => {
                    if (team.id === activeTeam.id) {
                        const updatedEvents = team.events.map(event => {
                            if (event.id === eventId) {
                                return { ...event, status: eventStatus as "pending" | "inProgress" | "complete" };
                            }
                            return event;
                        });
                        return { ...team, events: updatedEvents };
                    }
                    return team;
                });

                setTeams(updatedTeams);
                setActiveTeam(updatedTeams.find(t => t.id === activeTeam.id));
            }
        }
    };

    const handleSelectTeam = (team: Team) => {
        team.events.forEach(event => {
            sendCommand(`event-${event.id}-${event.status}`);
        });
        sendCommand("info-team-" + team.name);
        sendCommand("info-rocket-" + team.rocketName);

        setActiveTeam(team);
        sendCommand("status-flight");
    };

    interface TelemetryStream {
        id: number;
        teamId: number;
        timestamp: string;
        altitude: number;
        velocity: number;
        acceleration: number;
        temperature: number;
        maxAltitude: number | null;
        maxVelocity: number;
        pressure: number;
        status: string;
    }

    const handleSelectTelemetry = (stream: TelemetryStream) => {
        // This would normally send the telemetry data to the overlay
        console.log(`Selected telemetry stream for team ID: ${stream.teamId}`);

        // In a real implementation, you would push this data to the overlay
        // socket.emit("telemetry", stream);
    };

    interface EventStatus {
        status: "pending" | "inProgress" | "complete";
    }

    const handleToggleEventStatus = (eventId: string): void => {
        if (!activeTeam) return;

        const event = activeTeam.events.find(e => e.id === eventId);
        if (!event) return;

        let newStatus: EventStatus["status"];
        switch (event.status) {
            case "pending":
                newStatus = "inProgress";
                break;
            case "inProgress":
                newStatus = "complete";
                break;
            case "complete":
                newStatus = "pending";
                break;
            default:
                newStatus = "pending";
        }

        // Create a deep copy of the activeTeam to update
        const updatedActiveTeam = {
            ...activeTeam,
            events: activeTeam.events.map(e => {
                if (e.id === eventId) {
                    return { ...e, status: newStatus };
                }
                return e;
            })
        };

        // Create updated teams array
        const updatedTeams = teams.map(team => {
            if (team.id === activeTeam.id) {
                return updatedActiveTeam;
            }
            return team;
        });

        // Update both state values
        setTeams(updatedTeams);
        setActiveTeam(updatedActiveTeam);

        // Then send the command
        sendCommand(`event-${eventId}-${newStatus}`);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6" style={{ fontFamily: 'Roboto, Arial, sans-serif' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                    <div className="flex items-center">
                        <Image src="/LoneStarCupLogo.png" width={24} height={24} alt="Lone Star Cup" className='mr-2'/>
                        <h1 className="text-2xl font-bold tracking-wider">LONE STAR CUP ADMIN</h1>
                        <div className="ml-4 px-3 py-1 bg-blue-900 bg-opacity-40 rounded text-xs font-semibold">
                            CONTROLLER
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className={`px-3 py-2 rounded-full flex items-center ${socketConnected ? 'bg-green-900 bg-opacity-30' : 'bg-red-900 bg-opacity-30'}`}>
                            <Radio size={16} className={`mr-2 ${socketConnected ? 'text-green-400 animate-pulse' : 'text-red-400'}`} />
                            <span className="text-sm">
                                {socketConnected ? `Connected: ${connectionId}` : 'Disconnected'}
                            </span>
                        </div>

                        <div className="flex items-center">
                            <Clock size={16} className="mr-2 text-blue-400" />
                            <span className="text-sm font-mono">13:42 CST</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left sidebar - Team selection */}
                    <div className="col-span-3">
                        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)' }}>
                            <div className="px-4 py-3 border-b border-slate-700 flex items-center">
                                <User size={16} className="mr-2 text-blue-400" />
                                <span className="font-bold text-sm tracking-wider">TEAMS</span>
                            </div>

                            <div className="p-2 max-h-[600px] overflow-y-auto">
                                {teams.map(team => (
                                    <div
                                        key={team.id}
                                        className={`p-3 my-1 rounded cursor-pointer transition-colors ${activeTeam?.id === team.id ? 'bg-blue-900 bg-opacity-40 border border-blue-600' : 'bg-slate-700 hover:bg-slate-600 border border-slate-600'}`}
                                        onClick={() => handleSelectTeam(team)}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-medium uppercase">{team.name}</div>
                                            {team.hasLiveTelemetry && (
                                                <div className="px-2 py-0.5 bg-green-900 bg-opacity-30 rounded text-xs text-green-400 font-semibold flex items-center">
                                                    <Zap size={10} className="mr-1" />
                                                    LIVE
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm text-slate-300 flex items-center">
                                            <Rocket size={12} className="mr-1 text-blue-400" />
                                            {team.rocketName}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1 flex items-center">
                                            <Flag size={10} className="mr-1 text-blue-400" />
                                            {team.division}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Display controls */}
                        <div className="mt-6 bg-slate-800 rounded-lg overflow-hidden border border-slate-700" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)' }}>
                            <div className="px-4 py-3 border-b border-slate-700 flex items-center">
                                <Settings size={16} className="mr-2 text-blue-400" />
                                <span className="font-bold text-sm tracking-wider">DISPLAY SETTINGS</span>
                            </div>

                            <div className="p-2">
                                <h3 className="text-xs uppercase text-slate-400 mb-2">Display Mode</h3>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <button
                                        className={`py-2 rounded-lg flex items-center justify-center border ${status === 'general' ? 'bg-blue-900 bg-opacity-40 border-blue-600 text-blue-200' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                                        onClick={() => sendCommand('status-general')}
                                    >
                                        <Info size={16} className="mr-2" />
                                        General View
                                    </button>
                                    <button
                                        className={`py-2 rounded-lg flex items-center justify-center border ${status === 'flight' ? 'bg-blue-900 bg-opacity-40 border-blue-600 text-blue-200' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                                        onClick={() => sendCommand('status-flight')}
                                    >
                                        <Rocket size={16} className="mr-2" />
                                        Flight Mode
                                    </button>
                                </div>

                                <h3 className="text-xs uppercase text-slate-400 mb-2">Telemetry Display</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        className={`py-2 rounded-lg flex items-center justify-center border ${showDetailed ? 'bg-blue-900 bg-opacity-40 border-blue-600 text-blue-200' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                                        onClick={() => sendCommand('details-show')}
                                    >
                                        <Eye size={16} className="mr-2" />
                                        Show Details
                                    </button>
                                    <button
                                        className={`py-2 rounded-lg flex items-center justify-center border ${!showDetailed ? 'bg-blue-900 bg-opacity-40 border-blue-600 text-blue-200' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                                        onClick={() => sendCommand('details-hide')}
                                    >
                                        <EyeOff size={16} className="mr-2" />
                                        Hide Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content area */}
                    <div className="col-span-9">
                        {activeTeam ? (
                            <div className="grid grid-cols-2 gap-6">
                                {/* Team info and event controls */}
                                <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)' }}>
                                    <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <User size={16} className="mr-2 text-blue-400" />
                                            <span className="font-bold text-sm tracking-wider">TEAM DETAILS</span>
                                        </div>
                                        <div className="text-xs bg-blue-900 bg-opacity-30 px-2 py-1 rounded">
                                            ID: {activeTeam.id}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="mb-4">
                                            <h2 className="text-2xl font-bold mb-1 uppercase">{activeTeam.name}</h2>
                                            <div className="flex space-x-4 text-sm text-slate-300">
                                                <div className="flex items-center">
                                                    <Rocket size={14} className="mr-1 text-blue-400" />
                                                    {activeTeam.rocketName}
                                                </div>
                                                <div className="flex items-center">
                                                    <Flag size={14} className="mr-1 text-blue-400" />
                                                    {activeTeam.division}
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin size={14} className="mr-1 text-blue-400" />
                                                    {activeTeam.location}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <h3 className="text-sm uppercase text-slate-400 mb-3 flex items-center">
                                                <Timer size={14} className="mr-2 text-blue-400" />
                                                Event Control
                                            </h3>

                                            <div className="grid grid-cols-1 gap-2">
                                                {activeTeam.events.map(event => (
                                                    <button
                                                        key={event.id}
                                                        className={`py-2 px-3 rounded-lg flex items-center justify-between border hover:bg-opacity-50 transition-colors ${event.status === 'complete' ? 'bg-green-900 bg-opacity-30 border-green-700' :
                                                            event.status === 'inProgress' ? 'bg-blue-900 bg-opacity-30 border-blue-700' :
                                                                'bg-slate-700 border-slate-600'
                                                            }`}
                                                        onClick={() => handleToggleEventStatus(event.id)}
                                                    >
                                                        <div className="flex items-center">
                                                            {event.status === 'complete' ? (
                                                                <Check size={16} className="mr-2 text-green-400" />
                                                            ) : event.status === 'inProgress' ? (
                                                                <Play size={16} className="mr-2 text-blue-400 animate-pulse" />
                                                            ) : (
                                                                <div className="w-4 h-4 mr-2 rounded-full border border-slate-500"></div>
                                                            )}
                                                            <span>{event.text}</span>
                                                        </div>
                                                        <div className="text-xs font-mono text-slate-400">{event.time}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Telemetry section */}
                                <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)' }}>
                                    <div className="px-4 py-3 border-b border-slate-700 flex items-center">
                                        <BarChart3 size={16} className="mr-2 text-blue-400" />
                                        <span className="font-bold text-sm tracking-wider">TELEMETRY STREAMS</span>
                                    </div>

                                    <div className="p-4">
                                        {activeTeam.hasLiveTelemetry ? (
                                            <>
                                                <div className="mb-4 flex items-center">
                                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-2"></div>
                                                    <span className="text-sm text-green-400">Live Telemetry Available</span>
                                                </div>

                                                {telemetryStreams
                                                    .filter(stream => stream.teamId === activeTeam.id)
                                                    .map(stream => (
                                                        <div key={stream.id} className="bg-slate-700 rounded-lg p-4 mb-4 border border-slate-600">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <div className="text-sm text-slate-300">Stream ID: {stream.id}</div>
                                                                <div className="text-xs font-mono text-slate-400">{new Date(stream.timestamp).toLocaleTimeString()}</div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                                <div className="bg-slate-800 p-2 rounded flex justify-between items-center">
                                                                    <div className="flex items-center">
                                                                        <ArrowUp size={14} className="mr-1 text-blue-400" />
                                                                        <span className="text-xs">ALTITUDE</span>
                                                                    </div>
                                                                    <span className="font-mono">{stream.altitude} m</span>
                                                                </div>

                                                                <div className="bg-slate-800 p-2 rounded flex justify-between items-center">
                                                                    <div className="flex items-center">
                                                                        <Wind size={14} className="mr-1 text-blue-400" />
                                                                        <span className="text-xs">VELOCITY</span>
                                                                    </div>
                                                                    <span className="font-mono">{stream.velocity} m/s</span>
                                                                </div>

                                                                <div className="bg-slate-800 p-2 rounded flex justify-between items-center">
                                                                    <div className="flex items-center">
                                                                        <Zap size={14} className="mr-1 text-blue-400" />
                                                                        <span className="text-xs">ACCEL</span>
                                                                    </div>
                                                                    <span className="font-mono">{stream.acceleration} m/s²</span>
                                                                </div>

                                                                <div className="bg-slate-800 p-2 rounded flex justify-between items-center">
                                                                    <div className="flex items-center">
                                                                        <Thermometer size={14} className="mr-1 text-blue-400" />
                                                                        <span className="text-xs">TEMP</span>
                                                                    </div>
                                                                    <span className="font-mono">{stream.temperature}°C</span>
                                                                </div>
                                                            </div>

                                                            <button
                                                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center font-medium text-sm transition-colors"
                                                                onClick={() => handleSelectTelemetry(stream)}
                                                            >
                                                                <Upload size={16} className="mr-2" />
                                                                Push to Overlay
                                                            </button>
                                                        </div>
                                                    ))}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-48 text-center">
                                                <X size={32} className="text-slate-500 mb-3" />
                                                <p className="text-slate-400 mb-2">No live telemetry available for this team</p>
                                                <p className="text-xs text-slate-500">Use the Event Control panel to manually update flight status</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 h-64 flex items-center justify-center">
                                <div className="text-center">
                                    <Rocket size={48} className="mx-auto mb-4 text-slate-600" />
                                    <h2 className="text-xl text-slate-400">Select a team to begin</h2>
                                    <p className="text-sm text-slate-500 mt-2">Team details and controls will appear here</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;