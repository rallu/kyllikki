import { KyllikkiRootObject } from "@kyllikki/core";
import {
  OpenApiInfo,
  OpenApiParameter,
  OpenApiParameterIn,
  OpenApiPaths,
  OpenApiPathSchema,
  OpenApiServer
} from "./model";
import { generateJsonSchema } from "./awsDataMapperToJSON";
import * as joiJson from "joi-to-json-schema";
import { ResponseStore } from "./store";
import { swaggerui } from "./swaggerui";

const KyllikkiRootObjectName = "[kyllikki]";
const joiToJsonConvert = joiJson.default;

export class OpenApi {
  apiEndpoints: Array<Object>;
  constructor(apiEndpoints: Array<Object>) {
    this.apiEndpoints = apiEndpoints;
  }

  async generateOpenApiV3JSON(apiInfo: OpenApiInfo, servers?: OpenApiServer[]): Promise<any> {
    const components = {
      schemas: {}
    };
    const openApiPaths: OpenApiPaths = {};

    this.apiEndpoints
      .filter(klass => klass[KyllikkiRootObjectName])
      .map(klass => {
        return { klass, methods: klass[KyllikkiRootObjectName] as KyllikkiRootObject[] };
      })
      .forEach(({ klass, methods }) => {
        methods.forEach(method => {
          const schema: OpenApiPathSchema = {
            operationId: method.methodName.toString(),
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
            const validation = method.openApiParams.validation;
            const resource = method.openApiParams.resource;
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
            if (validation.headers) {
              const headerValidatorSchemas = joiToJsonConvert(validation.headers);
              schema.parameters.push(...validatorsToOpenApiSchema(headerValidatorSchemas, "header"));
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

          ResponseStore.getParams(klass, method.identifierFunction).forEach(responseParams => {
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

          if (!openApiPaths[method.openApiParams.resource]) {
            openApiPaths[method.openApiParams.resource] = {};
          }
          openApiPaths[method.openApiParams.resource][method.openApiParams.method.toLocaleLowerCase()] = schema;
        });
      });

    return {
      openapi: "3.0.0",
      info: apiInfo,
      paths: openApiPaths,
      servers,
      components
    };
  }

  async describeApi(apiInfo: OpenApiInfo, servers?: OpenApiServer[]) {
    const result = await this.generateOpenApiV3JSON(apiInfo, servers);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      }
    };
  }

  async swaggerUI(apiInfo: OpenApiInfo, servers?: OpenApiServer[]) {
    const result = await this.generateOpenApiV3JSON(apiInfo, servers);
    return {
      statusCode: 200,
      body: swaggerui(result),
      headers: {
        "Content-Type": "text/html"
      }
    };
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

function isPathParameter(pathPart: string) {
  return pathPart.substr(0, 1) === "{" && pathPart.substr(-1, 1) === "}";
}
