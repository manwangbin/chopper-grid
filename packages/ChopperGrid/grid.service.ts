import { InjectionKey, provide, reactive } from "vue";
import ListService from "./list/list.service";
import Column from "./model/column";

interface Model {
  rowHeight: number,
  rowNumber: number,
  columns: Array<Column>,
  state: number
}

export default class GridService {

  static token: InjectionKey<GridService> = Symbol()

  model:Model 

  constructor() {
      provide(GridService.token, this)
      this.model = reactive({
        rowHeight: 40,
        rowNumber: 10000,
        columns: [
           {index: 0, key: 'c1', title: '列1', width: 200} as Column, 
           {index: 1, key: 'c2', title: '列二', width: 400} as Column,
           {index: 2, key: 'c2', title: '列二', width: 400} as Column
        ],
        state: 1
      })

      this.changeToListState()
      console.log('init GridService');

  }

  changeToListState() {
    this.model.state = 1
  }

  sizeChangeHandler () {
      console.log('resize service change handler');
  }
}