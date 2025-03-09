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
  Gauge,
  Check,
  Flag,
  Cloud,
  Clock,
  Timer
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useSocket } from '~/providers/SocketProvider';
import { AnimatePresence, motion } from "motion/react"
import Image from 'next/image';

const LoneStarCupOverlay = () => {
  const [showDetailed, setShowDetailed] = useState<boolean>(false);
  const [status, setStatus] = useState<"general" | "flight">('flight');
  const [rocketName, setRocketName] = useState<string>("texas titan mk2");
  const [teamName, setTeamName] = useState<string>("houston rocketeers");
  const socket = useSocket();
  const [events, setEvents] = useState([
    { id: "launch", text: "LAUNCH", status: "pending", time: "T+0:00" },
    { id: "motorBurnout", text: "MOTOR BURNOUT", status: "pending", time: "T+0:03" },
    { id: "ascent", text: "ASCENT", status: "pending", time: "T+????" },
    { id: "apogee", text: "APOGEE", status: "pending", time: "T+????" },
    { id: "drogueDeploy", text: "DROGUE DEPLOY", status: "pending", time: "T+????" },
    { id: "mainChuteDeploy", text: "MAIN CHUTE DEPLOY", status: "pending", time: "T+????" },
    { id: "landing", text: "LANDING", status: "pending", time: "T+????" },
  ]);

  useEffect(() => {
    if (!socket) return;
    console.log("Socket connected");

    socket.on("command", (command: string) => {
      const mainCommand = command.split("-")[0];

      switch (mainCommand) {
        case "status":
          const viewStatus = command.split("-")[1];
          setStatus(viewStatus as "general" | "flight");
          break;

        case "details":
          const viewDetails = command.split("-")[1];
          setShowDetailed(viewDetails === "show");
          break;

        case "event":
          const eventStatus = command.split("-")[2];
          const eventId = command.split("-")[1];

          const eventIndex = events.findIndex(event => event.id === eventId);
          if (eventIndex >= 0 && status) {
            const newEvents = [...events];
            newEvents[eventIndex]!.status = eventStatus as "complete" | "inProgress" | "pending";
            setEvents(newEvents);
          }
          break;

        case "info":
          const infoType = command.split("-")[1];
          const infoValue = command.split("-")[2];
          console.log(infoType, infoValue);
          if (!infoValue) return;

          switch (infoType) {
            case "rocket":
              setRocketName(infoValue);
              break;

            case "team":
              setTeamName(infoValue);
              break;
          }
          break;
      }
    });

    return () => {
      socket.off("commands");
    };
  }, [socket])

  const location = "seymour launch site, tx";

  const data = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  return (
    <div className="fixed inset-0 text-white font-sans" style={{
      background: 'transparent',
      fontFamily: 'Roboto, Arial, sans-serif',
      letterSpacing: '0.5px'
    }}>
      {/* Top bar with logo, location, and weather info */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-2" style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <div className="flex items-center">
          <Image src="/LoneStarCupLogo.png" width={24} height={24} alt="Lone Star Cup" className='mr-2'/>
          <span className="text-lg font-bold tracking-wider">LONE STAR CUP</span>
          <div className="ml-4 px-3 py-1 bg-blue-900 bg-opacity-40 rounded text-xs font-semibold">
            DAY 1
          </div>
        </div>

        <div className="flex space-x-6">
          <div className="flex items-center">
            <Thermometer size={14} className="mr-1 text-blue-400" />
            <span className="text-xs text-slate-400 mr-1">TEMP:</span>
            <span className="text-sm font-mono">32°C</span>
          </div>

          <div className="flex items-center">
            <Wind size={14} className="mr-1 text-blue-400" />
            <span className="text-xs text-slate-400 mr-1">WIND:</span>
            <span className="text-sm font-mono">8 km/h</span>
          </div>

          <div className="flex items-center">
            <Cloud size={14} className="mr-1 text-blue-400" />
            <span className="text-xs text-slate-400 mr-1">CLOUD:</span>
            <span className="text-sm font-mono">15%</span>
          </div>

          <div className="flex items-center">
            <Clock size={14} className="mr-1 text-blue-400" />
            <span className="text-sm font-mono">13:42 CST</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {/* Phase indicator */}
        {status == 'flight' && (
          <motion.div
            key="phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-14 left-1/2 transform -translate-x-1/2">
            <div className="bg-slate-900 bg-opacity-90 border border-blue-900 rounded px-4 py-2 text-center">
              <div className="text-xs text-blue-400 font-bold tracking-wider">CURRENT PHASE</div>
              <div className="text-xl font-bold flex items-center justify-center mt-1">
                <Rocket size={18} className="mr-2 text-blue-400 animate-pulse" />
                ASCENT
              </div>
            </div>
          </motion.div>
        )}

        {/* Left panel - Telemetry */}
        {showDetailed && status == 'flight' && (
          <motion.div
            key="telemetry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-6 top-16 bottom-16 w-fit" style={{
              maxHeight: 'calc(100vh - 120px)'
            }}>
            <div className="bg-slate-900 bg-opacity-90 rounded-lg overflow-hidden border border-slate-800" style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
            }}>
              <div className="px-4 py-3 border-b border-slate-800 flex items-center">
                <BarChart3 size={16} className="mr-2 text-blue-400" />
                <span className="font-bold text-sm tracking-wider">FLIGHT TELEMETRY</span>
              </div>

              {/* Altitude graph */}
              <div className="h-28 p-2">
                <div className="h-full w-full bg-slate-800 rounded relative overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.45} />
                      <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area connectNulls type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* telemetry data */}
              <div className="p-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-800 rounded">
                    <div className="text-xs text-blue-400 font-bold flex items-center">
                      <ArrowUp size={10} className="mr-1" />
                      ALTITUDE
                    </div>
                    <div className="text-lg font-mono font-bold mt-1">
                      1,458<span className="text-xs text-slate-400 ml-1">m</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-800 rounded">
                    <div className="text-xs text-blue-400 font-bold flex items-center">
                      <Wind size={10} className="mr-1" />
                      VELOCITY
                    </div>
                    <div className="text-lg font-mono font-bold mt-1">
                      242<span className="text-xs text-slate-400 ml-1">m/s</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-800 rounded">
                    <div className="text-xs text-blue-400 font-bold flex items-center">
                      <Zap size={10} className="mr-1" />
                      ACCELERATION
                    </div>
                    <div className="text-lg font-mono font-bold mt-1">
                      21.4<span className="text-xs text-slate-400 ml-1">m/s²</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-800 rounded">
                    <div className="text-xs text-blue-400 font-bold flex items-center">
                      <Thermometer size={10} className="mr-1" />
                      TEMPERATURE
                    </div>
                    <div className="text-lg font-mono font-bold mt-1">
                      42<span className="text-xs text-slate-400 ml-1">°C</span>
                    </div>
                  </div>
                </div>
              </div>


              <div className="p-2 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-800 rounded">
                    <div className="text-xs text-blue-400 font-bold">
                      MAX ALTITUDE
                    </div>
                    <div className="text-lg font-mono font-bold mt-1">
                      N/A<span className="text-xs text-slate-400 ml-1">m</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-800 rounded">
                    <div className="text-xs text-blue-400 font-bold">
                      MAX VELOCITY
                    </div>
                    <div className="text-lg font-mono font-bold mt-1">
                      324<span className="text-xs text-slate-400 ml-1">m/s</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-800 rounded">
                    <div className="text-xs text-blue-400 font-bold">
                      PRESSURE
                    </div>
                    <div className="text-lg font-mono font-bold mt-1">
                      84.3<span className="text-xs text-slate-400 ml-1">kPa</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-800 rounded">
                    <div className="text-xs text-blue-400 font-bold">
                      STABILITY
                    </div>
                    <div className="text-lg font-mono font-bold mt-1 flex items-center">
                      <span className="text-green-400 mr-2">OK</span>
                      <Check size={14} className="text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Motor data in detailed view */}
            {showDetailed && status == 'flight' && (
              <div className="mt-4 bg-slate-900 bg-opacity-90 rounded-lg overflow-hidden border border-slate-800" style={{
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
              }}>
                <div className="px-4 py-3 border-b border-slate-800 flex items-center">
                  <Gauge size={16} className="mr-2 text-blue-400" />
                  <span className="font-bold text-sm tracking-wider">MOTOR DATA</span>
                </div>

                <div className="p-3">
                  <div className="text-center mb-3 font-mono">
                    <span className="text-base font-bold bg-slate-800 px-3 py-1 rounded-full border border-blue-900">K1750W</span>
                  </div>

                  <div className="flex justify-between text-center">
                    <div className="px-2">
                      <div className="text-base font-bold font-mono">1750</div>
                      <div className="text-xs text-blue-400">IMPULSE (N⋅s)</div>
                    </div>
                    <div className="px-2 border-l border-r border-slate-800">
                      <div className="text-base font-bold font-mono">75</div>
                      <div className="text-xs text-blue-400">THRUST (N)</div>
                    </div>
                    <div className="px-2">
                      <div className="text-base font-bold font-mono">3.5</div>
                      <div className="text-xs text-blue-400">BURN (s)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Right panel - Events */}
        {/*status == 'flight' &&
        <div className="absolute right-6 top-16 bottom-16 w-fit">
          <div className="bg-slate-900 bg-opacity-90 rounded-lg overflow-hidden border border-slate-800" style={{
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
          }}>
            <div className="px-4 py-3 border-b border-slate-800 flex items-center">
              <Timer size={16} className="mr-2 text-blue-400" />
              <span className="font-bold text-sm tracking-wider">FLIGHT EVENTS</span>
            </div>

            <div className="max-fit">
              {events.map((event, index) => (
                <div key={index} className="py-2 px-3 flex items-center border-b border-slate-800 last:border-b-0">
                  <div className="text-xs font-mono text-slate-400 w-16">{event.time}</div>
                  <div className={`w-2 h-2 mx-2 rounded-full flex-shrink-0 ${event.status === 'complete' ? 'bg-green-500' :
                    event.status === 'inProgress' ? 'bg-blue-500 animate-pulse' :
                      'bg-slate-700'
                    }`}></div>
                  <div className="text-sm tracking-wide">{event.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      */}

        {/* Bottom events timeline */}
        {status == 'flight' && (
          <motion.div
            key="events"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 left-6 right-6 h-36" style={{
              background: 'rgba(15,23,42,0.85)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
            }}>
            <div className="px-4 py-3 border-b border-slate-800 flex items-center">
              <Timer size={16} className="mr-2 text-blue-400" />
              <span className="font-bold text-sm tracking-wider">FLIGHT EVENTS</span>
            </div>

            <div className="p-4">
              {/* Timeline track with dots first */}
              <div className="relative">
                {/* Base track line */}
                <div className="absolute h-0.5 bg-slate-700 left-0 right-0 top-3"></div>

                {/* Animated progress line */}
                <div className="flex justify-between items-center relative">
                  {events.map((event, index) => {
                    const isFirst = index === 0;
                    const isLast = index === events.length - 1;
                    const prevIsActive = index > 0 && (events[index - 1]?.status === 'complete' || events[index - 1]?.status === 'inProgress');

                    return (
                      <React.Fragment key={index}>
                        {/* Progress line before dot (except for first dot) */}
                        {!isFirst && prevIsActive && (
                          <motion.div
                            className={`h-0.5 flex-grow ${events[index - 1]?.status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            style={{ transformOrigin: 'left' }}
                            transition={{ duration: 0.5, delay: (index - 1) * 0.1 }}
                          />
                        )}

                        {/* Spacer if previous event isn't active */}
                        {!isFirst && !prevIsActive && <div className="flex-grow" />}

                        {/* Event dot */}
                        <motion.div
                          className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${event.status === 'complete' ? 'bg-green-500' :
                            event.status === 'inProgress' ? 'bg-blue-500' : 'bg-slate-700'
                            }`}
                          initial={{ scale: 0.6, opacity: 0.6 }}
                          animate={{
                            scale: 1,
                            opacity: 1
                          }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.1
                          }}
                        >
                          <AnimatePresence mode="wait">
                            {event.status === 'complete' && (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Check size={12} />
                              </motion.div>
                            )}
                            {event.status === 'inProgress' && (
                              <motion.div
                                key="rocket"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                  scale: 1,
                                  opacity: 1,
                                  rotate: [0, 5, -5, 0]
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                  duration: 0.2,
                                  rotate: {
                                    repeat: Infinity,
                                    duration: 1.5
                                  }
                                }}
                              >
                                <Rocket size={12} />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex absolute top-[30px]"
                            style={{
                              left: isFirst ? '2px' : undefined,
                              right: isLast ? '2px' : undefined
                            }}>
                            <div
                              key={`text-${index}`}
                              className="flex-1 flex flex-col"
                              style={{
                                alignItems: isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center',
                                textAlign: isFirst ? 'left' : isLast ? 'right' : 'center'
                              }}
                            >
                              {/* Event text */}
                              <motion.div
                                className="text-sm font-medium tracking-wide"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                              >
                                {event.text}
                              </motion.div>

                              {/* Event time */}
                              <motion.div
                                className="mt-1 text-xs font-mono text-slate-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                              >
                                {event.time}
                              </motion.div>
                            </div>
                          </div>

                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom bar with team info */}
        <div className="absolute bottom-0 left-0 right-0" style={{
          background: 'linear-gradient(0deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)',
          borderTop: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <div className="flex justify-between items-center px-6 py-3 text-xs">
            <div className="flex items-center">
              <MapPin size={12} className="mr-1 text-blue-400" />
              <span className="text-slate-400 mr-1">LOCATION:</span>
              <p className='uppercase'>{location}</p>
            </div>

            {
              status == 'flight' && (
                <>
                  <motion.div
                    key="team"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center">
                    <User size={12} className="mr-1 text-blue-400" />
                    <span className="text-slate-400 mr-1">TEAM:</span>
                    <p className='uppercase'>{teamName}</p>
                  </motion.div>
                  <motion.div
                    key="rocket"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center">
                    <Rocket size={12} className="mr-1 text-blue-400" />
                    <span className="text-slate-400 mr-1">ROCKET:</span>
                    <p className='uppercase'>{rocketName}</p>
                  </motion.div>
                </>
              )
            }

            <div className="flex items-center">
              <Flag size={12} className="mr-1 text-blue-400" />
              <span className="text-slate-400 mr-1">DIVISION:</span>
              COLLEGIATE
            </div>
          </div>
        </div>
      </AnimatePresence>

    </div>
  );
};

export default LoneStarCupOverlay;