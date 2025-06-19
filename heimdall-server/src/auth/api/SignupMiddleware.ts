import { Request, Response, NextFunction } from 'express';

export const validateSignupTokens = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers['x-access-token'];
  const secretToken = req.headers['x-secret-token'];

  const expectedAccessToken = process.env.SIGNUP_ACCESS_TOKEN;
  const expectedSecretToken = process.env.SIGNUP_SECRET_TOKEN;

  if (!expectedAccessToken || !expectedSecretToken) {
    return res.status(500).json({ error: 'Server configuration error: Signup tokens not configured' });
  }

  if (!accessToken || !secretToken) {
    return res.status(401).json({ error: 'Missing signup tokens' });
  }

  if (accessToken !== expectedAccessToken || secretToken !== expectedSecretToken) {
    return res.status(401).json({ error: 'Invalid signup tokens' });
  }

  next();
}; 