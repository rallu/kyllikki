import { APIGatewayEvent } from "aws-lambda";

const baseRequest: APIGatewayEvent = {
  body: null,
  headers: {
    accept: "application/json"
  },
  httpMethod: "GET",
  path: "/",
  resource: "/",
  isBase64Encoded: false,
  multiValueHeaders: {},
  pathParameters: {},
  requestContext: {} as any,
  queryStringParameters: {} as any,
  multiValueQueryStringParameters: {} as any,
  stageVariables: {} as any
};

const foobar: APIGatewayEvent = Object.assign({}, baseRequest, {
  path: "/foo/bar"
} as APIGatewayEvent);

const testGET: APIGatewayEvent = Object.assign({}, baseRequest, {
  path: "/test",
  resource: "/test"
} as APIGatewayEvent);

const testPOST: APIGatewayEvent = Object.assign({}, baseRequest, {
  path: "/test",
  resource: "/test",
  httpMethod: "POST"
});

const testPUT: APIGatewayEvent = Object.assign({}, baseRequest, {
  path: "/test",
  resource: "/test",
  httpMethod: "PUT"
} as APIGatewayEvent);

const testDELETE: APIGatewayEvent = Object.assign({}, baseRequest, {
  path: "/test",
  resource: "/test",
  httpMethod: "DELETE"
} as APIGatewayEvent);

const testANY: APIGatewayEvent = Object.assign({}, baseRequest, {
  path: "/test",
  resource: "/test",
  httpMethod: "ANY"
} as APIGatewayEvent);

const throwsError: APIGatewayEvent = Object.assign({}, baseRequest, {
  path: "/throwserror",
  resource: "/throwserror"
} as APIGatewayEvent);

export const testEvents = {
  foobar,
  testGET,
  testPOST,
  testPUT,
  testDELETE,
  testANY,
  throwsError
};
