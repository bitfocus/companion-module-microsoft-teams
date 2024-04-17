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
        isVideoOn: {
            type: 'boolean',
            name: 'Camera on',
            description: 'True when the camera is on, false when it is not.',
            options: [],
            callback: (feedback, context) => {
                return instance.isVideoOn;
            }
        },
        isHandRaised: {
            type: 'boolean',
            name: 'Hand raised',
            description: 'True when the user has their hand raised, false when it is not.',
            options: [],
            callback: (feedback, context) => {
                return instance.isHandRaised;
            }
        },
        isInMeeting: {
            type: 'boolean',
            name: 'In meeting',
            description: 'True when the user is currently in a meeting, false when he is not.',
            options: [],
            callback: (feedback, context) => {
                return instance.isInMeeting;
            }
        },
        isRecordingOn: {
            type: 'boolean',
            name: 'Recording on',
            description: 'True when the meeting is being recorded, false when it is not.',
            options: [],
            callback: (feedback, context) => {
                return instance.isRecordingOn;
            }
        },
        isBackgroundBlurred: {
            type: 'boolean',
            name: 'Background blurred',
            description: 'True when the background blur is active, false when it is not.',
            options: [],
            callback: (feedback, context) => {
                return instance.isBackgroundBlurred;
            }
        },
        isSharing: {
            type: 'boolean',
            name: 'Sharing Active',
            description: 'True when someone in the meeting is sharing, false when they are not.',
            options: [],
            callback: (feedback, context) => {
                return instance.isSharing;
            }
        },
        hasUnreadMessages: {
            type: 'boolean',
            name: 'Unread Messages',
            description: 'True when the user has unread messages, false when they do not.',
            options: [],
            callback: (feedback, context) => {
                return instance.hasUnreadMessages;
            }
        },
        canToggleMute: {
            type: 'boolean',
            name: 'Can Toggle Mute',
            description: 'True when the user can mute others, false when they can not.',
            options: [],
            callback: (feedback, context) => {
                return instance.canToggleMute;
            }
        },
        canToggleVideo: {
            type: 'boolean',
            name: 'Can Toggle Video',
            description: 'True when the, false when they can not.',
            options: [],
            callback: (feedback, context) => {
                return instance.canToggleVideo;
            }
        },
        canToggleHand: {
            type: 'boolean',
            name: 'Can Toggle Hand',
            description: 'True when , false when they can not.',
            options: [],
            callback: (feedback, context) => {
                return instance.canToggleHand;
            }
        },
        canToggleBlur: {
            type: 'boolean',
            name: 'Can Toggle Blur',
            description: 'True when the camera is on and blue toggle is available, false when it is not.',
            options: [],
            callback: (feedback, context) => {
                return instance.canToggleBlur;
            }
        },
        canLeave: {
            type: 'boolean',
            name: 'Can Leave',
            description: 'True when the user can leave a meeting, false when they can not.',
            options: [],
            callback: (feedback, context) => {
                return instance.canLeave;
            }
        },
        canReact: {
            type: 'boolean',
            name: 'Can React',
            description: 'True when the user can react, false when they can not.',
            options: [],
            callback: (feedback, context) => {
                return instance.canReact;
            }
        },
        canToggleShareTray: {
            type: 'boolean',
            name: 'Can Toggle Share Tray',
            description: 'True when the user can share, false when they can not.',
            options: [],
            callback: (feedback, context) => {
                return instance.canToggleShareTray;
            }
        },
        canToggleChat: {
            type: 'boolean',
            name: 'Can Toggle Chat',
            description: 'True when the user can access the chat, false when they can not.',
            options: [],
            callback: (feedback, context) => {
                return instance.canToggleChat;
            }
        },
        canStopSharing: {
            type: 'boolean',
            name: 'Sharing',
            description: 'True when user is sharing, false when they are not',
            options: [],
            callback: (feedback, context) => {
                return instance.canStopSharing;
            }
        },
        canPair: {
            type: 'boolean',
            name: 'Can Pair',
            description: 'True when user can pair a third party device, false when they can not. This is only useful on first connection.',
            options: [],
            callback: (feedback, context) => {
                return instance.canPair;
            }
        },
    })
}