import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { OpenApi } from "@kyllikki/openapi";
import { PetsApi } from "./pets";

export const main: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  return await new OpenApi([new PetsApi()]).describeApi({
    title: "My Api name",
    version: "0.0.1"
  });
};
