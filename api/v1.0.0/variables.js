const variables = [
  { variableId: 'isMuted', name: 'Is Muted' },
  { variableId: 'isCameraOn', name: 'Is Camera On' },
  { variableId: 'isHandRaised', name: 'Is Hand Raised' },
  { variableId: 'inMeeting', name: 'Is In Meeting' },		
  { variableId: 'isBackgroundBlurred', name: 'Is Background Blurred' },
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
    instance.log("debug",instance[variable.variableId]);
    variableValues[variable.variableId] = instance[variable.variableId];
  });
  instance.setVariableValues(variableValues);
}