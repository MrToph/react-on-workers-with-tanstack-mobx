import { t } from "@worker/trpc/trpc-instance";
import { z } from "zod";

const obj: Record<string, number> = {};
const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const exampleTableDataRouter = t.router({
  getTableData: t.procedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ input }) => {
      console.log("Fetching table data for table ID:", input.tableId);
      await sleep(1200);

      // 50% chance to throw an error
      // if (Math.random() < 0.5) {
      //   throw new Error("This is the error thrown from getTableDatabackend");
      // }

      return { dummyData: 3 };
    }),

  getTableNumber: t.procedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ input }) => {
      console.log("Fetching table number for table ID:", input.tableId);
      // await sleep(1200);

      if (!obj[input.tableId]) {
        obj[input.tableId] = Number(input.tableId) * 100;
        console.log(`table ID ${input.tableId}: ${obj[input.tableId]}`);
      }

      if (Math.random() < 0.1) {
        throw new Error("This is the error thrown from getTableNumber backend");
      }
      return { dummyData: obj[input.tableId] };
    }),

  setTableRandom: t.procedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ input }) => {
      // await sleep(1200);

      const randomNumber = Math.floor(Math.random() * 10000) + 1;
      obj[input.tableId] = randomNumber;
      console.log(
        `Set table ID ${input.tableId} to random number: ${randomNumber}`
      );

      if (Math.random() < 0.5) {
        throw new Error("This is the error thrown from setTableRandom backend");
      }
      return { dummyData: randomNumber };
    }),
});
