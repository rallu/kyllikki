import { GET } from "@kyllikki/core";
import { OpenApiResponse } from "@kyllikki/openapi";
import { attribute, table } from "@aws/dynamodb-data-mapper-annotations";
import * as Joi from "joi";

@table("pet")
class Pet {
  @attribute()
  id: string;
}

export class PetsApi {
  @GET("/pets", {
    summary: "Get pets",
    description: `
    # This is markdown description

    It is possible to add markdown as description and display them more beautifully.
    `,
    headers: {
      "x-custom-header": "Some extra header"
    },
    tags: ["pets"],
    responses: {
      200: {
        description: "Normal response"
      }
    },
    validation: {
      body: Joi.object().keys({
        foo: Joi.string()
      }),
      headers: Joi.object()
        .keys({
          bar: Joi.string()
        })
        .required()
    }
  })
  @OpenApiResponse({
    responseCode: 200,
    schema: {
      type: "array",
      items: {
        $ref: "#/components/schemas/pet"
      }
    },
    dynamoReferenceObjects: [
      {
        name: "pet",
        object: new Pet()
      }
    ]
  })
  async getPets(): Promise<Pet[]> {
    return [
      {
        id: "kyllikki"
      },
      {
        id: "fluffy"
      },
      {
        id: "spot"
      }
    ];
  }
}
