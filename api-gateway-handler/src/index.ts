import type {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

export const handler: APIGatewayProxyHandlerV2 = async (
  event
): Promise<APIGatewayProxyStructuredResultV2> => {
  const method = event.requestContext.http.method;

  // TODO: add real routing (e.g. @middy/http-router) once more than one route is needed.
  if (method === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'ok' }),
    };
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'not found' }),
  };
};
