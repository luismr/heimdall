// Main client export
export { HeimdallClient } from './client/HeimdallClient';

// Type exports
export {
  User,
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  SuccessResponse,
  AdminActionRequest,
  ErrorResponse,
  HeimdallClientConfig,
  AuthContext,
  HeimdallError,
  HttpStatus,
} from './types';

// Default export for convenience
export { HeimdallClient as default } from './client/HeimdallClient'; 