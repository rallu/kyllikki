import { APIGatewayEvent } from "aws-lambda";
import { OpenApiResponse } from "./response";
import { OpenApiParams } from "./decorators/openApi";
import { JSONSchema7 } from "json-schema";
import { OpenApiResponseParams } from "./decorators/openApiResponse";

type OpenApiFunction = (event: APIGatewayEvent) => OpenApiResponse;

export interface OpenApiFunctionObject {
  identifierFunction: OpenApiFunction;
  methodName: string;
  func: OpenApiFunction;
  openApiParams: OpenApiParams;
  responses?: {
    [code: number]: {
      description?: string;
      content: {
        "application/json": {
          schema: JSONSchema7;
          example?: any;
        };
      };
    };
  };
  openApiResponseParams?: OpenApiResponseParams[];
}

interface OpenApiResponses {
  identifierFunction: OpenApiFunction;
  params: OpenApiResponseParams;
}

export class OpenApiMeta {
  static methods: OpenApiFunctionObject[] = [];
  static responses: OpenApiResponses[] = [];

  static registerMethod(functionParams: OpenApiFunctionObject) {
    functionParams.openApiResponseParams = this.responses
      .filter(response => response.identifierFunction === functionParams.identifierFunction)
      .map(response => response.params);
    this.methods.push(functionParams);
  }

  static registerResponse(identifierFunction: OpenApiFunction, params: OpenApiResponseParams) {
    this.responses.push({
      identifierFunction,
      params
    });
  }

  static getMethod(func: OpenApiFunction): OpenApiFunctionObject | undefined {
    return this.methods.find(method => method.func === func);
  }
}
