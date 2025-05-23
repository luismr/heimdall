import { Request, Response } from 'express';

// Create mock functions
const mockBlockUserExecute = jest.fn();
const mockUnblockUserExecute = jest.fn();
const mockRemoveUserExecute = jest.fn();

// Mock the use cases with factory functions
jest.mock('../../../src/auth/application/BlockUserUseCase', () => ({
  BlockUserUseCase: jest.fn().mockImplementation(() => ({
    execute: mockBlockUserExecute,
  })),
}));

jest.mock('../../../src/auth/application/UnblockUserUseCase', () => ({
  UnblockUserUseCase: jest.fn().mockImplementation(() => ({
    execute: mockUnblockUserExecute,
  })),
}));

jest.mock('../../../src/auth/application/RemoveUserUseCase', () => ({
  RemoveUserUseCase: jest.fn().mockImplementation(() => ({
    execute: mockRemoveUserExecute,
  })),
}));

// Import the controller functions after mocking
import { blockUser, unblockUser, removeUser } from '../../../src/auth/api/AdminController';

describe('AdminController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      body: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('blockUser', () => {
    it('should block user successfully and return 200', async () => {
      const username = 'usertoblock';

      mockRequest.body = { username };
      mockBlockUserExecute.mockResolvedValue(undefined);

      await blockUser(mockRequest as Request, mockResponse as Response);

      expect(mockBlockUserExecute).toHaveBeenCalledWith(username);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User blocked' });
    });

    it('should return 400 when blocking fails', async () => {
      const username = 'nonexistentuser';
      const error = new Error('User not found');

      mockRequest.body = { username };
      mockBlockUserExecute.mockRejectedValue(error);

      await blockUser(mockRequest as Request, mockResponse as Response);

      expect(mockBlockUserExecute).toHaveBeenCalledWith(username);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle missing username', async () => {
      mockRequest.body = {};
      const error = new Error('Username is required');
      mockBlockUserExecute.mockRejectedValue(error);

      await blockUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username is required' });
    });

    it('should handle already blocked user', async () => {
      const username = 'alreadyblockeduser';
      const error = new Error('User already blocked');

      mockRequest.body = { username };
      mockBlockUserExecute.mockRejectedValue(error);

      await blockUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User already blocked' });
    });
  });

  describe('unblockUser', () => {
    it('should unblock user successfully and return 200', async () => {
      const username = 'usertounblock';

      mockRequest.body = { username };
      mockUnblockUserExecute.mockResolvedValue(undefined);

      await unblockUser(mockRequest as Request, mockResponse as Response);

      expect(mockUnblockUserExecute).toHaveBeenCalledWith(username);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User unblocked' });
    });

    it('should return 400 when unblocking fails', async () => {
      const username = 'nonexistentuser';
      const error = new Error('User not found');

      mockRequest.body = { username };
      mockUnblockUserExecute.mockRejectedValue(error);

      await unblockUser(mockRequest as Request, mockResponse as Response);

      expect(mockUnblockUserExecute).toHaveBeenCalledWith(username);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle already unblocked user', async () => {
      const username = 'alreadyactiveuser';
      const error = new Error('User already unblocked');

      mockRequest.body = { username };
      mockUnblockUserExecute.mockRejectedValue(error);

      await unblockUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User already unblocked' });
    });
  });

  describe('removeUser', () => {
    it('should remove user successfully and return 200', async () => {
      const username = 'usertoremove';

      mockRequest.body = { username };
      mockRemoveUserExecute.mockResolvedValue(undefined);

      await removeUser(mockRequest as Request, mockResponse as Response);

      expect(mockRemoveUserExecute).toHaveBeenCalledWith(username);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User removed' });
    });

    it('should return 400 when removal fails', async () => {
      const username = 'nonexistentuser';
      const error = new Error('User not found');

      mockRequest.body = { username };
      mockRemoveUserExecute.mockRejectedValue(error);

      await removeUser(mockRequest as Request, mockResponse as Response);

      expect(mockRemoveUserExecute).toHaveBeenCalledWith(username);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle missing username', async () => {
      mockRequest.body = {};
      const error = new Error('Username is required');
      mockRemoveUserExecute.mockRejectedValue(error);

      await removeUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username is required' });
    });
  });
}); 