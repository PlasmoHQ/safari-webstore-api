import {  test } from "@jest/globals"
import { readFile } from "fs/promises"
import { SafariPublisher, Options } from "~index"

test("test upload test.zip artifact", async () => {
  const key = JSON.parse(await readFile("key.json", "utf8")) as Options
  const client = new SafariPublisher(key)
  await client.submit({ filePath: "test.zip" })
})