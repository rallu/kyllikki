import { APIGatewayProxyResult } from "aws-lambda";
import { CustomApiHeaders } from "./kyllikkiApi";

export class ApiResponse {
  message: any;
  code: number;
  constructor(message: any, code = 200) {
    this.message = message;
    this.code = code;
  }

  toApigatewayResponse(extendHeaders?: CustomApiHeaders): APIGatewayProxyResult {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      ...extendHeaders
    };

    return {
      statusCode: this.code,
      body: JSON.stringify(this.message),
      headers
    };
  }
}
