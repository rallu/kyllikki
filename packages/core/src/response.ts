import { APIGatewayProxyResult } from "aws-lambda";

export class OpenApiResponse {
  message: any;
  code: number;
  constructor(message: any, code = 200) {
    this.message = message;
    this.code = code;
  }

  toApigatewayResponse(): APIGatewayProxyResult {
    return {
      statusCode: this.code,
      body: JSON.stringify(this.message),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      }
    };
  }
}
