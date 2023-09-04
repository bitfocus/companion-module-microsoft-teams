import { Regex } from '@companion-module/base'

export const configFields = [
    {
        type: 'static-text',
        id: 'info',
        width: 12,
        label: 'Information',
        value:
            "An API token is needed for this module to be able to control the Teams instance - follow this URL to generate an API token and copy it to the field below: <br> <a href='https://support.microsoft.com/en-us/office/connect-to-third-party-devices-in-microsoft-teams-aabca9f2-47bb-407f-9f9b-81a104a883d6' target='_blank'>Generate API token</a>",
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
    