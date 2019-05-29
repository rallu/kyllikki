import { APIGatewayEvent } from "aws-lambda";
import * as Joi from "joi";
import { KyllikkiMeta } from "./meta";
import { ApiResponse } from "./response";

export interface ApiValidations {
  queryStringParameters?: Joi.ObjectSchema;
  body?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
  path?: Joi.ObjectSchema;
}

interface ApiErrorParams {
  type: Function;
  resolve?: OpenApiError;
  code: number;
  description?: string;
}

export interface KyllikkiApiParams extends ApiParams {
  method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH" | "ANY";
  resource: string;
}

export interface ApiParams {
  /**
   * Short summary of endpoint
   */
  summary?: string;
  /**
   * Longer description of endpoint. Can contain markdown.
   */
  description?: string;
  /**
   * Tags that this api endpoint is attached to
   */
  tags?: Array<string>;
  /**
   * Validations for query, body, headers and path.
   */
  validation?: ApiValidations;
  /**
   * Known responses
   */
  responses?: {
    [code: number]: {
      description: string;
    };
  };
  /**
   * List of errors that will be handled.
   */
  errors?: Array<ApiErrorParams>;
  /**
   * Headers added to response
   */
  headers?: CustomApiHeaders;
}

export interface CustomApiHeaders {
  [key: string]: string;
}

export type OpenApiError = (error: any) => ApiResponse;

/**
 * Decorator for GET endpoint
 *
 * @param resource Serverless resources string that GET responses (start with /)
 * @param params Api parameters
 */
export function GET(resource: string, params?: ApiParams) {
  return KyllikkiApi({
    method: "GET",
    resource,
    ...params
  });
}

/**
 * Decorator for POST endpoint
 *
 * @param resource Serverless resources string that POST responses (start with /)
 * @param params Api parameters
 */
export function POST(resource: string, params?: ApiParams) {
  return KyllikkiApi({
    method: "POST",
    resource,
    ...params
  });
}

/**
 * Decorator for DELETE endpoint
 *
 * @param resource Serverless resources string that DELETE responses (start with /)
 * @param params Api parameters
 */
export function DELETE(resource: string, params?: ApiParams) {
  return KyllikkiApi({
    method: "DELETE",
    resource,
    ...params
  });
}

/**
 * Decorator for PUT endpoint
 *
 * @param resource Serverless resources string that PUT responses (start with /)
 * @param params Api parameters
 */
export function PUT(resource: string, params?: ApiParams) {
  return KyllikkiApi({
    method: "PUT",
    resource,
    ...params
  });
}

/**
 * Decorator for PATCH endpoint
 *
 * @param resource Serverless resources string that PATCH responses (start with /)
 * @param params Api parameters
 */
export function PATCH(resource: string, params?: ApiParams) {
  return KyllikkiApi({
    method: "PATCH",
    resource,
    ...params
  });
}

/**
 * Decorator for ANY endpoint (Api Gateway special)
 *
 * @param resource Serverless resources string that ANY responses (start with /)
 * @param params Api parameters
 */
export function ANY(resource: string, params?: ApiParams) {
  return KyllikkiApi({
    method: "ANY",
    resource,
    ...params
  });
}

function KyllikkiApi(params: KyllikkiApiParams) {
  return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalFunction = descriptor.value;

    if (isDuplicate(params, propertyKey, descriptor)) {
      throw new Error(`Property ${String(propertyKey)} has been already registered as ${params.method}`);
    }

    const kyllikkifiedFunction = async (event: APIGatewayEvent): Promise<ApiResponse> => {
      const result = await originalFunction(event);
      return new ApiResponse(result);
    };

    KyllikkiMeta.registerMethod({
      identifierFunction: originalFunction,
      methodName: propertyKey as string,
      kyllikkifiedFunction: kyllikkifiedFunction,
      openApiParams: params
    });
  };
}

function isDuplicate(params: KyllikkiApiParams, propertyKey: string | symbol, descriptor: PropertyDescriptor): boolean {
  const method = KyllikkiMeta.methods.find(method => {
    return method.openApiParams.method === params.method && method.identifierFunction == descriptor.value;
  });
  return method !== undefined;
}
