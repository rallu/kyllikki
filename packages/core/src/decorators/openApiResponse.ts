import { OpenApiMeta } from "./../meta";
import { JSONSchema7 } from "json-schema";

export interface OpenApiResponseParams {
  responseCode: number;
  description?: string;
  schema?: JSONSchema7;
  dynamoReferenceObjects?: DynamoReferenceObject[];
  example?: JSON;
}

interface DynamoReferenceObject {
  name: string;
  object: object;
}

export function OpenApiResponse(params: OpenApiResponseParams) {
  return function(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    OpenApiMeta.registerResponse(descriptor.value, params);
  };
}
