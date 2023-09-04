export function setupFeedbacks(instance) {
    instance.setFeedbackDefinitions({
        isMuted: {
            type: 'boolean',
            name: 'Is muted',
            description: 'True when the microphone is muted, false when it is not.',
            options: [],
            callback: (feedback, context) => {
                return instance.isMuted;
            }
        },
        inMeeting: {
            type: 'boolean',
            name: 'In meeting',
            description: 'True when the user is currently in a meeting, false when he is not.',
            options: [],
            callback: (feedback, context) => {
                return instance.inMeeting;
            }
        },
        handRaised: {
            type: 'boolean',
            name: 'Hand raised',
            description: 'True when the hand is raised in a call, false when it is not.',
            options: [],
            callback: (feedback, context) => {
                return instance.isHandRaised;
            }
        },
        cameraOn: {
            type: 'boolean',
            name: 'Camera on',
            description: 'True when the camera is on, false when it is not.',
            options: [],
            callback: (feedback, context) => {
                return instance.isCameraOn;
            }
        },
        backgroundBlurred: {
            type: 'boolean',
            name: 'Background blurred',
            description: 'True when the background blur is active, false when it is not.',
            options: [],
            callback: (feedback, context) => {
                return instance.isBackgroundBlurred;
            }
        },
    })
}