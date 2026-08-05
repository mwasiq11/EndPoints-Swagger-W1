import { verifyAccessToken } from '../services/authService.js';
import { HttpError } from '../utils/httpError.js';

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token, ...rest] = authorizationHeader.trim().split(/\s+/);

  if (rest.length > 0 || scheme !== 'Bearer' || !token) {
    return null;
  }

  return token.trim();
}

export async function authMiddleware(request, response, next) {
  try {
    const token = extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new HttpError(401, 'Authorization header with Bearer token is required');
    }

    const user = await verifyAccessToken(token);
    request.authToken = token;
    request.user = user;
    next();
  } catch (error) {
    next(error);
  }
}