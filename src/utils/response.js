export function sendSuccess(response, statusCode, data) {
  response.status(statusCode).json({ success: true, data });
}

export function sendError(response, statusCode, error) {
  response.status(statusCode).json({ success: false, error });
}