import { reactive, computed } from 'vue'
import { GRID_HEADER_HEIGHT } from '../../const'
import { Row } from '../../model/column'

interface ListModel {
    //行高
    rowHeight: number,
    //总数据行数
    totalNum: number,
    //显示的行控件
    rows: Array<Row>,

    //表格可视窗口的高度
    viewHeight: number,
    //内容区域实际高度
    contentTop: number,
    //数据面板位于内容区域的垂直TOP
    panelInContentTop: number
}

export default class ListService {

    model:ListModel

    sizeTimer:number = null

    constructor(viewHeight:number, rowHeight:number) {
        this.model = reactive({
            rowHeight: rowHeight,
            totalNum: 500,
            rows: [],

            viewHeight: viewHeight,
            contentTop: 0,
            panelInContentTop: 0
        })

        this.model.rows = this.getInitRows()
    }

    //----------------定义computed值-----------------//
    
    //行高
    rowElementHeight = computed(() => this.model.rowHeight + 1)
    //内容区域高度
    viewElementHeight = computed(() => this.model.viewHeight - GRID_HEADER_HEIGHT)
    //整个内容区域实际高度
    contentHeight = computed(() => this.rowElementHeight.value * this.model.totalNum +20)
    //panelTop最大的值
    panelTopMax = computed(() => this.contentHeight.value - this.viewElementHeight.value)
    //cach rows
    cachRowNum = computed(() => 120)

    //数据展示面板的实际高度
    panelHeight = computed(() => this.rowElementHeight.value * this.cachRowNum.value)
    //数据展示面板的TOP
    panelTop = computed(() => this.model.panelInContentTop - this.model.contentTop)
    //底部Cache到高度
    bottomCacheHeight = computed(() => this.panelHeight.value + this.panelTop.value - this.viewElementHeight.value)
    //当前视窗顶部显示rows的index
    viewTopIndex = computed(() => Math.floor(this.panelTop.value  *  -1 / this.rowElementHeight.value))
    //当前视窗底部显示rows的index
    viewBottomIndex = computed(() => Math.ceil((this.panelTop.value * -1 + this.viewElementHeight.value) / this.rowElementHeight.value))

    //垂直滚动时上下预留的缓存区
    vleaveSpace = computed(() => this.rowElementHeight.value * 5)
    //向下滚动时，顶部最大预留边界值
    rowTopMax = computed(() => this.rowElementHeight.value * -15)
    //向上滚动时，顶部最小预留边界值
    rowTopMin = computed(() => this.rowElementHeight.value * -10)
    
    //--------------------方法区-------------------//

    /**
     * 垂直滚动条滚动事件
     * 
     * @param y 内容区域top值
     */
    vscrollingHandler (y:number) {
        const moveSpan = y - this.model.contentTop
        if (moveSpan === 0) {
            return
        }

        if (moveSpan > 0) {
            if (this.model.panelInContentTop < this.panelTopMax.value) {
                if (moveSpan >= this.bottomCacheHeight.value) {
                    this.relayoutPanel(moveSpan)
    
                } else if (this.viewBottomIndex.value < this.model.totalNum) {
                    const lastDataIndex = this.model.rows[this.viewBottomIndex.value].dataIndex
                    let moveRownum = Math.ceil(moveSpan / this.rowElementHeight.value)
                    if ((lastDataIndex + moveRownum) >= this.model.totalNum) {
                        moveRownum = this.model.totalNum - lastDataIndex - 1
                    }
    
                    for (let i = 0; i < moveRownum; i++) {
                        const rowIndex = this.viewBottomIndex.value + 1 + i
                        this.bindData(rowIndex, lastDataIndex + i + 1)
                    }
                
                }
    
                this.model.contentTop = y
                if (this.panelTop.value < this.rowTopMax.value) {
                    this.moveTopRowsToBottom()
                }    
            } else {
                this.model.contentTop = y
            }
            
        } else {
            if (moveSpan <= this.panelTop.value) {
                this.relayoutPanel(moveSpan)

            } else {
                const moveRownum = Math.ceil(moveSpan * -1 / this.rowElementHeight.value)
                const topIndex = this.model.rows[this.viewTopIndex.value].dataIndex
                for (let i = moveRownum - 1; i >= 0; i--) {
                    const iteratorSpan = moveRownum - i
                    const rowIndex = this.viewTopIndex.value - iteratorSpan
                    this.bindData(rowIndex, topIndex - iteratorSpan)
                }

            }

            this.model.contentTop = y
            if (this.panelTop.value > this.rowTopMin.value) {
                this.moveBottomRowsToTop()
                
            }
        }
    }

    //-----------------内部私有方法------------------//

    /**
     * 绑定数据到Row控件
     * 
     * @param rowIndex 显示控件
     * @param dataIndex 数据index
     */
    bindData(rowIndex, dataIndex) {
        this.model.rows[rowIndex].dataIndex = dataIndex
        //TODO 绑定数据到row
    }

    /**
     * 初始化行数据
     */
    getInitRows() {
        const rows = new Array<Row>();
        for (let i = 0; i < this.cachRowNum.value && i < this.model.totalNum; i++) {
            rows.push({key: i, dataIndex: i, selected: false, hasData: false} as Row)
        }

        return rows
    }

    /**
     * 跨度过大，数据移动
     * 
     * @param moveSpan 
     */
    relayoutPanel(moveSpan: number) {
        const rowNum = Math.floor(moveSpan / this.rowElementHeight.value)
        for (let i = this.viewTopIndex.value; i <= this.viewBottomIndex.value && i < this.model.totalNum; i++) {
            this.bindData(i, this.model.rows[i].dataIndex + rowNum)
        }
        this.model.panelInContentTop += rowNum * this.rowElementHeight.value
        console.log('relayout panel', moveSpan, rowNum);
    }

    /**
     * 向下滚动的过程中，将底部的行
     */
    moveTopRowsToBottom() {
        const lastRow = this.model.rows[this.model.rows.length - 1]
        if (lastRow.dataIndex === this.model.totalNum - 1) {
            return;
        }
        
        const lastLeaveNum = this.model.totalNum - lastRow.dataIndex - 1
        let moveNum = Math.floor((this.panelTop.value * -1 - this.vleaveSpace.value) / this.rowElementHeight.value);
        if (lastLeaveNum < moveNum) {
            moveNum = lastLeaveNum
        }

        if (moveNum > 0) {
            const reuseRows = this.model.rows.splice(0, moveNum)
            this.model.rows.splice(this.model.rows.length, 0, ...reuseRows)
            this.model.panelInContentTop += this.rowElementHeight.value * moveNum
        }
    }

    /**
     * 向上滚动时，将下面的行切换到顶部
     */
    moveBottomRowsToTop() {
        const moveSpace = this.panelHeight.value - this.viewElementHeight.value - this.vleaveSpace.value + this.panelTop.value
        let moveNum = Math.floor(moveSpace / this.rowElementHeight.value)

        const first = this.model.rows[0]
        if (first.dataIndex < (moveNum - 1)) {
            moveNum = first.dataIndex + 1
        }
        
        if (moveNum > 0) {
            const reuseRows = this.model.rows.splice(this.model.rows.length - moveNum, moveNum)
            this.model.rows.splice(0, 0, ...reuseRows)
            this.model.panelInContentTop -= this.rowElementHeight.value * moveNum
        }
    }
}