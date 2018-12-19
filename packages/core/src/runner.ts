import { APIGatewayEvent } from "aws-lambda";
import * as Joi from "joi";
import * as joiJson from "joi-to-json-schema";
import { OpenApiMeta } from "./meta";
import {
  OpenApiInfo,
  OpenApiParameter,
  OpenApiParameterIn,
  OpenApiPaths,
  OpenApiPathSchema,
  OpenApiServer
} from "./model";
import { OpenApiResponse } from "./response";
import { OpenApiParams, OpenApiValidations } from "./decorators/openApi";
import { generateJsonSchema } from "./awsDataMapperToJSON";

const joiToJsonConvert = joiJson.default;

export class OpenApiRunner {
  constructor(apiEndpoints: Array<any>) {
    // Nothing to do them yet. But they need to be listed in order for decorators to run them.
  }

  async runDecorators(event: APIGatewayEvent): Promise<any> {
    const method = OpenApiMeta.methods.find(
      method => method.openApiParams.resource === event.resource && method.openApiParams.method === event.httpMethod
    );

    if (method === undefined) {
      return new OpenApiResponse(
        {
          error: "Requested api endpoint not found"
        },
        404
      ).toApigatewayResponse();
    }

    if (method.openApiParams.validation) {
      try {
        await runValidations(method.openApiParams, event);
      } catch (e) {
        return new OpenApiResponse(
          {
            error: e.message
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
              return new OpenApiResponse(e.message, err.code);
            }
          }
        }
      }

      return new OpenApiResponse({ error: "Unhandled server error" }, 500).toApigatewayResponse();
    }
  }

  async describeApi(apiInfo: OpenApiInfo, servers?: OpenApiServer[]): Promise<any> {
    const components = {
      schemas: {}
    };
    const openApiPaths: OpenApiPaths = {};

    OpenApiMeta.methods.forEach(method => {
      const schema: OpenApiPathSchema = {
        operationId: method.methodName,
        responses: {
          "200": {
            description: "Successfull response"
          }
        },
        tags: method.openApiParams.tags,
        summary: method.openApiParams.summary
      };

      if (method.openApiParams.errors) {
        method.openApiParams.errors.forEach(error => {
          schema.responses[error.code] = {
            description: error.description || "Undocumented error"
          };
        });
      }

      if (method.openApiParams.validation) {
        generateValidationsSpec(method.openApiParams.validation, schema, method.openApiParams.resource);
      }

      if (method.openApiResponseParams) {
        method.openApiResponseParams.forEach(responseParams => {
          if (responseParams.schema) {
            schema.responses[responseParams.responseCode] = {
              description: responseParams.description || "",
              content: {
                "application/json": {
                  schema: responseParams.schema
                }
              }
            };
          }
          if (responseParams.dynamoReferenceObjects) {
            responseParams.dynamoReferenceObjects.forEach(definition => {
              components.schemas[definition.name] = generateJsonSchema(definition.object);
            });
          }
        });
      }

      if (!openApiPaths[method.openApiParams.resource]) {
        openApiPaths[method.openApiParams.resource] = {};
      }
      openApiPaths[method.openApiParams.resource][method.openApiParams.method.toLocaleLowerCase()] = schema;
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        openapi: "3.0.0",
        info: apiInfo,
        paths: openApiPaths,
        servers,
        components
      })
    };
  }
}

function generateValidationsSpec(validation: OpenApiValidations, schema: OpenApiPathSchema, resource: string) {
  schema.parameters = [];
  if (validation.queryStringParameters) {
    const queryStringValidatorSchemas = joiToJsonConvert(validation.queryStringParameters);
    schema.parameters.push(...validatorsToOpenApiSchema(queryStringValidatorSchemas, "query"));
  }
  if (validation.body) {
    const bodyValidatorSchemas = joiToJsonConvert(validation.body);
    if (bodyValidatorSchemas.patterns && bodyValidatorSchemas.patterns.length === 0) {
      delete bodyValidatorSchemas.patterns;
    }
    schema.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: bodyValidatorSchemas
        }
      }
    };
  }
  if (validation.path) {
    const pathValidatorsSchemas = joiToJsonConvert(validation.path);
    schema.parameters.push(...validatorsToOpenApiSchema(pathValidatorsSchemas, "path"));
  } else {
    resource.split("/").forEach(param => {
      if (isPathParameter(param)) {
        const name = param.substr(1, param.length - 2);
        schema.parameters!.push({
          in: "path",
          name,
          required: true,
          schema: {
            type: "string"
          }
        });
      }
    });
  }
}

function validatorsToOpenApiSchema(queryStringValidatorSchemas: any, type: OpenApiParameterIn): OpenApiParameter[] {
  const params: OpenApiParameter[] = [];
  for (const propertyKey in queryStringValidatorSchemas.properties) {
    const required =
      queryStringValidatorSchemas.required && queryStringValidatorSchemas.required.indexOf(propertyKey) > -1;
    const description = queryStringValidatorSchemas.properties[propertyKey].description || undefined;
    const param: OpenApiParameter = {
      in: type,
      name: propertyKey,
      required,
      description,
      schema: queryStringValidatorSchemas.properties[propertyKey]
    };
    params.push(param);
  }
  return params;
}

async function runValidations(apiParams: OpenApiParams, event: APIGatewayEvent): Promise<any> {
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

function isPathParameter(pathPart: string) {
  return pathPart.substr(0, 1) === "{" && pathPart.substr(-1, 1) === "}";
}
