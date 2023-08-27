export const upgradeScripts = [
    function removeOldInvertFeedbackScripts(context, props) {
        var result;
        for (const feedback of props.feedbacks) {
            feedback.showInvert = true;
            if (feedback.options['invertFeedback'] !== undefined) {
                feedback.isInverted = !!feedback.options['invertFeedback']
                delete feedback.options['invertFeedback']
                result.updatedFeedbacks.push(feedback)
            }
        }

        result.updatedActions = [];
        result.updatedConfig = null;
        
        return result;
    },
]
