import {
  observable,
  action,
  computed,
  makeObservable,
  makeAutoObservable,
} from "mobx";
import { RootStore } from "./index";
import { MobxQuery } from "./mobx-query";
import { trpc } from "@/query";

export default class DashboardStore {
  rootStore: RootStore;
  // #dashboardQueryResult = new MobxQuery(
  //   trpc.exampleTableData.getTableData.queryOptions({
  //     tableId: "exampleTableId",
  //   })
  // );
  #dashboardQueryResultDynamic
  tableId: string = "1";

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    let options = trpc.exampleTableData.getTableData.queryOptions({
      tableId: "1",
    });
    this.#dashboardQueryResultDynamic = new MobxQuery(
      // for dynamic queries, we can't provide the `input` object yet. so just pass a {} to queryOptions. the actual one will get overridden later when we use query(newOptionsWithInput)
      // { queryKey: options.queryKey, queryFn }
      options
    );


    // makeObservable(this, {
    //   tableId: observable,
    //   // data: computed,
    //   dataDynamic: computed,
    //   incrementTableId: action,
    // });
    makeAutoObservable(this, undefined, { autoBind: true });
  }

  public async init() {}

  // public get data() {
  //   return this.#dashboardQueryResult.query();
  // }

  public get dataDynamic() {
    let queryKey = trpc.exampleTableData.getTableData.queryKey({
      tableId: this.tableId,
    });
    const options = trpc.exampleTableData.getTableData.queryOptions({
      tableId: this.tableId,
    });
    return this.#dashboardQueryResultDynamic.query(
      // {
      //   queryKey,
      // }
      options
    );
  }

  public incrementTableId() {
    this.tableId = (Number(this.tableId) + 1).toString();
  }
}
