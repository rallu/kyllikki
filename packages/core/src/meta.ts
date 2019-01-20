import { APIGatewayEvent } from "aws-lambda";
import { ApiResponse } from "./response";
import { KyllikkiApiParams } from "./kyllikkiApi";

type KyllikkiApiFunction = (event: APIGatewayEvent, body?: any) => Promise<ApiResponse>;

export interface OpenApiFunctionObject {
  identifierFunction: KyllikkiApiFunction;
  methodName: string;
  kyllikkifiedFunction: KyllikkiApiFunction;
  openApiParams: KyllikkiApiParams;
}

export class KyllikkiMeta {
  public static methods: OpenApiFunctionObject[] = [];

  static registerMethod(functionParams: OpenApiFunctionObject) {
    this.methods.push(functionParams);
  }
}
