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

    descriptor.value = async (event: APIGatewayEvent) => {
      const result = await originalFunction(event);
      return new ApiResponse(result);
    };

    KyllikkiMeta.registerMethod({
      identifierFunction: originalFunction,
      methodName: propertyKey as string,
      func: descriptor.value,
      openApiParams: params
    });
  };
}
