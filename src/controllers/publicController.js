import { sendSuccess } from '../utils/response.js';

export function info(request, response) {
  sendSuccess(response, 200, {
    message: 'Welcome stranger! This info is public.'
  });
}