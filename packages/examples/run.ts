import { main } from "./minimal/serverless_swaggerhandler";

async function run() {
  const result = await main(null as any, null as any, null as any);
  console.log(result);
}
run();
