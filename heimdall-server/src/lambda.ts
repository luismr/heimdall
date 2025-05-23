import serverless from 'serverless-http';
import app from './app';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

export interface LambdaConfig {
  binaryMimeTypes?: string[];
}

export const handler = (config: LambdaConfig = {}) => {
  const serverlessHandler = serverless(app, {
    binary: config.binaryMimeTypes || [
      'application/json',
      'application/octet-stream',
      'image/*',
      'text/*',
      'application/javascript',
      'text/css',
      'text/html'
    ],
    request: {
      logger: console
    },
    response: {
      headers: {
        'Cache-Control': 'no-cache'
      }
    }
  });

  return async (event: APIGatewayProxyEvent, context: Context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
      const result = await serverlessHandler(event, context);
      return result;
    } catch (error) {
      console.error('Lambda execution error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
  };
}; 