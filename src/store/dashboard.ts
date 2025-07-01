import { autorun, makeAutoObservable, reaction } from "mobx";
import { RootStore } from "./index";
import { MobxQuery } from "./mobx-query";
import { trpc } from "@/query";
import { MobxMutation } from "./mobx-mutation";

export default class DashboardStore {
  rootStore: RootStore;
  #dashboardQuery = new MobxQuery(
    trpc.exampleTableData.getTableData.queryOptions({
      tableId: "exampleTableId",
    })
  );
  #dashboardQueryDynamic;
  #dashboardMutation;
  tableId: string = "1";

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    {
      let options = trpc.exampleTableData.getTableNumber.queryOptions({
        tableId: "1",
      });
      this.#dashboardQueryDynamic = new MobxQuery({
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
      this.#dashboardMutation = new MobxMutation(options);
    }

    makeAutoObservable(this, undefined, { autoBind: true });

    // trigger dependent query in the same state update, not first in the getter during rendering
    // otherwise we run into "Cannot update a component while rendering a different component"
    // as observer.setOptions(newOpt) -> subscriber.notify() -> changes the queryResult
    // triggering here / in autoRun changes the queryResult and subsequent getter calls to setOptions
    // will NOT notify the subscriber again as the queryHash is the same
    reaction(
      () => this.tableId,
      (tableId) => {
        this.#dashboardQueryDynamic.query(
          // need to construct entire new queryOptions (not just update queryKey) as tRPC's queryFn ignores input?
          trpc.exampleTableData.getTableNumber.queryOptions({
            tableId,
          })
        );
      },
      { fireImmediately: false }
    );
  }

  public async init() {}

  public get data() {
    return this.#dashboardQuery.query();
  }

  public get getTableResult() {
    return this.#dashboardQueryDynamic.query(
      trpc.exampleTableData.getTableNumber.queryOptions({
        tableId: this.tableId,
      })
    );
  }

  public get setTableResult() {
    return this.#dashboardMutation;
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
    return this.#dashboardMutation.mutate({
      tableId: this.tableId,
    });
  }
}
