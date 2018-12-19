import { OpenApiResponseParams } from "./decorators";

interface IResponse {
  identifierFunction: Function;
  params: OpenApiResponseParams;
}

export class ResponseStore {
  static responses: IResponse[] = [];
  static registerResponse(identifierFunction: Function, params: OpenApiResponseParams) {
    this.responses.push({
      identifierFunction,
      params
    });
  }

  static getParams(identifierFunction: Function): OpenApiResponseParams[] {
    return this.responses
      .filter(response => response.identifierFunction === identifierFunction)
      .map(response => response.params);
  }
}
