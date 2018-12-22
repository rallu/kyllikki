# Kyllikki API framework (work-in-process)

Kyllikki is highly opionated framework for building AWS Lambda API [Serverless](https://www.serverless.com) endpoints with typescript decorators. Goal is to generate code that is easy to read and understand how your API works. For that reason @decorator based aproach is used. It is build with idea that code should generate OpenApi v3+ documentation from the API.

This library works well with [Serverless-webpack](https://github.com/serverless-heaven/serverless-webpack). Requires experimental decorators supports in `tsconfig.json`. Add `"experimentalDecorators": true` to `compilerOptions`.

Has lot of freedom:

- You can choose the way to group and organize your code.
- No path based rules
- Works well with webpack and other builders => very small lambdas

It has several limitations:

- All data is JSON. No other choices.
- Everything is build around AWS Api Gateway. (May change in the future)

## Quick start

Requires serverless cli installed globally _(npm install -g serverless)_

```bash
> serverless create --template-url https://github.com/rallu/kyllikki/tree/master/template --path myproject
> cd myproject
> npm install
```

And then you can run the hello world to test it.

```bash
> serverless invoke local -f hello --data '{"resource": "/hello", "httpMethod": "GET"}'
```

## Basic examples

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

Then define in your serverless handler `handler.ts`. ApiRunner takes list of your classes that this handler should reply to.

```typescript
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { Cats } from "./cats.ts";
import { ApiRunner } from "@kyllikki/core";

export const main: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  return await new ApiRunner([
    new Cats() // List of classes you wish for this handler to respond to
  ]).run(event);
};
```

### Input validation

Input validation system uses [joi](https://github.com/hapijs/joi) to validate incoming data. On failing validation 400 HTTP error is thrown.

```typescript
{...}
import * as joi from "joi";

export class Cats {
  {...}

  @POST("/cat", {
    validation: {
      body: joi.object().keys({
        name: joi.string().required()
      })
    }
  })
  async saveCat(event: APIGatewayEvent) {
    await myCatStore.save(JSON.parse(event.body));
    return {
      succesfull: true
    };
  }
}
```

### Error handling

Kyllikki detects errors thrown in the declared functions and processes them before sending errors back.

```typescript
{...}
import { MyCatStoreSaveError } from "./myErrors.ts";

export class Cats {
  {...}

  @POST("/cat", {
    errors: [
      {
        type: MyCatStoreSaveError,
        code: 400,
        description: "Failing to save cat"
      }
    ]
  })
  async saveCat(event: APIGatewayEvent) {
    await myCatStore.save(JSON.parse(event.body)); // may throw `new MyCatStoreSaveError`
    return {
      succesful: true
    };
  }
}
```

### Overriding error handling

In some cases you might wish to handle error yourself or return something else back. This can be done in the function or with special `resolve` parameter.

```typescript
{...}
import { ApiResponse } from "@kyllikki/core";

export class Cats {
  {...}

  @POST("/cat", {
    errors: [
      {
        type: MyCatStoreSaveError,
        code: 400,
        description: "Cat might been saved",
        resolve: (error): ApiResponse => {
          //This overrides all settings
          return new ApiResponse({
            success: "nothing happened! I promise! Really, all good."
          }, 200);
        }
      }
    ]
  })
  async saveCat(event: APIGatewayEvent) {
    await myCatStore.save(JSON.parse(event.body)); // may throw `new MyCatStoreSaveError`
    return {
      succesfull: true
    };
  }
}
```

## OpenApi document generation

Documenting your Api endpoints happen right where your function is.

```typescript
import { GET, POST } from "@kyllikki/core";

export class Cats {
  @GET("/cats", {
    summary: "List all cats",
    description:
      "This **should** be Markdown enabled description of your API endpoint. It should elaborate quite well what it does.",
    tags: ["cats", "listing"],
    responses: {
      "200": {
        description: "Lists three cats in our system"
      }
    }
  })
  async listCats() {
    // return value should be something that can be JSON.stringifi()ed.
    return ["kyllikki", "spot", "neko-chan"];
  }
}
```

All this can be generated to OpenApi v3.0.0 documentation using `@kyllikki/openapi` package.

```typescript
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import { Cats } from "./cats.ts";
import { OpenApi } from "@kyllikki/openapi";

export const main: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  return await new OpenApi([
    new Cats() // List of classes you wish to add in the document
  ]).describeApi({
    title: "My Cat Api",
    version: "1.0.0"
  });
};
```

### More complicated response documentation

`@kyllikki/openapi` has support to write JSON schemas for your responses.

```typescript
import { GET, POST } from "@kyllikki/core";
import { OpenApiResponse } from "@kyllikki/openapi";

export class Cats {
  @GET("/cats", {
    summary: "List all cats",
    description:
      "This **should** be Markdown enabled description of your API endpoint. It should elaborate quite well what it does.",
    tags: ["cats", "listing"],
    responses: {
      "200": {
        description: "Lists three cats in our system"
      }
    }
  })
  @OpenApiResponse({
    responseCode: 200,
    schema: {
      type: "Array",
      items: {
        type: "String"
      }
    }
  })
  async listCats() {
    // return value should be something that can be JSON.stringifi()ed.
    return ["kyllikki", "spot", "neko-chan"];
  }
}
```

### Automatic response schema generation from DynamoDB objects

Todo.
