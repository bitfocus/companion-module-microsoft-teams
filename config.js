import { Regex } from '@companion-module/base'

export const configFields = [
    {
        type: 'static-text',
        id: 'info',
        width: 12,
        label: 'Information',
        value:
            "With the API enabled on Teams, start a meeting and then send a command, allowing the connection in Teams will import the new API key. <br> <a href='https://support.microsoft.com/en-us/office/connect-to-third-party-devices-in-microsoft-teams-aabca9f2-47bb-407f-9f9b-81a104a883d6' target='_blank'>Microsoft API Guide</a>",
    },
    {
        type: 'dropdown',
        label: 'API Version',
        id: 'apiVersion',
        default: '2.0.0',
        tooltip: 'Select the version of Teams to accommodate the differently supported APIs',
        choices: [
            { id: '1.0.0', label: '1.0.0, Microsoft Teams Classic' },
            { id: '2.0.0', label: '2.0.0, Microsoft Teams (For Work or School)' }
        ]
    },
    {
        type: 'textinput',
        id: 'targetIp',
        label: 'Target IP address',
        tooltip: 'For localhost use 127.0.0.1 (loopback IP)',
        default: '127.0.0.1',
        width: 12,
        regex: Regex.IP
    },
    {
        type: 'textinput',
        id: 'apiToken',
        label: 'MS Teams API Token',
        width: 12,
    },
    {
        type: 'checkbox',
        id: 'reconnect',
        label: 'Reconnect',
        tooltip: 'Reconnect on WebSocket error (after 5 secs)',
        width: 6,
        default: true,
    }
]
    