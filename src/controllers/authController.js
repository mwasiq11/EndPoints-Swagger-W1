import { loginUser, logoutUser, parseAuthPayload, signUpUser } from '../services/authService.js';
import { HttpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';

export async function signup(request, response) {
  const { email, password } = parseAuthPayload(request.body);
  const user = await signUpUser(email, password);
  sendSuccess(response, 201, { user });
}

export async function login(request, response) {
  const { email, password } = parseAuthPayload(request.body);
  const session = await loginUser(email, password);
  sendSuccess(response, 200, session);
}

export async function logout(request, response) {
  if (!request.authToken) {
    throw new HttpError(401, 'Authorization header with Bearer token is required');
  }

  await logoutUser(request.authToken);
  response.status(204).send();
}