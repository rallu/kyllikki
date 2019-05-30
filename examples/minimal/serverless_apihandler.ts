import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { ApiRunner } from "@kyllikki/core";
import { PetsApi } from "./pets";

export const main: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  return await new ApiRunner([new PetsApi()]).run(event);
};
