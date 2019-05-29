import { ApiRunner } from "../runner";
import { testEvents } from "./testEvents";
import { GET, POST, DELETE, PUT, ANY } from "../kyllikkiApi";
import { APIGatewayEvent } from "aws-lambda";

class TestError extends Error {}

class TestApi {
  @GET("/test")
  @POST("/test")
  @DELETE("/test")
  @PUT("/test")
  @ANY("/test")
  test() {
    return {
      result: "it works"
    };
  }

  @GET("/throwserror", {
    errors: [
      {
        type: TestError,
        code: 555
      }
    ]
  })
  error(event: APIGatewayEvent) {
    throw new TestError();
  }

  @GET("/unkownerror")
  unknownerror(event: APIGatewayEvent) {
    console.log("unknown error");
    throw new Error();
  }

  @GET("/localmethodtest")
  localmethodtest(event: APIGatewayEvent) {
    return this.localmethod();
  }

  private localmethod() {
    return {
      result: "local works"
    };
  }
}

test("Api Runner can be initialized", () => {
  expect(new ApiRunner([])).toBeDefined();
});

test("Without any routes should end in error", async () => {
  const result = await new ApiRunner([]).run(testEvents.foobar);
  expect(result.statusCode).toBe(404);
});

test("Test api should return to all functions", async () => {
  const api = new ApiRunner([new TestApi()]);
  expect((await api.run(testEvents.testGET)).body).toBe(
    JSON.stringify({
      result: "it works"
    })
  );
  expect((await api.run(testEvents.testPOST)).body).toBe(
    JSON.stringify({
      result: "it works"
    })
  );
  expect((await api.run(testEvents.testDELETE)).body).toBe(
    JSON.stringify({
      result: "it works"
    })
  );
  expect((await api.run(testEvents.testPUT)).body).toBe(
    JSON.stringify({
      result: "it works"
    })
  );

  expect((await api.run(testEvents.testANY)).body).toBe(
    JSON.stringify({
      result: "it works"
    })
  );
});

test("Should return error", async () => {
  const api = new ApiRunner([new TestApi()]);
  const result = await api.run(testEvents.throwsError);
  expect(result.statusCode).toBe(555);

  const unknownResult = await api.run(testEvents.unknownError);
  console.log(unknownResult);
});

test("Local method test should work", async () => {
  const api = new ApiRunner([new TestApi()]);
  expect((await api.run(testEvents.testLocalMethod)).body).toBe(
    JSON.stringify({
      result: "local works"
    })
  );
});
