import { Request, Response } from 'express';
import { User } from '../../../src/auth/domain/User';

// Create mock functions
const mockSignupExecute = jest.fn();
const mockLoginExecute = jest.fn();
const mockLogoutExecute = jest.fn();

// Mock the use cases with factory functions
jest.mock('../../../src/auth/application/SignupUseCase', () => ({
  SignupUseCase: jest.fn().mockImplementation(() => ({
    execute: mockSignupExecute,
  })),
}));

jest.mock('../../../src/auth/application/LoginUseCase', () => ({
  LoginUseCase: jest.fn().mockImplementation(() => ({
    execute: mockLoginExecute,
  })),
}));

jest.mock('../../../src/auth/application/LogoutUseCase', () => ({
  LogoutUseCase: jest.fn().mockImplementation(() => ({
    execute: mockLogoutExecute,
  })),
}));

// Import the controller functions after mocking
import { signup, login, logout } from '../../../src/auth/api/AuthController';

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set test environment variables
    process.env.SIGNUP_ACCESS_TOKEN = 'test-access-token';
    process.env.SIGNUP_SECRET_TOKEN = 'test-secret-token';
    
    mockRequest = {
      body: {},
      headers: {
        'x-access-token': 'test-access-token',
        'x-secret-token': 'test-secret-token'
      }
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('signup', () => {
    it('should create user successfully and return 201', async () => {
      const username = 'newuser';
      const password = 'password123';
      const user = new User(username, 'hashedPassword', ['ROLE_USER']);

      mockRequest.body = { username, password };
      mockSignupExecute.mockResolvedValue(user);

      await signup(mockRequest as Request, mockResponse as Response);

      expect(mockSignupExecute).toHaveBeenCalledWith(username, password);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
    });

    it('should return 400 when signup fails', async () => {
      const username = 'existinguser';
      const password = 'password123';
      const error = new Error('User already exists');

      mockRequest.body = { username, password };
      mockSignupExecute.mockRejectedValue(error);

      await signup(mockRequest as Request, mockResponse as Response);

      expect(mockSignupExecute).toHaveBeenCalledWith(username, password);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User already exists' });
    });

    it('should handle missing request body fields', async () => {
      mockRequest.body = {};
      const error = new Error('Username and password are required');
      mockSignupExecute.mockRejectedValue(error);

      await signup(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username and password are required' });
    });
  });

  describe('login', () => {
    it('should login user successfully and return 200', async () => {
      const username = 'testuser';
      const password = 'password123';
      const loginResult = {
        user: new User(username, 'hashedPassword', ['ROLE_USER']),
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      mockRequest.body = { username, password };
      mockLoginExecute.mockResolvedValue(loginResult);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockLoginExecute).toHaveBeenCalledWith(username, password);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(loginResult);
    });

    it('should return 401 when login fails', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';
      const error = new Error('Invalid credentials');

      mockRequest.body = { username, password };
      mockLoginExecute.mockRejectedValue(error);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockLoginExecute).toHaveBeenCalledWith(username, password);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should handle missing credentials', async () => {
      mockRequest.body = {};
      const error = new Error('Username and password are required');
      mockLoginExecute.mockRejectedValue(error);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username and password are required' });
    });
  });

  describe('logout', () => {
    it('should logout user successfully and return 200', async () => {
      const refreshToken = 'valid-refresh-token';

      mockRequest.body = { refreshToken };
      mockLogoutExecute.mockResolvedValue(undefined);

      await logout(mockRequest as Request, mockResponse as Response);

      expect(mockLogoutExecute).toHaveBeenCalledWith(refreshToken);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });

    it('should return 400 when logout fails', async () => {
      const refreshToken = 'invalid-refresh-token';
      const error = new Error('Invalid refresh token');

      mockRequest.body = { refreshToken };
      mockLogoutExecute.mockRejectedValue(error);

      await logout(mockRequest as Request, mockResponse as Response);

      expect(mockLogoutExecute).toHaveBeenCalledWith(refreshToken);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid refresh token' });
    });

    it('should handle missing refresh token', async () => {
      mockRequest.body = {};
      const error = new Error('Refresh token is required');
      mockLogoutExecute.mockRejectedValue(error);

      await logout(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Refresh token is required' });
    });
  });
}); 