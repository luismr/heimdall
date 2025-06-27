import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import {
  HeimdallClientConfig,
  AuthContext,
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  SuccessResponse,
  AdminActionRequest,
  ErrorResponse,
  HeimdallError,
} from '../types';

/**
 * Heimdall API Client
 * 
 * A comprehensive TypeScript client for consuming Heimdall authentication API endpoints.
 * Provides methods for user authentication, authorization, and admin operations.
 * 
 * @example
 * ```typescript
 * const client = new HeimdallClient({
 *   baseURL: 'http://localhost:4000/api'
 * });
 * 
 * // Login
 * const loginResult = await client.login({ username: 'user', password: 'pass' });
 * 
 * // Use the client with authentication
 * client.setAuthContext(loginResult);
 * 
 * // Logout
 * await client.logout({ refreshToken: loginResult.refreshToken });
 * ```
 */
export class HeimdallClient {
  private axiosInstance: AxiosInstance;
  private authContext: AuthContext = {};
  private signupAccessToken?: string;
  private signupSecretToken?: string;

  /**
   * Creates a new Heimdall client instance
   * 
   * @param config - Client configuration including base URL and optional settings
   */
  constructor(config: HeimdallClientConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
    this.signupAccessToken = config.signupAccessToken;
    this.signupSecretToken = config.signupSecretToken;

    // Add request interceptor to include authentication headers
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.authContext.accessToken) {
          config.headers.Authorization = `Bearer ${this.authContext.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle errors consistently
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Sets the authentication context for the client
   * 
   * @param context - Authentication context containing tokens and user info
   */
  setAuthContext(context: AuthContext): void {
    this.authContext = { ...context };
  }

  /**
   * Gets the current authentication context
   * 
   * @returns Current authentication context
   */
  getAuthContext(): AuthContext {
    return { ...this.authContext };
  }

  /**
   * Clears the authentication context
   */
  clearAuthContext(): void {
    this.authContext = {};
  }

  /**
   * Checks if the client is currently authenticated
   * 
   * @returns True if access token is present
   */
  isAuthenticated(): boolean {
    return !!this.authContext.accessToken;
  }

  // Authentication Endpoints

  /**
   * Register a new user account
   * 
   * @param request - Signup request with username and password
   * @returns Promise resolving to user information
   * @throws HeimdallError when signup fails or signup protection is not configured
   * 
   * @example
   * ```typescript
   * const user = await client.signup({
   *   username: 'johndoe',
   *   password: 'securepassword123'
   * });
   * console.log(user.username); // 'johndoe'
   * ```
   */
  async signup(request: SignupRequest): Promise<SignupResponse> {
    if (!this.signupAccessToken || !this.signupSecretToken) {
      return Promise.reject(new HeimdallError('Signup is disabled: signup protection tokens not configured', 403));
    }
    const response = await this.axiosInstance.post<SignupResponse>(
      '/signup',
      request,
      {
        headers: {
          'X-Access-Token': this.signupAccessToken,
          'X-Secret-Token': this.signupSecretToken,
        },
      }
    );
    return response.data;
  }

  /**
   * Authenticate user and get JWT tokens
   * 
   * @param request - Login request with username and password
   * @returns Promise resolving to login response with tokens and user info
   * @throws HeimdallError when login fails
   * 
   * @example
   * ```typescript
   * const loginResult = await client.login({
   *   username: 'johndoe',
   *   password: 'securepassword123'
   * });
   * 
   * // Set the auth context for subsequent requests
   * client.setAuthContext(loginResult);
   * ```
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await this.axiosInstance.post<LoginResponse>('/login', request);
    
    // Automatically set auth context after successful login
    this.setAuthContext({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      user: response.data.user,
    });

    return response.data;
  }

  /**
   * Logout user and invalidate refresh token
   * 
   * @param request - Logout request with both accessToken and refreshToken
   * @returns Promise resolving to success message
   * @throws HeimdallError when logout fails or required tokens are missing
   * 
   * @example
   * await client.logout({
   *   accessToken: loginResult.accessToken,
   *   refreshToken: loginResult.refreshToken
   * });
   * 
   * // Clear local auth context
   * client.clearAuthContext();
   */
  async logout(request: LogoutRequest): Promise<SuccessResponse> {
    if (!request.accessToken || !request.refreshToken) {
      throw new HeimdallError('Logout requires both accessToken and refreshToken in the request body', 400);
    }
    const headers: Record<string, string> = {};
    if (this.authContext.accessToken) {
      headers["Authorization"] = `Bearer ${this.authContext.accessToken}`;
    }
    const response = await this.axiosInstance.post<SuccessResponse>('/logout', {refreshToken: request.refreshToken}, { headers });
    // Clear auth context after successful logout
    this.clearAuthContext();
    return response.data;
  }

  // Admin Endpoints

  /**
   * Block a user account (Admin only)
   * 
   * @param request - Admin action request with username to block
   * @returns Promise resolving to success message
   * @throws HeimdallError when blocking fails or insufficient permissions
   * 
   * @example
   * ```typescript
   * // Requires admin authentication
   * await client.blockUser({ username: 'usertoblock' });
   * ```
   */
  async blockUser(request: AdminActionRequest): Promise<SuccessResponse> {
    const response = await this.axiosInstance.post<SuccessResponse>('/admin/block', request);
    return response.data;
  }

  /**
   * Unblock a user account (Admin only)
   * 
   * @param request - Admin action request with username to unblock
   * @returns Promise resolving to success message
   * @throws HeimdallError when unblocking fails or insufficient permissions
   * 
   * @example
   * ```typescript
   * // Requires admin authentication
   * await client.unblockUser({ username: 'usertounblock' });
   * ```
   */
  async unblockUser(request: AdminActionRequest): Promise<SuccessResponse> {
    const response = await this.axiosInstance.post<SuccessResponse>('/admin/unblock', request);
    return response.data;
  }

  /**
   * Remove a user account permanently (Admin only)
   * 
   * @param request - Admin action request with username to remove
   * @returns Promise resolving to success message
   * @throws HeimdallError when removal fails or insufficient permissions
   * 
   * @example
   * ```typescript
   * // Requires admin authentication
   * await client.removeUser({ username: 'usertoremove' });
   * ```
   */
  async removeUser(request: AdminActionRequest): Promise<SuccessResponse> {
    const response = await this.axiosInstance.post<SuccessResponse>('/admin/remove', request);
    return response.data;
  }

  // Utility Methods

  /**
   * Update the base URL for the client
   * 
   * @param baseURL - New base URL
   */
  updateBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  /**
   * Update default headers
   * 
   * @param headers - Headers to merge with existing ones
   */
  updateHeaders(headers: Record<string, string>): void {
    Object.assign(this.axiosInstance.defaults.headers, headers);
  }

  /**
   * Make a custom authenticated request
   * 
   * @param config - Axios request configuration
   * @returns Promise resolving to response data
   */
  async customRequest<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.request<T>(config);
    return response.data;
  }

  /**
   * Handles Axios errors and converts them to HeimdallError
   * 
   * @private
   * @param error - Axios error
   * @returns HeimdallError instance
   */
  private handleError(error: AxiosError): HeimdallError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as ErrorResponse;
      const message = data?.error || error.message || 'Unknown error occurred';
      
      return new HeimdallError(message, status, data);
    } else if (error.request) {
      // Network error
      return new HeimdallError('Network error: Unable to reach server', 0);
    } else {
      // Other error
      return new HeimdallError(error.message || 'Unknown error occurred', 0);
    }
  }
} 