import { Request, Response, NextFunction } from 'express';
import { validateSignupTokens } from '../../../src/auth/api/SignupMiddleware';

describe('SignupMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    process.env.SIGNUP_ACCESS_TOKEN = 'test-access-token';
    process.env.SIGNUP_SECRET_TOKEN = 'test-secret-token';

    mockRequest = {
      headers: {
        'x-access-token': 'test-access-token',
        'x-secret-token': 'test-secret-token'
      }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() when tokens are valid', () => {
    validateSignupTokens(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return 401 when access token is missing', () => {
    mockRequest.headers = {
      'x-secret-token': 'test-secret-token'
    };

    validateSignupTokens(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Missing signup tokens' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 when secret token is missing', () => {
    mockRequest.headers = {
      'x-access-token': 'test-access-token'
    };

    validateSignupTokens(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Missing signup tokens' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 when access token is invalid', () => {
    mockRequest.headers = {
      'x-access-token': 'wrong-access-token',
      'x-secret-token': 'test-secret-token'
    };

    validateSignupTokens(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid signup tokens' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 when secret token is invalid', () => {
    mockRequest.headers = {
      'x-access-token': 'test-access-token',
      'x-secret-token': 'wrong-secret-token'
    };

    validateSignupTokens(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid signup tokens' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 500 when environment variables are not configured', () => {
    delete process.env.SIGNUP_ACCESS_TOKEN;
    delete process.env.SIGNUP_SECRET_TOKEN;

    validateSignupTokens(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Server configuration error: Signup tokens not configured' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
}); 