import { APIGatewayEvent } from "aws-lambda";
import { ApiResponse } from "./response";
import { KyllikkiApiParams } from "./kyllikkiApi";
import { JSONSchema7 } from "json-schema";

type KyllikkiApiFunction = (event: APIGatewayEvent) => ApiResponse;

export interface OpenApiFunctionObject {
  identifierFunction: KyllikkiApiFunction;
  methodName: string;
  func: KyllikkiApiFunction;
  openApiParams: KyllikkiApiParams;
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
}

export class KyllikkiMeta {
  public static methods: OpenApiFunctionObject[] = [];

  static registerMethod(functionParams: OpenApiFunctionObject) {
    this.methods.push(functionParams);
  }
}
