import { autorun, makeAutoObservable } from "mobx";
import { RootStore } from "./index";
import { MobxQuery } from "./mobx-query";
import { trpc } from "@/query";
import { MobxMutation } from "./mobx-mutation";

export default class DashboardStore {
  rootStore: RootStore;
  #dashboardQueryResult = new MobxQuery(
    trpc.exampleTableData.getTableData.queryOptions({
      tableId: "exampleTableId",
    })
  );
  #dashboardQueryResultDynamic;
  #dashboardMutationResult;
  tableId: string = "1";

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    {
      let options = trpc.exampleTableData.getTableNumber.queryOptions({
        tableId: "1",
      });
      this.#dashboardQueryResultDynamic = new MobxQuery({
        ...options,
      });
    }

    {
      let options = trpc.exampleTableData.setTableRandom.mutationOptions({
        onSuccess: (_output, input) => {
          this.rootStore.queryClient
            .invalidateQueries({
              queryKey: trpc.exampleTableData.getTableNumber.queryKey({
                tableId: input.tableId,
              }),
            })
            .catch((err) => console.error(err));
        },
      });
      this.#dashboardMutationResult = new MobxMutation(options);
    }

    makeAutoObservable(this, undefined, { autoBind: true });

    // trigger dependent query in the same state update, not first in the getter during rendering
    // otherwise we run into "Cannot update a component while rendering a different component"
    // as observer.setOptions(newOpt) -> subscriber.notify() -> changes the queryResult
    // triggering here / in autoRun changes the queryResult and subsequent getter calls to setOptions
    // will NOT notify the subscriber again as the queryHash is the same
    autorun(() => {
      this.#dashboardQueryResultDynamic.query(
        // need to construct entire new queryOptions (not just update queryKey) as tRPC's queryFn ignores input?
        trpc.exampleTableData.getTableNumber.queryOptions({
          tableId: this.tableId,
        })
      );
    });
  }

  public async init() {}

  public get data() {
    return this.#dashboardQueryResult.query();
  }

  public get getTableResult() {
    return this.#dashboardQueryResultDynamic.query(
      trpc.exampleTableData.getTableNumber.queryOptions({
        tableId: this.tableId,
      })
    );
  }

  public get setTableResult() {
    return this.#dashboardMutationResult;
  }

  public incrementTableId() {
    this.tableId = (Number(this.tableId) + 1).toString();
  }

  public decrementTableId() {
    this.tableId = Math.max(1, Number(this.tableId) - 1).toString();
  }

  public get canDecrementTableId() {
    return Number(this.tableId) > 1;
  }

  public async setTableToRandom() {
    return this.#dashboardMutationResult.mutate({
      tableId: this.tableId,
    });
  }
}
