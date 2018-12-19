import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { OpenApiRunner } from "@kyllikki/core";
import { PetsApi } from "./pets";

export const main: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  return await new OpenApiRunner([new PetsApi()]).runDecorators(event);
};
