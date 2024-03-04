import ICONS from './icons.js'
import { combineRgb } from '@companion-module/base'

export function getPresetDefinitions(self) {
    const presets = {}


    // Fluent UI React v9 colours
    // https://react.fluentui.dev/?path=/docs/theme-colors--page
    const backgroundColor = combineRgb(66, 66, 66);         // colorNeutralForground3Pressed
    const backgroundColorNeutral = combineRgb(91, 95, 199); // colorNeutralForeground2BrandHover
    const backgroundColorActive = combineRgb(197, 15, 31);  // colorStatusDangerBackground3

    presets['toggle-mute'] = {
        name: 'Toggle Mute',
        category: 'Buttons',
        type: 'button',     
        style: {
            text: '',
            png64: ICONS.mic_muted,
            pngalignment: 'center:center',
            size: 'auto',
            color: 0,
            bgcolor: backgroundColor,
        },
        steps: [
            {
                down: [
                    {
                        actionId: 'toggleMute',
                        options: {},
                    },
                ],
            },
        ],
        feedbacks: [
            {
                feedbackId: 'isInMeeting',
                style: {
                    bgcolor: backgroundColorNeutral,
                    png64: ICONS.mic,
                },
            },
            {
                feedbackId: 'isMuted',
                style: {
                    bgcolor: backgroundColorActive,
                    png64: ICONS.mic_muted,
                },
            },
        ],
    }

    presets['toggle-camera'] = {
        name: 'Toggle Camera',
        category: 'Buttons',
        type: 'button',
        style: {
            text: '',
            png64: ICONS.camera_muted,
            pngalignment: 'center:center',
            size: 'auto',
            color: 0,
            bgcolor: backgroundColor,
        },
        steps: [
            {
                down: [
                    {
                        actionId: 'toggleVideo',
                        options: {},
                    },
                ],
            },
        ],
        feedbacks: [
            {
                feedbackId: 'isInMeeting',
                style: {
                    bgcolor: backgroundColorActive,
                },
            },
            {
                feedbackId: 'isVideoOn',
                style: {
                    png64: ICONS.camera,
                    bgcolor: backgroundColorNeutral,
                },
            },
        ],
    }

    presets['toggle-blur'] = {
        name: 'Toggle Background Blur',
        category: 'Buttons',
        type: 'button',
        style: {
            text: '',
            png64: ICONS.cam_not_blurred,
            pngalignment: 'center:center',
            size: 'auto',
            color: 0,
            bgcolor: backgroundColor,
        },
        steps: [
            {
                down: [
                    {
                        actionId: 'toggleBackgroundBlur',
                        options: {},
                    },
                ],
            },
        ],
        feedbacks: [
            {
                feedbackId: 'isInMeeting',
                style: {
                    bgcolor: backgroundColorNeutral,
                },
            },
            {
                feedbackId: 'isBackgroundBlurred',
                style: {
                    png64: ICONS.cam_blurred,
                },
            },
            {
                feedbackId: 'isVideoOn',
                style: {
                    bgcolor: backgroundColor,
                },
                isInverted: true,
            },
        ],
    }

    presets['toggle-hand'] = {
        name: 'Toggle Background Blur',
        category: 'Buttons',
        type: 'button',
        style: {
            text: '',
            png64: ICONS.hand_raised,
            pngalignment: 'center:center',
            size: 'auto',
            color: 0,
            bgcolor: backgroundColor,
        },
        steps: [
            {
                down: [
                    {
                        actionId: 'toggleHand',
                        options: {},
                    },
                ],
            },
        ],
        feedbacks: [
            {
                feedbackId: 'isInMeeting',
                style: {
                    bgcolor: backgroundColorNeutral,
                },
            },
            {
                feedbackId: 'isHandRaised',
                style: {
                    bgcolor: backgroundColorActive,
                },
            },
        ],
    }

    presets['leave-meeting'] = {
        name: 'Leave Meeting',
        category: 'Buttons',
        type: 'button',
        style: {
            text: '',
            png64: ICONS.leave_meeting,
            pngalignment: 'center:center',
            size: 'auto',
            color: 0,
            bgcolor: backgroundColor,
        },
        steps: [
            {
                down: [
                    {
                        actionId: 'leaveMeeting',
                        options: {},
                    },
                ],
            },
        ],
        feedbacks: [
            {
                feedbackId: 'isInMeeting',
                style: {
                    bgcolor: backgroundColorActive,
                },
            },
        ],
    }

    return presets
}