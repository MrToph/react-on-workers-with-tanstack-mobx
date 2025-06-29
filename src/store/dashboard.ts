import { makeAutoObservable } from "mobx";
import { RootStore } from "./index";
import { MobxQuery } from "./mobx-query";
import { trpc } from "@/query";

export default class DashboardStore {
  rootStore: RootStore;
  #dashboardQueryResult = new MobxQuery(
    trpc.exampleTableData.getTableData.queryOptions({
      tableId: "exampleTableId",
    })
  );
  #dashboardQueryResultDynamic;
  tableId: string = "1";

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    let options = trpc.exampleTableData.getTableData.queryOptions({
      tableId: "1",
    });
    this.#dashboardQueryResultDynamic = new MobxQuery(options);

    makeAutoObservable(this, undefined, { autoBind: true });

    // fetch data for tableId=1
    this.#dashboardQueryResult.query();
    this.#dashboardQueryResultDynamic.query();
  }

  public async init() {}

  public get data() {
    return this.#dashboardQueryResult.result;
  }

  public get dataDynamic() {
    return this.#dashboardQueryResultDynamic.result;
  }

  public incrementTableId() {
    this.tableId = (Number(this.tableId) + 1).toString();
    return this.#dashboardQueryResultDynamic.query({
      queryKey: trpc.exampleTableData.getTableData.queryKey({
        tableId: this.tableId,
      }),
    });
  }
}
