import {action, makeObservable, observable} from 'mobx';
import {Api, ModelsVa} from './Api';

class VaStore {
  @observable
  public VaInfo: ModelsVa[];

  private api: Api<ModelsVa>;

  constructor() {
    this.VaInfo = [];
    this.api = new Api<ModelsVa>();
    this.loadVaInfo();
    makeObservable(this);
  }

  @action
  async loadVaInfo() {
    let res = await this.api.va.getVa();
    this.VaInfo = res.data;
  }

}

export const vaStore = new VaStore();