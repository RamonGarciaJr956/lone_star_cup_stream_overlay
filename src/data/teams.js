const teams = [
    {
        id: 1,
        name: "IGNITORS",
        universityName: "Texas A&M University",
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
        name: "The Rocket Launchers",
        universityName: "University of Texas Rio Grande Valley",
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
        id: 4,
        name: "Comet Rocketry",
        universityName: "University of Texas at Dallas",
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
        id: 5,
        name: "Aero Mavericks",
        universityName: "University of Texas at Arlington",
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
        id: 6,
        name: "Sun City Summit",
        universityName: "University of Texas El Paso",
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
        id: 7,
        name: "ARC",
        universityName: "University of Texas San Antonio",
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
        id: 8,
        name: "The Space Cowboys",
        universityName: "Mississippi State University",
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
        id: 9,
        name: "Mustang Rocketry",
        universityName: "Southern Methodist University",
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
        id: 10,
        name: "Sounding Rocketry Team",
        universityName: "Texas A&M University",
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
        id: 11,
        name: "Bobcat Aerospace",
        universityName: "Texas State University",
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
]

export default teams;