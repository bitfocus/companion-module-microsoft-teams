const variables = [
  { variableId: 'isMuted', name: 'Is Muted' },
  { variableId: 'isVideoOn', name: 'Is Video On' },
  { variableId: 'isHandRaised', name: 'Is Hand Raised' },
  { variableId: 'isInMeeting', name: 'Is In Meeting' },		
  { variableId: 'isRecordingOn', name: 'Is Recording On' },
  { variableId: 'isBackgroundBlurred', name: 'Is Background Blurred' },
  { variableId: 'isSharing', name: 'Is Sharing' },
  { variableId: 'hasUnreadMessages', name: 'Has Unread Messages' },
  { variableId: 'canToggleMute', name: 'Can Toggle Mute' },
  { variableId: 'canToggleVideo', name: 'Can Toggle Video' },
  { variableId: 'canToggleHand', name: 'Can Toggle Hand' },
  { variableId: 'canToggleBlur', name: 'Can Toggle Blur' },
  { variableId: 'canLeave', name: 'Can Leave Meeting' },
  { variableId: 'canReact', name: 'Can React' },
  { variableId: 'canToggleShareTray', name: 'Can Toggle Share Tray' },
  { variableId: 'canToggleChat', name: 'Can Toggle Chat' },
  { variableId: 'canStopSharing', name: 'Can Stop Sharing' },
  { variableId: 'canPair', name: 'Can Pair Devices' },
];

export function setupVariables(instance) {
  instance.setVariableDefinitions(variables)
  const variableValues = {};
  variables.forEach((variable) => {
    instance[variable.variableId] = false;
    variableValues[variable.variableId] = false;
  });
  instance.setVariableValues(variableValues);
}

export function updateVariables(instance) {
  const variableValues = {};
  variables.forEach((variable) => {
    variableValues[variable.variableId] = instance[variable.variableId];
  });
  instance.setVariableValues(variableValues);
}