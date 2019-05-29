import * as Joi from "joi";
import { KyllikkiMeta } from "./meta";
import { ApiResponse } from "./response";
import { KyllikkiApiParams } from "./kyllikkiApi";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

interface iLogger {
  info: Function;
  log: Function;
  error: Function;
  warn: Function;
}

export class ApiRunner {
  logger: iLogger;
  constructor(apiEndpoints: Array<any>, logger?: iLogger) {
    this.logger = logger || {
      info: () => undefined,
      log: () => undefined,
      error: () => undefined,
      warn: () => undefined
    };
  }

  /**
   * Find and run methods registered to Kyllikki.
   *
   * @param event Event passed from handler
   */
  async run(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
    const method = KyllikkiMeta.methods.find(
      method => method.openApiParams.resource === event.resource && method.openApiParams.method === event.httpMethod
    );

    if (method === undefined) {
      const params = {
        method: event.httpMethod,
        resource: event.resource
      };
      this.logger.warn("Api endpoint not found", params);
      return new ApiResponse(
        {
          error: "Requested api endpoint not found",
          params
        },
        404
      ).toApigatewayResponse();
    }

    if (method.openApiParams.validation) {
      try {
        await runValidations(method.openApiParams, event);
      } catch (e) {
        this.logger.warn("Validation error", e.message);
        return new ApiResponse(
          {
            error: `Validation error: ${e.message}`
          },
          403
        ).toApigatewayResponse();
      }
    }

    try {
      this.logger.info("Running function", event.httpMethod, event.resource);
      return (await method.kyllikkifiedFunction(event, parseBody(event))).toApigatewayResponse(
        method.openApiParams.headers
      );
    } catch (e) {
      if (typeof method.openApiParams.errors !== "undefined") {
        for (const err of method.openApiParams.errors) {
          if (e instanceof err.type) {
            if (err.resolve) {
              return err.resolve(e).toApigatewayResponse();
            } else if (err.code) {
              // @ts-ignore: instanceof focks up e typing
              return new ApiResponse(e.message, err.code).toApigatewayResponse();
            }
          }
        }
      }
      this.logger.error("Error thrown", e);
      // as default return error
      throw e;
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
    let payload = parseBody(event);
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

function parseBody(event: APIGatewayEvent): any | undefined {
  if (!event.body) {
    return undefined;
  }

  try {
    return JSON.parse(event.body);
  } catch (e) {
    // ignore JSON parse error
  }
  return undefined;
}
