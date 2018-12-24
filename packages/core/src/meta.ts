import { APIGatewayEvent } from "aws-lambda";
import { ApiResponse } from "./response";
import { KyllikkiApiParams } from "./kyllikkiApi";

type KyllikkiApiFunction = (event: APIGatewayEvent) => ApiResponse;

export interface OpenApiFunctionObject {
  identifierFunction: KyllikkiApiFunction;
  methodName: string;
  func: KyllikkiApiFunction;
  openApiParams: KyllikkiApiParams;
}

export class KyllikkiMeta {
  public static methods: OpenApiFunctionObject[] = [];

  static registerMethod(functionParams: OpenApiFunctionObject) {
    this.methods.push(functionParams);
  }
}
