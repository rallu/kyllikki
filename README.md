# Kyllikki framework (work-in-process)

Kyllikki is highly opionated framework for building AWS Lambda API [Serverless](www.serverless.com) endpoints with typescript decorators. Goal is to generate code that is easy to read and understand how your API works. For that reason @decorator based aproach is used. It is build with idea that code should generate documentation for the API.

It has several limitations:

- All data is JSON. No other choices.
- Everything is build around AWS Api Gateway.

But also freedom:

- You can choose the way to group your code.
- No path based rules
- Works well with webpack and other builders => very small lambdas

## Basic example

Define your code in a class. For example this could be in `cats.ts`.

```typescript
import { APIGatewayEvent } from "aws-lambda";
import { myCatStore } from "somewhere"; // this is foobar
import { GET, POST } from "@kyllikki/core";

export class Cats {
  @GET("/cats")
  async listCats() {
    // return value should be something that can be JSON.stringifi()ed.
    return ["kyllikki", "spot", "neko-chan"];
  }

  @GET("/cat/:id")
  async getCat(event: APIGatewayEvent) {
    return {
      cat: await myCatStore.get(event.pathParameters.id)
    };
  }

  @POST("/cat")
  async saveCat(event: APIGatewayEvent) {
    await myCatStore.save(JSON.parse(event.body));
    return {
      succesfull: true
    };
  }
}
```

Then define in your serverless handler `handler.ts`

```typescript
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { Cats } from "./cats.ts";
import { ApiRunner } from "@kyllikki/core";

export const main: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  return await new ApiRunner([
    new Cats() // List of classes you wish for this handler to respond to
  ]).runDecorators(event);
};
```
