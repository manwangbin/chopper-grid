import { InjectionKey, provide, reactive, computed, Ref, ref } from "vue";
import {Column } from "./model/column";
import HeaderColumn from "./model/header_column";
import TextColumn from "./model/text_column";

interface Model {
  rowHeight: number,
  rowNumber: number,
  columns: Array<Column>,
  lockIndex: number,
  state: number,

  viewWidth: number,
  viewHeight: number,
  contentLeft: number
}

export default class GridService {

  static token: InjectionKey<GridService> = Symbol()

  model:Model

  resizeTimer: any

  reindxColumnFlag:Ref<boolean> = ref(false)

  constructor(columns: Array<Column>) {
      provide(GridService.token, this)
      this.model = reactive({
        rowHeight: 40,
        rowNumber: 10000,
        columns: [
          new HeaderColumn(),
          ...columns
        ],
        lockIndex: 2,
        state: 1,

        viewWidth: -1,
        viewHeight: -1,
        contentLeft: 0
      })

      this.changeToListState()
  }

  //----------------------------计算comptued---------------------//
  
  //不水平滚动的列
  lockColumns = computed(() => this.model.columns.filter((column,index) => index < this.model.lockIndex))
  //可水平滚动的列
  scrollColumns = computed(() => this.model.columns.filter((column, index) => index >= this.model.lockIndex))

  //不水平滚动列的宽度
  lockTableWidth = computed(() => this.lockColumns.value.reduce((a, b) => a + (b.width + 1), 0))
  //水平滚动列的宽度
  scrollTableWidth = computed(() => this.scrollColumns.value.reduce((a, b) => a + (b.width + 1), 20))
  //滚动区域的left
  scroollTableLeft = computed(() => this.lockTableWidth.value + this.model.contentLeft)

  //--------------------------方法区---------------------------//

  changeToListState() {
    this.model.state = 1
  }

  /**
   * 改变列宽
   * 
   * @param index 
   * @param newSize 
   */
  resizeColumn(index:number, newSize:number) {
    this.model.columns[index].width = newSize
  }

  /**
   * 改变列的顺序
   * 
   * @param oldIndex 原来列的index
   * @param newIndex 新的位置
   */
  columnIndexChanged(oldIndex: number, newIndex:number) {
    this.reindxColumnFlag.value = true
    const oldColumn:Column = this.model.columns.splice(oldIndex, 1)[0]
    if (newIndex < oldIndex) {
      this.model.columns.splice(newIndex, 0, oldColumn)
    } else {
      this.model.columns.splice(newIndex, 0, oldColumn)
    }
    setTimeout(()=> this.reindxColumnFlag.value = false, 800)
  }

  /**
   * 垂直滚动条滚动事件
   * 
   * @param x 内容区域top值
   */
  hscrollingHandler (x) {
    console.log();
    
    this.model.contentLeft = x * -1
  }

  /**
   * 页面大小变化事件，利用防抖策略减少响应次数
   * 
   * @param width 变化后的宽度
   * @param height 变化后的高度
   */
  resizeHandler (width, height) {
    if (width && height) {
      if (this.resizeTimer) {
          clearTimeout(this.resizeTimer)
      }
      
      this.resizeTimer = setTimeout(() => {
          const newWidth = parseInt(width)
          if (newWidth !== this.model.viewWidth) {
              this.model.viewWidth = newWidth
          }

          const newHeight = parseInt(height)
          if (newHeight !== this.model.viewWidth) {
              this.model.viewHeight = newHeight
          }
      }, 75)
    }
  }
}