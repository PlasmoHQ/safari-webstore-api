import {  test } from "@jest/globals"
import { readFile } from "fs/promises"
import { SafariAppStoreClient, Options } from "~index"

test("test upload test.zip artifact", async () => {
  const key = JSON.parse(await readFile("key.json", "utf8")) as Options
  const client = new SafariAppStoreClient(key)
  const res = await client.submit({
    filePath: "test.zip",
    workspacePath: "/Users/danielsinclair/plasmo"
  })
  console.log(`SafariAppStoreClient response: ${res}`)
})