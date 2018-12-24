import { JSONSchema7 } from "json-schema";
import { ResponseStore } from "./store";

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
    ResponseStore.registerResponse(descriptor.value, params);
  };
}
