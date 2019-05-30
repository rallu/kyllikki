import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { OpenApi } from "@kyllikki/openapi";
import { PetsApi } from "./pets";

export const main: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const result = await new OpenApi([new PetsApi()]).swaggerUI({
    title: "My Api name",
    version: "0.0.1",
    description: "This just normal description of the API."
  });
  return result;
};
