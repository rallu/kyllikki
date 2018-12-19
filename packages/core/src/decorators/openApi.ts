import { APIGatewayEvent } from "aws-lambda";
import * as Joi from "joi";
import { OpenApiMeta } from "../meta";
import { OpenApiResponse } from "../response";

export interface OpenApiValidations {
  queryStringParameters?: Joi.ObjectSchema;
  body?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
  path?: Joi.ObjectSchema;
}

interface OpenApiErrorParams {
  type: Function;
  resolve?: OpenApiError;
  code: number;
  description?: string;
}

export interface OpenApiParams {
  method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH" | "ANY";
  resource: string;
  summary?: string;
  description?: string;
  tags?: Array<string>;
  validation?: OpenApiValidations;
  responses?: {
    [code: number]: {
      description: string;
    };
  };
  errors?: Array<OpenApiErrorParams>;
}

export type OpenApiError = (error: any) => OpenApiResponse;

export function OpenApi(params: OpenApiParams) {
  return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalFunction = descriptor.value;

    descriptor.value = async (event: APIGatewayEvent) => {
      const result = await originalFunction(event);
      return new OpenApiResponse(result);
    };

    OpenApiMeta.registerMethod({
      identifierFunction: originalFunction,
      methodName: propertyKey as string,
      func: descriptor.value,
      openApiParams: params
    });
  };
}
