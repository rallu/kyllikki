import { OpenApiResponseParams } from "./decorators";

export const OpenApiRootObjectName = "[KyllikkiOpenApi]";

export class ResponseStore {
  static registerResponse(target: any, identifierFunction: Function, params: OpenApiResponseParams) {
    if (!target[OpenApiRootObjectName]) {
      target[OpenApiRootObjectName] = [];
    }
    target[OpenApiRootObjectName].push({
      identifierFunction,
      params
    });
  }

  static getParams(target, identifierFunction: Function): OpenApiResponseParams[] {
    return target[OpenApiRootObjectName].filter(response => response.identifierFunction === identifierFunction).map(
      response => response.params
    );
  }
}
