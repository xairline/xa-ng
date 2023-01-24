import {action, makeObservable, observable} from 'mobx';

const routes: string[] = ['flight-logs'];

class RouterStore {
  @observable
  public selectedMenuKey: number;

  constructor() {
    this.selectedMenuKey = 0;
    makeObservable(this);
  }

  @action
  setSelectedMenuKey(i: number): void {
    this.selectedMenuKey = i;
  }

  getDefaultSelectedKeys(): string {
    return '/';
  }
}

export const routerStore = new RouterStore();
