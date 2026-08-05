import { sendSuccess } from '../utils/response.js';

export function profile(request, response) {
  sendSuccess(response, 200, request.user);
}

export function dashboard(request, response) {
  sendSuccess(response, 200, {
    message: 'Welcome to your dashboard.',
    user: request.user
  });
}