import * as Joi from "joi";
import { KyllikkiMeta } from "./meta";
import { ApiResponse } from "./response";
import { KyllikkiApiParams } from "./kyllikkiApi";
import { APIGatewayEvent } from "aws-lambda";

export class ApiRunner {
  constructor(apiEndpoints: Array<any>) {
    // Nothing to do them yet. But they need to be listed in order for decorators to run them.
  }

  async run(event: APIGatewayEvent): Promise<any> {
    const method = KyllikkiMeta.methods.find(
      method => method.openApiParams.resource === event.resource && method.openApiParams.method === event.httpMethod
    );

    if (method === undefined) {
      return new ApiResponse(
        {
          error: "Requested api endpoint not found",
          params: {
            method: event.httpMethod,
            resource: event.resource
          }
        },
        404
      ).toApigatewayResponse();
    }

    if (method.openApiParams.validation) {
      try {
        await runValidations(method.openApiParams, event);
      } catch (e) {
        return new ApiResponse(
          {
            error: `Validation error: ${e.message}`
          },
          403
        ).toApigatewayResponse();
      }
    }

    try {
      return (await method.func(event)).toApigatewayResponse();
    } catch (e) {
      if (method.openApiParams.errors) {
        for (const err of method.openApiParams.errors) {
          if (e instanceof err.type) {
            if (err.resolve) {
              return err.resolve(e).toApigatewayResponse();
            } else if (err.code) {
              // @ts-ignore: instanceof focks up e typing
              return new ApiResponse(e.message, err.code);
            }
          }
        }
      }

      return new ApiResponse({ error: "Unhandled server error" }, 500).toApigatewayResponse();
    }
  }
}

async function runValidations(apiParams: KyllikkiApiParams, event: APIGatewayEvent): Promise<any> {
  const promises: any[] = [];
  const validations = apiParams.validation;

  if (!validations) {
    return;
  }

  if (validations.queryStringParameters) {
    promises.push(Joi.validate(event.queryStringParameters || {}, validations.queryStringParameters));
  }
  if (validations.body && event.body) {
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (e) {
      // ignore JSON parse error
    }
    promises.push(Joi.validate(payload || {}, validations.body));
  }
  if (validations.headers) {
    promises.push(Joi.validate(event.headers || {}, validations.headers));
  }
  if (validations.path) {
    promises.push(Joi.validate(event.pathParameters || {}, validations.path));
  }
  return Promise.all(promises);
}
