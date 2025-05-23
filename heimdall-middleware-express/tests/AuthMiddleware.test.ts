import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth, isRole, requireAdmin, AuthRequest } from '../src/AuthMiddleware';

// Mock Express request and response objects
const mockRequest = (headers: Record<string, string> = {}, user?: any): AuthRequest => ({
  headers,
  user,
} as AuthRequest);

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

// Mock JWT secret for consistent testing
const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

describe('AuthMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should return 401 when Authorization header is missing', () => {
      const req = mockRequest();
      const res = mockResponse();

      requireAuth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid Authorization header' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header does not start with Bearer', () => {
      const req = mockRequest({ authorization: 'Basic token123' });
      const res = mockResponse();

      requireAuth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid Authorization header' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      const req = mockRequest({ authorization: 'Bearer invalid-token' });
      const res = mockResponse();

      requireAuth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should set user and call next when token is valid', () => {
      const payload = { id: 1, username: 'testuser', roles: ['ROLE_USER'] };
      const token = jwt.sign(payload, JWT_SECRET);
      const req = mockRequest({ authorization: `Bearer ${token}` });
      const res = mockResponse();

      requireAuth(req, res, mockNext);

      // JWT adds iat (issued at) timestamp, so we check that the payload is included
      expect(req.user).toMatchObject(payload);
      expect(req.user.iat).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle expired tokens', () => {
      const payload = { id: 1, username: 'testuser' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1ms' });
      const req = mockRequest({ authorization: `Bearer ${token}` });
      const res = mockResponse();

      // Wait for token to expire
      setTimeout(() => {
        requireAuth(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
        expect(mockNext).not.toHaveBeenCalled();
      }, 10);
    });

    it('should handle malformed Bearer token format', () => {
      const req = mockRequest({ authorization: 'Bearer' });
      const res = mockResponse();

      requireAuth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid Authorization header' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('isRole', () => {
    it('should return false when user is not set', () => {
      const req = mockRequest();
      const result = isRole(req, 'ROLE_ADMIN');
      expect(result).toBe(false);
    });

    it('should return false when user has no roles', () => {
      const req = mockRequest({}, { id: 1, username: 'testuser' });
      const result = isRole(req, 'ROLE_ADMIN');
      expect(result).toBe(false);
    });

    it('should return false when user does not have the required role', () => {
      const req = mockRequest({}, { 
        id: 1, 
        username: 'testuser', 
        roles: ['ROLE_USER'] 
      });
      const result = isRole(req, 'ROLE_ADMIN');
      expect(result).toBe(false);
    });

    it('should return true when user has the required role', () => {
      const req = mockRequest({}, { 
        id: 1, 
        username: 'testuser', 
        roles: ['ROLE_USER', 'ROLE_ADMIN'] 
      });
      const result = isRole(req, 'ROLE_ADMIN');
      expect(result).toBe(true);
    });

    it('should return true when user has any of the required roles', () => {
      const req = mockRequest({}, { 
        id: 1, 
        username: 'testuser', 
        roles: ['ROLE_USER'] 
      });
      const result = isRole(req, 'ROLE_ADMIN', 'ROLE_USER', 'ROLE_MODERATOR');
      expect(result).toBe(true);
    });

    it('should return false when user has none of the required roles', () => {
      const req = mockRequest({}, { 
        id: 1, 
        username: 'testuser', 
        roles: ['ROLE_GUEST'] 
      });
      const result = isRole(req, 'ROLE_ADMIN', 'ROLE_USER', 'ROLE_MODERATOR');
      expect(result).toBe(false);
    });
  });

  describe('requireAdmin', () => {
    it('should return 401 when no authorization header is provided', () => {
      const req = mockRequest();
      const res = mockResponse();

      requireAdmin(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid Authorization header' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when invalid token is provided', () => {
      const req = mockRequest({ authorization: 'Bearer invalid-token' });
      const res = mockResponse();

      requireAdmin(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have admin role', () => {
      const payload = { id: 1, username: 'testuser', roles: ['ROLE_USER'] };
      const token = jwt.sign(payload, JWT_SECRET);
      const req = mockRequest({ authorization: `Bearer ${token}` });
      const res = mockResponse();

      requireAdmin(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Admin role required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next when user has admin role', () => {
      const payload = { id: 1, username: 'testuser', roles: ['ROLE_ADMIN'] };
      const token = jwt.sign(payload, JWT_SECRET);
      const req = mockRequest({ authorization: `Bearer ${token}` });
      const res = mockResponse();

      requireAdmin(req, res, mockNext);

      // JWT adds iat (issued at) timestamp, so we check that the payload is included
      expect(req.user).toMatchObject(payload);
      expect(req.user.iat).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(403);
      expect(res.json).not.toHaveBeenCalledWith({ error: 'Admin role required' });
    });

    it('should call next when user has admin role among multiple roles', () => {
      const payload = { 
        id: 1, 
        username: 'testuser', 
        roles: ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_MODERATOR'] 
      };
      const token = jwt.sign(payload, JWT_SECRET);
      const req = mockRequest({ authorization: `Bearer ${token}` });
      const res = mockResponse();

      requireAdmin(req, res, mockNext);

      // JWT adds iat (issued at) timestamp, so we check that the payload is included
      expect(req.user).toMatchObject(payload);
      expect(req.user.iat).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(403);
    });

    it('should return 403 when user has no roles property', () => {
      const payload = { id: 1, username: 'testuser' };
      const token = jwt.sign(payload, JWT_SECRET);
      const req = mockRequest({ authorization: `Bearer ${token}` });
      const res = mockResponse();

      requireAdmin(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Admin role required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 