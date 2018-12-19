import { OpenApi } from "../../packages/core";
import { OpenApiResponse } from "../../packages/core";
import { attribute, table } from "@aws/dynamodb-data-mapper-annotations";
import * as Joi from "joi";

@table("pet")
class Pet {
  @attribute()
  id: string;
}

export class PetsApi {
  @OpenApi({
    method: "GET",
    resource: "/pets",
    validation: {
      body: Joi.object().keys({
        foo: Joi.string()
      })
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
        id: "fluffy"
      },
      {
        id: "spot"
      }
    ];
  }
}
