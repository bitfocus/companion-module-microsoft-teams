export function setupActions(instance) {
    instance.setActionDefinitions({
        toggleMute: {
            name: "Toggle mute",
            description: "Enable/Disable the microphone",
            options: [],
            callback: async (action, context) => {
                instance.ws.send(
                    JSON.stringify({
                        action: "toggle-mute",
                        parameters: {},
                        requestId: 1
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
                        action: "toggle-video",
                        parameters: {},
                        requestId: 1
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
                        action: "leave-call",
                        parameters: {},
                        requestId: 2
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
                        action: "toggle-background-blur",
                        parameters: {},
                        requestId: 1
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
                        action: "toggle-hand",
                        parameters: {},
                        requestId: 1
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
                    action: "send-reaction",
                    parameters: {},
                    requestId: 1
                }
                switch (action.options.selectedReaction) {
                    case 0: message.parameters.type = "applause"; break;
                    case 1: message.parameters.type = "laugh"; break;
                    case 2: message.parameters.type = "like"; break;
                    case 3: message.parameters.type = "love"; break;
                    case 4: message.parameters.type = "wow"; break;
                }

                instance.ws.send(JSON.stringify(message));
            },
        },
    })
}