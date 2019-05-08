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
  summary?: string;
  description?: string;
  tags?: Array<string>;
  validation?: ApiValidations;
  responses?: {
    [code: number]: {
      description: string;
    };
  };
  errors?: Array<ApiErrorParams>;
  headers?: CustomApiHeaders;
}

export interface CustomApiHeaders {
  [key: string]: string;
}

export type OpenApiError = (error: any) => ApiResponse;

export function GET(resource: string, params?: ApiParams) {
  return KyllikkiApi({
    method: "GET",
    resource,
    ...params
  });
}

export function POST(resource: string, params?: ApiParams) {
  return KyllikkiApi({
    method: "POST",
    resource,
    ...params
  });
}

export function DELETE(resource: string, params?: ApiParams) {
  return KyllikkiApi({
    method: "DELETE",
    resource,
    ...params
  });
}

export function PUT(resource: string, params?: ApiParams) {
  return KyllikkiApi({
    method: "PUT",
    resource,
    ...params
  });
}

export function PATCH(resource: string, params?: ApiParams) {
  return KyllikkiApi({
    method: "PATCH",
    resource,
    ...params
  });
}

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
