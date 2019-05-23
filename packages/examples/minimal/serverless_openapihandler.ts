import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { OpenApi } from "@kyllikki/openapi";
import { PetsApi } from "./pets";

export const main: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const result = await new OpenApi([new PetsApi()]).describeApi({
    title: "My Api name",
    version: "0.0.1"
  });
  console.log(JSON.stringify(JSON.parse(result.body), undefined, 2));
  return result;
};
