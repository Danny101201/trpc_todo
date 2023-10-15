import { db } from "~/server/db";
import { faker } from '@faker-js/faker'
import { Prisma } from "@prisma/client";

const dataCount = 100
const main = async () => {
  await db.todo.deleteMany({})
  const promiseTodos =
    new Array(dataCount)
      .fill('_')
      .map(() => db.todo.create({
        data: {
          title: faker.lorem.words({ min: 1, max: 3 }),
          complete: faker.datatype.boolean({ probability: 0.5 })
        }
      }))
  await db.$transaction(promiseTodos)
  console.log(`success add seed data`)
}
main()
  .catch(async (e) => {
    console.log(e)
    await db.$disconnect()
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })