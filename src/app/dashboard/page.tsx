"use client";

import React, { useState, useEffect } from 'react';
import {
    Rocket,
    ArrowUp,
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
    Info,
    Settings,
    Radio,
    RefreshCw,
    AlertTriangle
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
        launchTime: null | Date;
        events: Array<{
            id: string;
            text: string;
            status: string;
            time: string;
        }>;
    }

    type altitudePlotPoint = {
        altitude: number;
        time: string;
    }

    interface TelemetryStream {
        id: number;
        teamId: number;
        timestamp: string;
        altitude: number;
        altitudePlot: altitudePlotPoint[];
        velocity: number;
        acceleration: number;
        temperature: number;
        maxAltitude: number | null;
        maxVelocity: number | null;
        pressure: number;
        status: string;
    }

    type Client = {
        role: string;
        teamId: number;
        name?: string;
    }

    type telemetryHistory = TelemetryStream[];

    const [activeTeam, setActiveTeam] = useState<Team | undefined>(undefined);
    const [status, setStatus] = useState<"general" | "flight">("general");
    const [showDetailed, setShowDetailed] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [connectionId, setConnectionId] = useState("Not connected");
    const socket = useSocket();
    const [currentTime, setCurrentTime] = useState('13:42 CST');
    const [telemetryStreams, setTelemetryStreams] = useState<TelemetryStream[]>([]);
    const [connectedTeams, setConnectedTeams] = useState<number[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [teams, setTeams] = useState<Team[]>([
        {
            id: 1,
            name: "Houston Rocketeers",
            rocketName: "Texas Titan MK2",
            division: "Collegiate",
            hasLiveTelemetry: false,
            location: "Seymour Launch Site, TX",
            launchTime: null,
            events: [
                { id: "launch", text: "LAUNCH", status: "pending", time: "T+0:00" },
                { id: "motorBurnout", text: "MOTOR BURNOUT", status: "pending", time: "T+????" },
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
            launchTime: null,
            events: [
                { id: "launch", text: "LAUNCH", status: "pending", time: "T+0:00" },
                { id: "motorBurnout", text: "MOTOR BURNOUT", status: "pending", time: "T+????" },
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
            hasLiveTelemetry: false,
            location: "Seymour Launch Site, TX",
            launchTime: null,
            events: [
                { id: "launch", text: "LAUNCH", status: "pending", time: "T+0:00" },
                { id: "motorBurnout", text: "MOTOR BURNOUT", status: "pending", time: "T+????" },
                { id: "ascent", text: "ASCENT", status: "pending", time: "T+????" },
                { id: "apogee", text: "APOGEE", status: "pending", time: "T+????" },
                { id: "drogueDeploy", text: "DROGUE DEPLOY", status: "pending", time: "T+????" },
                { id: "mainChuteDeploy", text: "MAIN CHUTE DEPLOY", status: "pending", time: "T+????" },
                { id: "landing", text: "LANDING", status: "pending", time: "T+????" },
            ]
        }
    ]);

    const updateLocalTime = () => {
        try {
            const options = {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: 'America/Chicago' // Central Time for Texas
            } as const;

            const timeString = new Date().toLocaleTimeString('en-US', options);
            setCurrentTime(`${timeString} CST`);
        } catch (error) {
            console.error('Error updating local time:', error);
        }
    };

    // Update local time immediately and then every minute
    useEffect(() => {
        updateLocalTime();
        const timeInterval = setInterval(updateLocalTime, 60 * 1000);

        return () => {
            clearInterval(timeInterval);
        }
    }, []);

    // Socket connection and telemetry handling
    useEffect(() => {
        if (!socket) return;

        // Register as admin
        socket.emit('register', {
            role: 'admin',
            name: 'LSC Admin Panel'
        });

        // Handle connection success
        socket.on('connect', () => {
            console.log("Socket connected:", socket.id);
            setSocketConnected(true);
            setConnectionId(`LSC-${Math.floor(100000 + Math.random() * 900000)}`);
            setError(null);
        });

        // Handle connection errors
        socket.on('connect_error', (err) => {
            console.error("Socket connection error:", err);
            setSocketConnected(false);
            setError(`Connection error: ${err.message}`);
        });

        socket.on('client-connected', (client: Client) => {
            console.log("Client connected:", client);
            if (client.role === 'team' && client.teamId) {
                setConnectedTeams(prev => {
                    if (!prev.includes(client.teamId)) {
                        return [...prev, client.teamId];
                    }
                    return prev;
                });

                setTeams(prev => prev.map(team => {
                    if (team.id === client.teamId) {
                        return { ...team, hasLiveTelemetry: true };
                    }
                    return team;
                }));
            }
        });

        // Client disconnection tracking
        socket.on('client-disconnected', (client: Client) => {
            console.log("Client disconnected:", client);
            if (client.role === 'team' && client.teamId) {
                setConnectedTeams(prev => prev.filter(id => id !== client.teamId));
            }
        });

        // Handle incoming telemetry updates
        socket.on('telemetry-update', (data: TelemetryStream) => {
            // Update timestamp of last received data
            setLastUpdated(prev => ({
                ...prev,
                [data.teamId]: new Date().toLocaleTimeString()
            }));

            // Update telemetry streams
            setTelemetryStreams(prev => {
                // Check if we already have a stream for this team
                const existingIndex = prev.findIndex(stream => stream.teamId === data.teamId);

                if (existingIndex >= 0) {
                    // Update existing stream
                    const updated = [...prev];
                    updated[existingIndex] = data;
                    return updated;
                } else {
                    // Add new stream
                    return [...prev, data];
                }
            });

            // Mark the team as having live telemetry
            setTeams(prev => prev.map(team => {
                if (team.id === data.teamId) {
                    return { ...team, hasLiveTelemetry: true };
                }
                return team;
            }));

            if(activeTeam && activeTeam.id === data.teamId) {
                socket.emit('current-team-telemetry-update', data);
            }
        });

        // Receive telemetry history
        socket.on('telemetry-history', (history: telemetryHistory) => {
            console.log("Received telemetry history:", history);
            setIsLoading(false);

            socket.emit('current-team-telemetry-update', history[history.length - 1]);

            if (history && history.length > 0) {
                // Update the telemetry with the latest data point
                const latestData = history[history.length - 1];

                // Add a null check for latestData
                if (latestData) {
                    setTelemetryStreams(prev => {
                        const existingIndex = prev.findIndex(stream => stream.teamId === latestData.teamId);

                        if (existingIndex >= 0) {
                            const updated = [...prev];
                            updated[existingIndex] = latestData;
                            return updated;
                        } else {
                            return [...prev, latestData];
                        }
                    });

                    // Update last updated timestamp
                    setLastUpdated(prev => ({
                        ...prev,
                        [latestData.teamId]: new Date().toLocaleTimeString()
                    }));
                }
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log("Socket disconnected");
            setSocketConnected(false);
            setConnectionId("Not connected");
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('client-connected');
            socket.off('client-disconnected');
            socket.off('telemetry-update');
            socket.off('telemetry-history');
            socket.off('disconnect');
        };
    }, [socket, activeTeam]);

    const sendCommand = (command: string) => {
        if (!socket || !socketConnected) {
            setError("Can't send command: Socket not connected");
            return;
        }

        console.log(`Sending command: ${command}`);
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
        }
    };

    const handleSelectTeam = (team: Team) => {
        setActiveTeam(team);

        if(!team.hasLiveTelemetry){
            sendCommand('details-hide');
            setShowDetailed(false);
        }

        if (socket && socketConnected && team.hasLiveTelemetry) {
            setIsLoading(true);
            socket.emit('request-telemetry-history', team.id);
        }

        // Send event statuses to overlay
        team.events.forEach(event => {
            sendCommand(`event-${event.id}-${event.status}-${event.time}`);
        });

        // Send team info to overlay
        sendCommand("info-team-" + team.name);
        sendCommand("info-rocket-" + team.rocketName);

        // Switch to flight view
        sendCommand("status-flight");
    };

    const refreshTelemetry = () => {
        if (!activeTeam || !socket || !socketConnected) return;

        setIsLoading(true);
        socket.emit('request-telemetry-history', activeTeam.id);
    };

    type EventStatus = "pending" | "inProgress" | "complete";

    const handleToggleEventStatus = (eventId: string): void => {
        if (!activeTeam) return;

        const event = activeTeam.events.find(e => e.id === eventId);
        if (!event) return;

        let newStatus: EventStatus;
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

        const newLaunchTime = eventId === "launch" && newStatus === "complete" ? new Date() : activeTeam.launchTime;

        const updatedActiveTeam = {
            ...activeTeam,
            launchTime: newLaunchTime,
            events: activeTeam.events.map(e => {
                if (e.id === eventId) {
                    if (newStatus === "pending" && e.id !== "launch") {
                        return {
                            ...e,
                            status: newStatus,
                            time: `T+????`,
                        };
                    }

                    if (newStatus === "complete" && e.id !== "launch" && newLaunchTime) {
                        const secondsSinceLaunch = Math.round((new Date().getTime() - newLaunchTime.getTime()) / 1000);
                        return {
                            ...e,
                            status: newStatus,
                            time: `T+${secondsSinceLaunch}s`,
                        };
                    }
                    return { ...e, status: newStatus };
                }
                return e;
            }),
        };

        const updatedTeams = teams.map(team => {
            if (team.id === activeTeam.id) {
                return updatedActiveTeam;
            }
            return team;
        });

        setActiveTeam(updatedActiveTeam);
        setTeams(updatedTeams);

        if (newStatus === "complete" && eventId !== "launch" && newLaunchTime) {
            const secondsSinceLaunch = Math.round((new Date().getTime() - newLaunchTime.getTime()) / 1000);
            sendCommand(`event-${eventId}-${newStatus}-${`T+${secondsSinceLaunch}s`}`);
        } else if (newStatus === "pending" && eventId !== "launch") {
            sendCommand(`event-${eventId}-${newStatus}-${`T+????`}`);
        } else {
            sendCommand(`event-${eventId}-${newStatus}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6" style={{ fontFamily: 'Roboto, Arial, sans-serif' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                    <div className="flex items-center">
                        <Image src="/LoneStarCupLogo.png" width={24} height={24} alt="Lone Star Cup" className='mr-2' />
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
                            <span className="text-sm font-mono">{currentTime}</span>
                        </div>
                    </div>
                </div>

                {/* Error message display */}
                {error && (
                    <div className="mb-4 bg-red-900 bg-opacity-30 border border-red-700 p-3 rounded-lg flex items-center">
                        <AlertTriangle size={16} className="mr-2 text-red-400" />
                        <span className="text-sm">{error}</span>
                        <button
                            className="ml-auto text-red-400 hover:text-red-300"
                            onClick={() => setError(null)}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

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
                                                <div className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center ${connectedTeams.includes(team.id) ? 'bg-green-900 bg-opacity-30 text-green-400' : 'bg-yellow-900 bg-opacity-30 text-yellow-400'}`}>
                                                    <Zap size={10} className="mr-1" />
                                                    {connectedTeams.includes(team.id) ? 'LIVE' : 'DATA'}
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

                                        {/* Flight event controls */}
                                        <div className="px-4 py-3 border-y border-slate-700 flex items-center">
                                            <Clock size={16} className="mr-2 text-blue-400" />
                                            <span className="font-bold text-sm tracking-wider">FLIGHT EVENTS</span>
                                        </div>

                                        <div className="p-4 max-h-[400px] overflow-y-auto">
                                            {activeTeam.events.map((event) => (
                                                <div key={event.id} className="mb-3 flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center">
                                                            <div
                                                                className={`w-3 h-3 rounded-full mr-2 ${event.status === "complete" ? "bg-green-500" :
                                                                    event.status === "inProgress" ? "bg-yellow-500 animate-pulse" :
                                                                        "bg-slate-500"
                                                                    }`}
                                                            />
                                                            <div className="text-sm font-medium">{event.text}</div>
                                                        </div>
                                                        <div className="text-xs font-mono ml-5 text-slate-400">{event.time}</div>
                                                    </div>
                                                    <button
                                                        className={`px-3 py-1 text-xs font-medium rounded ${event.status === "complete" ? "bg-green-900 text-green-300 border border-green-700" :
                                                            event.status === "inProgress" ? "bg-yellow-900 text-yellow-300 border border-yellow-700" :
                                                                "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
                                                            }`}
                                                        onClick={() => handleToggleEventStatus(event.id)}
                                                    >
                                                        {event.status === "complete" ? (
                                                            <Check size={14} className="inline mr-1" />
                                                        ) : event.status === "inProgress" ? (
                                                            <Play size={14} className="inline mr-1" />
                                                        ) : (
                                                            <Timer size={14} className="inline mr-1" />
                                                        )}
                                                        {event.status === "complete" ? "Completed" :
                                                            event.status === "inProgress" ? "In Progress" : "Pending"}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Telemetry data */}
                                <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)' }}>
                                    <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <BarChart3 size={16} className="mr-2 text-blue-400" />
                                            <span className="font-bold text-sm tracking-wider">TELEMETRY DATA</span>
                                        </div>
                                        {activeTeam.hasLiveTelemetry && (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    className="text-blue-400 hover:text-blue-300 p-1"
                                                    onClick={refreshTelemetry}
                                                    disabled={isLoading}
                                                >
                                                    <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                                                </button>
                                                <div className="text-xs bg-blue-900 bg-opacity-30 px-2 py-1 rounded">
                                                    Updated: {lastUpdated[activeTeam.id] ?? "Never"}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {activeTeam.hasLiveTelemetry ? (
                                        <div className="p-4">
                                            {isLoading ? (
                                                <div className="flex justify-center items-center h-64">
                                                    <div className="text-center">
                                                        <RefreshCw size={32} className="mx-auto mb-4 animate-spin text-blue-400" />
                                                        <p className="text-slate-400">Loading telemetry data...</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {telemetryStreams.filter(stream => stream.teamId === activeTeam.id).length > 0 ? (
                                                        <div>
                                                            {telemetryStreams.filter(stream => stream.teamId === activeTeam.id).map(stream => (
                                                                <div key={stream.id} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                                                            <div className="text-xs text-slate-400 mb-1">Altitude</div>
                                                                            <div className="flex items-center">
                                                                                <ArrowUp size={18} className="mr-2 text-blue-400" />
                                                                                <div className="text-lg">{stream.altitude.toFixed(1)} m</div>
                                                                            </div>
                                                                            {stream.maxAltitude && (
                                                                                <div className="text-xs text-slate-400 mt-1">
                                                                                    Max: {stream.maxAltitude.toFixed(1)} m
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                                                            <div className="text-xs text-slate-400 mb-1">Velocity</div>
                                                                            <div className="flex items-center">
                                                                                <Wind size={18} className="mr-2 text-blue-400" />
                                                                                <div className="text-xl">{stream.velocity.toFixed(1)} m/s</div>
                                                                            </div>
                                                                            <div className="text-xs text-slate-400 mt-1">
                                                                                Max: {stream.maxVelocity ? stream.maxVelocity.toFixed(1) : "N/A"} m/s
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-3 gap-4">
                                                                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                                                            <div className="text-xs text-slate-400 mb-1">Acceleration</div>
                                                                            <div className="flex items-center">
                                                                                <div>{stream.acceleration.toFixed(2)} m/s²</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                                                            <div className="text-xs text-slate-400 mb-1">Temperature</div>
                                                                            <div className="flex items-center">
                                                                                <div>{stream.temperature.toFixed(1)} °C</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                                                            <div className="text-xs text-slate-400 mb-1">Pressure</div>
                                                                            <div className="flex items-center">
                                                                                <div>{stream.pressure.toFixed(2)} hPa</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-4 flex justify-between items-center">
                                                                        <div className="flex items-center">
                                                                            <div className={`px-2 py-1 rounded text-xs font-semibold 
                                                                                ${stream.status === "LAUNCHING" ? "bg-yellow-900 bg-opacity-50 text-yellow-400" :
                                                                                    stream.status === "ASCENDING" ? "bg-blue-900 bg-opacity-50 text-blue-400" :
                                                                                        stream.status === "APOGEE" ? "bg-purple-900 bg-opacity-50 text-purple-400" :
                                                                                            stream.status === "DESCENDING" ? "bg-green-900 bg-opacity-50 text-green-400" :
                                                                                                stream.status === "LANDED" ? "bg-gray-900 bg-opacity-50 text-gray-400" :
                                                                                                    "bg-slate-900 bg-opacity-50 text-slate-400"}`}
                                                                            >
                                                                                {stream.status}
                                                                            </div>
                                                                        </div>

                                                                        <div className="text-xs text-slate-400">
                                                                            Last updated: {new Date(stream.timestamp).toLocaleTimeString()}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-center items-center h-64">
                                                            <div className="text-center">
                                                                <AlertTriangle size={32} className="mx-auto mb-4 text-yellow-400" />
                                                                <p className="text-slate-400">No telemetry data available yet</p>
                                                                <button
                                                                    className="mt-4 px-4 py-2 bg-blue-900 text-blue-200 rounded text-sm border border-blue-800 hover:bg-blue-800"
                                                                    onClick={refreshTelemetry}
                                                                >
                                                                    <RefreshCw size={14} className="mr-2 inline" />
                                                                    Refresh
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 flex justify-center items-center h-64">
                                            <div className="text-center">
                                                <AlertTriangle size={32} className="mx-auto mb-4 text-yellow-400" />
                                                <p className="text-slate-300">No telemetry available for this team</p>
                                                <p className="text-sm text-slate-400 mt-2">Team has not connected a telemetry source</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-[600px] bg-slate-800 rounded-lg border border-slate-700">
                                <div className="text-center">
                                    <Rocket size={48} className="mx-auto mb-4 text-blue-400" />
                                    <h2 className="text-xl font-bold text-slate-300">Select a Team</h2>
                                    <p className="text-slate-400 mt-2">Choose a team from the sidebar to view details and manage their flight data</p>
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