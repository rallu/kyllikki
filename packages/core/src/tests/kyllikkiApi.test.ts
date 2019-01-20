import { GET } from "../kyllikkiApi";

test("Trying to create same api endpoint twice should fail", async () => {
  expect(() => {
    class ShouldFailApi {
      @GET("/same")
      @GET("/same")
      something() {}
    }
    new ShouldFailApi();
  }).toThrowError("already registered");
});
