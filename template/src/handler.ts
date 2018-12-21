import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { ApiRunner } from "@kyllikki/core";
import { MyApi } from "./endpoints/myapi";

export const main: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  return await new ApiRunner([new MyApi()]).run(event);
};
