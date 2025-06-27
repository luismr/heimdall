/**
 * Basic usage example for Heimdall Client
 * 
 * This example demonstrates how to use the Heimdall client for:
 * - User registration
 * - Authentication (login/logout)
 * - Admin operations
 * - Error handling
 */

import { HeimdallClient, HeimdallError } from '../src';

// Initialize the client
const client = new HeimdallClient({
  baseURL: 'http://localhost:4000/api', // Your Heimdall server URL
  timeout: 10000,
  headers: {
    'X-Client-App': 'heimdall-client-example'
  },
  signupAccessToken: 'your-signup-access-token', // Required for signup
  signupSecretToken: 'your-signup-secret-token', // Required for signup
});

async function basicExample() {
  try {
    console.log('🔥 Heimdall Client - Basic Usage Example');
    console.log('=========================================');

    // 1. Register a new user
    console.log('\n1. Registering new user...');
    const user = await client.signup({
      username: 'example-user',
      password: 'securepassword123'
    });
    console.log('✅ User registered:', user);

    // 2. Login with the new user
    console.log('\n2. Logging in...');
    const loginResult = await client.login({
      username: 'example-user',
      password: 'securepassword123'
    });
    console.log('✅ Login successful');
    console.log('🔑 Access Token:', loginResult.accessToken.substring(0, 20) + '...');
    console.log('🔄 Refresh Token:', loginResult.refreshToken.substring(0, 20) + '...');
    console.log('👤 User Info:', loginResult.user);

    // 3. Check authentication status
    console.log('\n3. Authentication status...');
    console.log('🔐 Is Authenticated:', client.isAuthenticated());
    
    const authContext = client.getAuthContext();
    console.log('📋 Current User:', authContext.user?.username);
    console.log('🏷️ User Roles:', authContext.user?.roles);

    // 4. Make custom authenticated request (if needed)
    console.log('\n4. Making custom authenticated request...');
    try {
      // Example of custom request (this endpoint doesn't exist, just for demo)
      await client.customRequest({
        method: 'GET',
        url: '/profile',
      });
    } catch (error) {
      console.log('ℹ️ Custom request failed (expected - endpoint doesn\'t exist)');
    }

    // 5. Logout
    console.log('\n5. Logging out...');
    await client.logout({
      accessToken: loginResult.accessToken,
      refreshToken: loginResult.refreshToken
    });
    console.log('✅ Logout successful');
    console.log('🔓 Is Authenticated:', client.isAuthenticated());

  } catch (error) {
    if (error instanceof HeimdallError) {
      console.error('❌ Heimdall Error:', error.message);
      console.error('📊 Status:', error.status);
      console.error('📝 Response:', error.response);
    } else {
      console.error('❌ Unexpected Error:', error);
    }
  }
}

async function adminExample() {
  try {
    console.log('\n🛡️ Admin Operations Example');
    console.log('============================');

    // Login as admin (assuming admin user exists)
    console.log('\n1. Logging in as admin...');
    const adminLogin = await client.login({
      username: 'admin',
      password: 'adminpassword'
    });
    console.log('✅ Admin login successful');

    // Block a user
    console.log('\n2. Blocking a user...');
    await client.blockUser({ username: 'example-user' });
    console.log('✅ User blocked successfully');

    // Unblock a user
    console.log('\n3. Unblocking a user...');
    await client.unblockUser({ username: 'example-user' });
    console.log('✅ User unblocked successfully');

    // Note: Be careful with removeUser in production!
    console.log('\n4. User removal available (use with caution)');
    console.log('   await client.removeUser({ username: "usertoremove" });');

  } catch (error) {
    if (error instanceof HeimdallError) {
      console.error('❌ Admin Operation Failed:', error.message);
      if (error.status === 403) {
        console.error('🚫 Insufficient permissions - admin role required');
      }
    } else {
      console.error('❌ Unexpected Error:', error);
    }
  }
}

async function errorHandlingExample() {
  console.log('\n⚠️ Error Handling Example');
  console.log('=========================');

  // Example 1: Invalid credentials
  try {
    await client.login({
      username: 'invalid-user',
      password: 'wrong-password'
    });
  } catch (error) {
    if (error instanceof HeimdallError) {
      console.log('✅ Caught login error as expected');
      console.log('📊 Status Code:', error.status); // 401
      console.log('📝 Error Message:', error.message); // "Invalid credentials"
    }
  }

  // Example 2: Admin operation without permissions
  try {
    client.clearAuthContext(); // Remove admin credentials
    await client.blockUser({ username: 'someone' });
  } catch (error) {
    if (error instanceof HeimdallError) {
      console.log('✅ Caught authorization error as expected');
      console.log('📊 Status Code:', error.status); // 401 or 403
      console.log('📝 Error Message:', error.message);
    }
  }

  // Example 3: Network error simulation
  const networkErrorClient = new HeimdallClient({
    baseURL: 'http://nonexistent-server:9999/api',
    signupAccessToken: 'your-signup-access-token',
    signupSecretToken: 'your-signup-secret-token',
  });

  try {
    await networkErrorClient.signup({ username: 'test', password: 'test' });
  } catch (error) {
    if (error instanceof HeimdallError) {
      console.log('✅ Caught network error as expected');
      console.log('📊 Status Code:', error.status); // 0 for network errors
      console.log('📝 Error Message:', error.message);
    }
  }
}

async function configurationExample() {
  console.log('\n🔧 Configuration Example');
  console.log('========================');

  // Example with custom configuration
  const customClient = new HeimdallClient({
    baseURL: 'https://api.example.com/v2/auth',
    timeout: 15000,
    headers: {
      'X-API-Version': '2.0',
      'X-Client-Platform': 'web',
      'X-Client-Version': '1.0.0'
    },
    signupAccessToken: 'your-signup-access-token',
    signupSecretToken: 'your-signup-secret-token',
  });

  console.log('📋 Custom client configured with:');
  console.log('   - Base URL: https://api.example.com/v2/auth');
  console.log('   - Timeout: 15000ms');
  console.log('   - Custom headers for API versioning');

  // Update configuration dynamically
  customClient.updateBaseURL('https://new-api.example.com/auth');
  customClient.updateHeaders({
    'X-Environment': 'staging'
  });

  console.log('🔄 Configuration updated dynamically');
}

async function contextManagementExample() {
  console.log('\n📋 Context Management Example');
  console.log('==============================');

  // Manual context management
  const manualContext = {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    user: {
      username: 'manual-user',
      roles: ['ROLE_USER'],
      blocked: false
    }
  };

  // Set context manually
  client.setAuthContext(manualContext);
  console.log('✅ Context set manually');
  console.log('🔐 Is Authenticated:', client.isAuthenticated());

  // Get current context
  const currentContext = client.getAuthContext();
  console.log('📋 Current User:', currentContext.user?.username);
  console.log('🏷️ User Roles:', currentContext.user?.roles);

  // Clear context
  client.clearAuthContext();
  console.log('🗑️ Context cleared');
  console.log('🔓 Is Authenticated:', client.isAuthenticated());
}

// Run all examples
async function runAllExamples() {
  console.log('🚀 Starting Heimdall Client Examples');
  console.log('=====================================');

  await basicExample();
  await adminExample();
  await errorHandlingExample();
  await configurationExample();
  await contextManagementExample();

  console.log('\n🎉 All examples completed!');
  console.log('Check the documentation for more advanced usage patterns.');
}

// Export for use as a module
export {
  basicExample,
  adminExample,
  errorHandlingExample,
  configurationExample,
  contextManagementExample,
  runAllExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
} 