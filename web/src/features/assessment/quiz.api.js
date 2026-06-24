import api from '@/api/api';

/**
 * Start an adaptive assessment quiz session.
 */
export async function startAssessmentSession(id) {
  return await api.post(`/assessments/${id}/start`);
}

/**
 * Submit an answer for the current question in the session.
 */
export async function submitSessionAnswer({ sessionId, questionId, selectedOptionId, timeTakenMs }) {
  return await api.post(`/assessments/session/${sessionId}/answer`, {
    question_id: questionId,
    selected_option_id: selectedOptionId,
    time_taken_ms: timeTakenMs
  });
}

/**
 * Finalize/Submit the assessment session and calculate the score.
 */
export async function submitAssessmentSession(sessionId) {
  return await api.post(`/assessments/session/${sessionId}/submit`);
}
