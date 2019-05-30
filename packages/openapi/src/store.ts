import { OpenApiResponseParams } from "./decorators";

interface IResponse {
  identifierFunction: Function;
  params: OpenApiResponseParams;
}

export class ResponseStore {
  static registerResponse(target: any, identifierFunction: Function, params: OpenApiResponseParams) {
    if (!target["KyllikkiOpenApi"]) {
      target["KyllikkiOpenApi"] = [];
    }
    target["KyllikkiOpenApi"].push({
      identifierFunction,
      params
    });
  }

  static getParams(target, identifierFunction: Function): OpenApiResponseParams[] {
    return target["KyllikkiOpenApi"]
      .filter(response => response.identifierFunction === identifierFunction)
      .map(response => response.params);
  }
}
