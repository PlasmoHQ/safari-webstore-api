import {  test } from "@jest/globals"
import { readFile } from "fs/promises"
import { SafariAppStoreClient, Options } from "~index"

test("test upload test.zip artifact", async () => {
  const key = JSON.parse(await readFile("key.json", "utf8")) as Options
  const client = new SafariAppStoreClient(key)
  await client.convert({ filePath: "test.zip" })
  await client.produce({})
  await client.build({})
  await client.pilot({})
  await client.submit({})
})