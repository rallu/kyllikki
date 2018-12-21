export interface OpenApiServer {
  url: string;
  description?: string;
}

export interface OpenApiExternalDocs {
  url: string;
  description?: string;
}

export interface OpenApiTag {
  name: string;
  description?: string;
  externalDocs?: OpenApiExternalDocs;
}

export interface OpenApiSecurityRequirement {
  [scheme: string]: string[];
}

export interface OpenApiSecuritySchemes {
  [scheme: string]: {
    type: string;
    description?: string;
    name?: string;
    in?: string;
    scheme?: string;
    bearerFormat?: string;
    flows?: {
      [flow: string]: {
        authorizationUrl?: string;
        tokenUrl?: string;
        refreshUrl?: string;
        scopes?: {
          [scope: string]: string;
        };
      };
    };
    openIdConnectUrl?: string;
  };
}

export interface OpenApiComponents {
  schemas?: any;
  requestBodies?: any;
  securitySchemes?: OpenApiSecuritySchemes;
}

export interface OpenApiPaths {
  [path: string]: {
    [method: string]: OpenApiPathSchema;
  };
}

export interface OpenApiPathSchema {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  responses: {
    [responseCode: string]: {
      description?: string;
      content?: any;
    };
  };
  parameters?: OpenApiParameter[];
  requestBody?: any;
  definitions?: any;
}

export type OpenApiParameterIn = "query" | "header" | "path" | "cookie";

export interface OpenApiParameter {
  name: string;
  in: OpenApiParameterIn;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema: any;
}

export interface OpenApiInfo {
  title: string;
  description?: string;
  version: string;
  termsOfService?: string;
  license?: {
    name: string;
    url?: string;
  };
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
}
