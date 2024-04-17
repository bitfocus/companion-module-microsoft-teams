export function setupActions(instance) {
    instance.setActionDefinitions({
        toggleMute: {
            name: "Toggle mute",
            description: "Enable/Disable the microphone",
            options: [],
            callback: async (action, context) => {
                instance.ws.send(
                    JSON.stringify({
                        apiVersion: "1.0.0",
                        service: "toggle-mute",
                        action: "toggle-mute",
                        manufacturer: "Elgato",
                        device: "StreamDeck",
                        timestamp: Date.now()
                    })
                )
            },
        },
        toggleVideo: {
            name: "Toggle video",
            description: "Enable/Disable the camera",
            options: [],
            callback: async (action, context) => {
                instance.ws.send(
                    JSON.stringify({
                        apiVersion: "1.0.0",
                        service: "toggle-video",
                        action: "toggle-video",
                        manufacturer: "Elgato",
                        device: "StreamDeck",
                        timestamp: Date.now()
                    })
                )
            },
        },
        leaveMeeting: {
            name: "Leave meeting",
            description: "Leave the current meeting",
            options: [],
            callback: async (action, context) => {
                instance.ws.send(
                    JSON.stringify({
                        apiVersion: "1.0.0",
                        service: "call",
                        action: "leave-call",
                        manufacturer: "Elgato",
                        device: "StreamDeck",
                        timestamp: Date.now()
                    })
                )
            },
        },
        toggleBackgroundBlur: {
            name: "Toggle background blur",
            description: "Enable/Disable the backgroud blur effect",
            options: [],
            callback: async (action, context) => {
                instance.ws.send(
                    JSON.stringify({
                        apiVersion: "1.0.0",
                        service: "background-blur",
                        action: "toggle-background-blur",
                        manufacturer: "Elgato",
                        device: "StreamDeck",
                        timestamp: Date.now()
                    })
                )
            },
        },
        toggleHand: {
            name: "Toggle raising hand",
            description: "Raise/Unraise the hand in an active call",
            options: [],
            callback: async (action, context) => {
                instance.ws.send(
                    JSON.stringify({
                        apiVersion: "1.0.0",
                        service: "raise-hand",
                        action: "toggle-hand",
                        manufacturer: "Elgato",
                        device: "StreamDeck",
                        timestamp: Date.now()
                    })
                )
            },
        },
        reaction: {
            name: "Reaction",
            description: "Select one from five reactions to show in an active call",
            options: [
                {
                    type: 'dropdown',
                    label: 'Reaction',
                    id: 'selectedReaction',
                    default: 0,
                    choices: [
                        { id: 0, label: "Applause" },
                        { id: 1, label: "Laugh" },
                        { id: 2, label: "Like" },
                        { id: 3, label: "Heart" },
                        { id: 4, label: "Wow" },
                    ],
                },
            ],
            callback: async (action, context) => {
                var message = {
                    apiVersion: "1.0.0",
                    service: "call",
                    manufacturer: "Elgato",
                    device: "StreamDeck",
                    timestamp: Date.now()
                }
                switch (action.options.selectedReaction) {
                    case 0: message.action = "react-applause"; break;
                    case 1: message.action = "react-laugh"; break;
                    case 2: message.action = "react-like"; break;
                    case 3: message.action = "react-love"; break;
                    case 4: message.action = "react-wow"; break;
                }

                instance.ws.send(JSON.stringify(message));
            },
        },
    })
}