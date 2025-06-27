/**
 * User data structure
 */
export interface User {
  username: string;
  roles: string[];
  blocked: boolean;
}

/**
 * Signup request payload
 */
export interface SignupRequest {
  username: string;
  password: string;
}

/**
 * Signup response
 */
export interface SignupResponse {
  username: string;
  roles: string[];
  blocked: boolean;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Logout request payload
 */
export interface LogoutRequest {
  accessToken: string;
  refreshToken: string;
}

/**
 * Standard success response
 */
export interface SuccessResponse {
  message: string;
}

/**
 * Admin action request payloads
 */
export interface AdminActionRequest {
  username: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
}

/**
 * Heimdall client configuration
 */
export interface HeimdallClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  signupAccessToken?: string;
  signupSecretToken?: string;
}

/**
 * Authentication context
 */
export interface AuthContext {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

/**
 * API Error class
 */
export class HeimdallError extends Error {
  public status: number;
  public response?: ErrorResponse;

  constructor(message: string, status: number, response?: ErrorResponse) {
    super(message);
    this.name = 'HeimdallError';
    this.status = status;
    this.response = response;
  }
}

/**
 * HTTP status codes for convenience
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
} 