import nock from 'nock';
import { HeimdallClient } from '../../src/client/HeimdallClient';
import { HeimdallError, HttpStatus } from '../../src/types';

describe('HeimdallClient', () => {
  const baseURL = 'http://localhost:4000/api';
  let client: HeimdallClient;

  beforeEach(() => {
    client = new HeimdallClient({ baseURL });
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('constructor', () => {
    it('should create a client with default configuration', () => {
      expect(client).toBeInstanceOf(HeimdallClient);
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should create a client with custom headers', () => {
      const customClient = new HeimdallClient({
        baseURL,
        headers: { 'Custom-Header': 'test-value' },
        timeout: 5000,
      });
      expect(customClient).toBeInstanceOf(HeimdallClient);
    });
  });

  describe('authentication context management', () => {
    it('should set and get auth context', () => {
      const authContext = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: { username: 'testuser', roles: ['ROLE_USER'], blocked: false },
      };

      client.setAuthContext(authContext);
      
      const retrievedContext = client.getAuthContext();
      expect(retrievedContext).toEqual(authContext);
      expect(client.isAuthenticated()).toBe(true);
    });

    it('should clear auth context', () => {
      const authContext = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: { username: 'testuser', roles: ['ROLE_USER'], blocked: false },
      };

      client.setAuthContext(authContext);
      expect(client.isAuthenticated()).toBe(true);

      client.clearAuthContext();
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getAuthContext()).toEqual({});
    });
  });

  describe('signup', () => {
    it('should successfully register a new user', async () => {
      const signupRequest = { username: 'newuser', password: 'password123' };
      const signupResponse = {
        username: 'newuser',
        roles: ['ROLE_USER'],
        blocked: false,
      };
      const protectedClient = new HeimdallClient({
        baseURL,
        signupAccessToken: 'access-token',
        signupSecretToken: 'secret-token',
      });
      nock(baseURL)
        .post('/signup', signupRequest)
        .reply(201, signupResponse);
      const result = await protectedClient.signup(signupRequest);
      expect(result).toEqual(signupResponse);
    });

    it('should throw HeimdallError when signup fails with 400', async () => {
      const signupRequest = { username: 'existinguser', password: 'password123' };
      const errorResponse = { error: 'User already exists' };
      const protectedClient = new HeimdallClient({
        baseURL,
        signupAccessToken: 'access-token',
        signupSecretToken: 'secret-token',
      });
      nock(baseURL)
        .post('/signup', signupRequest)
        .reply(400, errorResponse);
      try {
        await protectedClient.signup(signupRequest);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(HeimdallError);
        const heimdallError = error as HeimdallError;
        expect(heimdallError.status).toBe(400);
        expect(heimdallError.response?.error).toBe('User already exists');
      }
    });

    it('should handle network errors', async () => {
      const signupRequest = { username: 'newuser', password: 'password123' };
      const protectedClient = new HeimdallClient({
        baseURL,
        signupAccessToken: 'access-token',
        signupSecretToken: 'secret-token',
      });
      nock(baseURL)
        .post('/signup', signupRequest)
        .replyWithError('Network error');
      await expect(protectedClient.signup(signupRequest)).rejects.toThrow(HeimdallError);
    });

    it('should handle 500 server errors', async () => {
      const signupRequest = { username: 'newuser', password: 'password123' };
      const protectedClient = new HeimdallClient({
        baseURL,
        signupAccessToken: 'access-token',
        signupSecretToken: 'secret-token',
      });
      nock(baseURL)
        .post('/signup', signupRequest)
        .reply(500, { error: 'Internal server error' });
      try {
        await protectedClient.signup(signupRequest);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(HeimdallError);
        const heimdallError = error as HeimdallError;
        expect(heimdallError.status).toBe(500);
      }
    });

    it('should disable signup if tokens are not provided', async () => {
      const signupRequest = { username: 'newuser', password: 'password123' };
      await expect(client.signup(signupRequest)).rejects.toThrow('Signup is disabled');
    });
  });

  describe('login', () => {
    it('should successfully login and set auth context', async () => {
      const loginRequest = { username: 'testuser', password: 'password123' };
      const loginResponse = {
        user: { username: 'testuser', roles: ['ROLE_USER'], blocked: false },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      nock(baseURL)
        .post('/login', loginRequest)
        .reply(200, loginResponse);

      const result = await client.login(loginRequest);
      
      expect(result).toEqual(loginResponse);
      expect(client.isAuthenticated()).toBe(true);
      expect(client.getAuthContext().accessToken).toBe('access-token');
      expect(client.getAuthContext().user?.username).toBe('testuser');
    });

    it('should throw HeimdallError when login fails with 401', async () => {
      const loginRequest = { username: 'testuser', password: 'wrongpassword' };
      const errorResponse = { error: 'Invalid credentials' };

      nock(baseURL)
        .post('/login', loginRequest)
        .reply(401, errorResponse);

      await expect(client.login(loginRequest)).rejects.toThrow(HeimdallError);
      expect(client.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      // Set up authenticated context
      client.setAuthContext({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: { username: 'testuser', roles: ['ROLE_USER'], blocked: false },
      });
    });

    it('should successfully logout and clear auth context', async () => {
      const logoutRequest = { refreshToken: 'test-refresh-token' };
      const logoutResponse = { message: 'Logged out successfully' };

      nock(baseURL)
        .post('/logout', logoutRequest)
        .matchHeader('authorization', 'Bearer test-access-token')
        .reply(200, logoutResponse);

      const result = await client.logout(logoutRequest);
      
      expect(result).toEqual(logoutResponse);
      expect(client.isAuthenticated()).toBe(false);
      expect(client.getAuthContext()).toEqual({});
    });

    it('should throw HeimdallError when logout fails', async () => {
      const logoutRequest = { refreshToken: 'invalid-refresh-token' };
      const errorResponse = { error: 'Invalid refresh token' };

      nock(baseURL)
        .post('/logout', logoutRequest)
        .matchHeader('authorization', 'Bearer test-access-token')
        .reply(400, errorResponse);

      await expect(client.logout(logoutRequest)).rejects.toThrow(HeimdallError);
    });
  });

  describe('admin endpoints', () => {
    beforeEach(() => {
      // Set up admin authenticated context
      client.setAuthContext({
        accessToken: 'admin-access-token',
        refreshToken: 'admin-refresh-token',
        user: { username: 'admin', roles: ['ROLE_ADMIN'], blocked: false },
      });
    });

    describe('blockUser', () => {
      it('should successfully block a user', async () => {
        const blockRequest = { username: 'usertoblock' };
        const blockResponse = { message: 'User blocked' };

        nock(baseURL)
          .post('/admin/block', blockRequest)
          .matchHeader('authorization', 'Bearer admin-access-token')
          .reply(200, blockResponse);

        const result = await client.blockUser(blockRequest);
        expect(result).toEqual(blockResponse);
      });

      it('should throw HeimdallError when user not found', async () => {
        const blockRequest = { username: 'nonexistentuser' };
        const errorResponse = { error: 'User not found' };

        nock(baseURL)
          .post('/admin/block', blockRequest)
          .matchHeader('authorization', 'Bearer admin-access-token')
          .reply(400, errorResponse);

        await expect(client.blockUser(blockRequest)).rejects.toThrow(HeimdallError);
      });

      it('should throw HeimdallError when insufficient permissions', async () => {
        // Set non-admin context
        client.setAuthContext({
          accessToken: 'user-access-token',
          refreshToken: 'user-refresh-token',
          user: { username: 'user', roles: ['ROLE_USER'], blocked: false },
        });

        const blockRequest = { username: 'usertoblock' };
        const errorResponse = { error: 'Admin role required' };

        nock(baseURL)
          .post('/admin/block', blockRequest)
          .matchHeader('authorization', 'Bearer user-access-token')
          .reply(403, errorResponse);

        await expect(client.blockUser(blockRequest)).rejects.toThrow(HeimdallError);
      });
    });

    describe('unblockUser', () => {
      it('should successfully unblock a user', async () => {
        const unblockRequest = { username: 'usertounblock' };
        const unblockResponse = { message: 'User unblocked' };

        nock(baseURL)
          .post('/admin/unblock', unblockRequest)
          .matchHeader('authorization', 'Bearer admin-access-token')
          .reply(200, unblockResponse);

        const result = await client.unblockUser(unblockRequest);
        expect(result).toEqual(unblockResponse);
      });

      it('should throw HeimdallError when user not found', async () => {
        const unblockRequest = { username: 'nonexistentuser' };
        const errorResponse = { error: 'User not found' };

        nock(baseURL)
          .post('/admin/unblock', unblockRequest)
          .matchHeader('authorization', 'Bearer admin-access-token')
          .reply(400, errorResponse);

        await expect(client.unblockUser(unblockRequest)).rejects.toThrow(HeimdallError);
      });
    });

    describe('removeUser', () => {
      it('should successfully remove a user', async () => {
        const removeRequest = { username: 'usertoremove' };
        const removeResponse = { message: 'User removed' };

        nock(baseURL)
          .post('/admin/remove', removeRequest)
          .matchHeader('authorization', 'Bearer admin-access-token')
          .reply(200, removeResponse);

        const result = await client.removeUser(removeRequest);
        expect(result).toEqual(removeResponse);
      });

      it('should throw HeimdallError when user not found', async () => {
        const removeRequest = { username: 'nonexistentuser' };
        const errorResponse = { error: 'User not found' };

        nock(baseURL)
          .post('/admin/remove', removeRequest)
          .matchHeader('authorization', 'Bearer admin-access-token')
          .reply(400, errorResponse);

        await expect(client.removeUser(removeRequest)).rejects.toThrow(HeimdallError);
      });
    });
  });

  describe('utility methods', () => {
    it('should update base URL', () => {
      const newBaseURL = 'https://api.example.com';
      const protectedClient = new HeimdallClient({
        baseURL: newBaseURL,
        signupAccessToken: 'access-token',
        signupSecretToken: 'secret-token',
      });
      protectedClient.updateBaseURL(newBaseURL);
      nock('https://api.example.com')
        .post('/signup')
        .reply(201, {});
      expect(protectedClient.signup({ username: 'test', password: 'test' })).resolves.toBeDefined();
    });

    it('should update headers', () => {
      const protectedClient = new HeimdallClient({
        baseURL,
        signupAccessToken: 'access-token',
        signupSecretToken: 'secret-token',
      });
      protectedClient.updateHeaders({ 'X-Custom-Header': 'test-value' });
      nock(baseURL)
        .post('/signup')
        .matchHeader('x-custom-header', 'test-value')
        .reply(201, {});
      expect(protectedClient.signup({ username: 'test', password: 'test' })).resolves.toBeDefined();
    });

    it('should make custom authenticated requests', async () => {
      client.setAuthContext({
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        user: { username: 'test', roles: ['ROLE_USER'], blocked: false },
      });

      const customResponse = { customData: 'test' };

      nock(baseURL)
        .get('/custom-endpoint')
        .matchHeader('authorization', 'Bearer test-token')
        .reply(200, customResponse);

      const result = await client.customRequest({
        method: 'GET',
        url: '/custom-endpoint',
      });

      expect(result).toEqual(customResponse);
    });
  });

  describe('error handling', () => {
    it('should handle timeout errors', async () => {
      const timeoutClient = new HeimdallClient({ 
        baseURL, 
        timeout: 1 
      });
      
      const signupRequest = { username: 'newuser', password: 'password123' };

      nock(baseURL)
        .post('/signup', signupRequest)
        .delay(10)
        .reply(201, {});

      await expect(timeoutClient.signup(signupRequest)).rejects.toThrow(HeimdallError);
    });

    it('should handle malformed response data', async () => {
      const signupRequest = { username: 'newuser', password: 'password123' };

      nock(baseURL)
        .post('/signup', signupRequest)
        .reply(400, 'Invalid JSON response');

      await expect(client.signup(signupRequest)).rejects.toThrow(HeimdallError);
    });
  });
}); 