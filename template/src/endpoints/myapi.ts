import { APIGatewayEvent } from "aws-lambda";
import { GET } from "@kyllikki/core";

export class MyApi {
  @GET("/hello")
  async hello(event: APIGatewayEvent) {
    return {
      message: "Hello from Kyllikki! Your function excecuted succesfully!",
      input: event
    };
  }
}
