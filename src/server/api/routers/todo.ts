import { TRPCError } from "@trpc/server";
import { Input } from "postcss";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const todoRouter = createTRPCRouter({
  getTodos: publicProcedure
    .input(z.object({
      sortWithComplete: z.boolean()
    }).optional())
    .query(({ ctx, input }) => {
      const { db } = ctx
      return db.todo.findMany({
        orderBy: input?.sortWithComplete
          ? { complete: 'desc' }
          : { createdAt: 'desc' }
      }) ?? []
    }),
  createTodo: publicProcedure
    .input(z.object({
      title: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx
      const { title } = input
      const newTodo = await db.todo.create({
        data: {
          title
        }
      })
      return {
        state: 200,
        message: 'success add todo'
      }
    }),
  deleteToto: publicProcedure
    .input(z.object({
      id: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx
      const { id } = input
      const targetTodo = await db.todo.findFirst({
        where: {
          id
        }
      })
      if (!targetTodo) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "Todo not found"
        })
      }
      await db.todo.delete({
        where: {
          id
        }
      })

      return {
        state: 200,
        message: 'success delete todo'
      }
    }),
  toggleTodo: publicProcedure
    .input(z.object({
      id: z.number(),
      complete: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx
      const { id, complete } = input
      const todo = await db.todo.findFirst({
        where: {
          id
        }
      })
      if (!todo) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'todo not found'
        })
      }
      await db.todo.update({
        where: {
          id
        },
        data: {
          complete
        }
      })

      return {
        state: 200,
        message: 'success toggle todo'
      }
    })
});
