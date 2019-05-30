import { APIGatewayEvent } from "aws-lambda";
import * as Joi from "joi";
import { ApiResponse } from "./response";
import { KyllikkiRootObject } from "./runner";

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
    if (!target["Kyllikki"]) {
      target["Kyllikki"] = [];
    }

    const duplicate = (target["Kyllikki"] as KyllikkiRootObject[]).find(
      item => item.openApiParams.resource === params.resource && item.openApiParams.method === params.method
    );
    if (duplicate) {
      throw new Error(`Resource ${params.method} ${params.resource} has already been registered to this class!`);
    }

    const rootObject: KyllikkiRootObject = {
      methodName: propertyKey,
      openApiParams: params,
      identifierFunction: descriptor.value
    };
    target["Kyllikki"].push(rootObject);
  };
}
