import { observable, action, computed, makeObservable } from "mobx";
import { RootStore } from "./index";

type DashboardData = any;

export default class DashboardStore {
  rootStore: RootStore;
  $dashboardData: DashboardData;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    console.log(this)
    makeObservable(this, {
      "$dashboardData": observable,
      fetchDashboardData: action,
      data: computed,
    });
  }

  public async init() {}

  public async fetchDashboardData() {
    this.$dashboardData = [{id: 5}];
  }

  public get data(): DashboardData {
    return this.$dashboardData;
  }
}
