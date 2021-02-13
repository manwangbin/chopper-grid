import { reactive, computed, toHandlers } from 'vue'
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
            totalNum:1000,
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
    //鼠标滚动的行距
    whellSpan = computed(() => 1)
    //显示窗口高度
    viewElementHeight = computed(() => this.model.viewHeight - GRID_HEADER_HEIGHT)
    //整个内容区域实际高度
    contentHeight = computed(() => this.rowElementHeight.value * this.model.totalNum + 20)
    //cach rows
    cachRowNum = computed(() => this.model.totalNum < 60 ? this.model.totalNum : 60)
    //数据展示面板的实际高度
    panelHeight = computed(() => this.rowElementHeight.value * this.cachRowNum.value)
    //数据展示面板的TOP
    panelTop = computed(() => this.model.panelInContentTop - this.model.contentTop)

    //panelTop最大的值
    panelTopMax = computed(() => this.contentHeight.value - this.panelHeight.value - 20)
    //panel当前位置到最底部距离
    panelToBottomSpace = computed(() => this.panelTopMax.value - this.model.panelInContentTop)
    //当前底部Cache高度
    panelBottomCacheHeight = computed(() => this.panelHeight.value + this.panelTop.value - this.viewElementHeight.value)
    //当前视窗顶部显示rows的index
    viewTopIndex = computed(() => Math.floor(this.panelTop.value  *  -1 / this.rowElementHeight.value))
    //当前视窗底部显示rows的index
    viewBottomIndex = computed(() => {
        const rowIndex = Math.ceil((this.panelTop.value * -1 + this.viewElementHeight.value) / this.rowElementHeight.value)
        if (rowIndex < this.cachRowNum.value) {
            return rowIndex
        } else {
            return this.cachRowNum.value - 1
        }
    })

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
            if (moveSpan >= this.panelBottomCacheHeight.value) {
                this.relayoutPanel(moveSpan, y)

            } else {
                this.bandBottomCacheRows(moveSpan)
                this.model.contentTop = y
            }

            if (this.panelTop.value < this.rowTopMax.value 
                && this.panelTop.value < this.rowTopMax.value) {
                this.moveTopRowsToBottom()
            } 
               
        } else {
            if (this.model.panelInContentTop > 0) {
                if (moveSpan <= this.panelTop.value) {
                    this.relayoutPanel(moveSpan, y)
                } else {
                    this.bandTopCacheRow(moveSpan)
                    this.model.contentTop = y
                }
    
                if (this.panelTop.value > this.rowTopMin.value) {
                    this.moveBottomRowsToTop()  
                }
            } else {
                this.bandTopCacheRow(moveSpan)
                this.model.contentTop = y
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
        for (let i = 0; i < this.cachRowNum.value; i++) {
            rows.push({key: i, dataIndex: i, selected: false, hasData: false} as Row)
        }

        return rows
    }

    /**
     * 跨度过大，数据移动
     * 
     * @param moveSpan 
     */
    relayoutPanel(moveSpan: number, y:number) {
        this.model.contentTop = y
        if (moveSpan > 0 && moveSpan > this.panelToBottomSpace.value) {
            this.model.panelInContentTop = this.panelTopMax.value
        } else if (moveSpan < 0 && moveSpan * -1 > this.model.panelInContentTop) {
            this.model.panelInContentTop = 0
        } else {
            const rowNum = Math.floor(moveSpan / this.rowElementHeight.value)
            this.model.panelInContentTop += rowNum * this.rowElementHeight.value
        }

        let dataIndex = Math.floor(this.model.contentTop / this.rowElementHeight.value)   
        for (let i = this.viewTopIndex.value; i <= this.viewBottomIndex.value && i < this.model.rows.length; i++) {
            this.bindData(i, dataIndex + (i - this.viewTopIndex.value))
        }  
    }

    /**
     * 对底部即将显示的数据，绑定到底部row上
     * 
     * @param moveSpan 
     */
    bandBottomCacheRows(moveSpan:number) {
        const lastDataIndex = this.model.rows[this.viewBottomIndex.value].dataIndex
        let moveRownum = Math.ceil(moveSpan / this.rowElementHeight.value)
        if ((lastDataIndex + moveRownum) >= this.model.totalNum) {
            moveRownum = this.model.totalNum - lastDataIndex - 1
        }

        const begin = this.viewBottomIndex.value + 1
        let end = begin + moveRownum
        if (end > this.cachRowNum.value) {
            end = this.cachRowNum.value
        }

        for (let i = begin; i < end; i++) {
            const spanValue = i - begin + 1
            this.bindData(i, lastDataIndex + spanValue)
        }
    }

    /**
     * 向下滚动的过程中，将底部的行
     */
    moveTopRowsToBottom() {
        let moveSpace = -this.panelTop.value - this.vleaveSpace.value
        if (moveSpace > this.panelToBottomSpace.value) {
            moveSpace = this.panelToBottomSpace.value
        }
        
        let moveNum = Math.floor(moveSpace / this.rowElementHeight.value)
        if (moveNum > 0) {
            const reuseRows = this.model.rows.splice(0, moveNum)
            this.model.rows.splice(this.model.rows.length, 0, ...reuseRows)
            this.model.panelInContentTop += this.rowElementHeight.value * moveNum      
        }
    }

    /**
     * 绑定顶部即将显示的数据
     * 
     * @param moveSpan 移动距离
     */
    bandTopCacheRow(moveSpan: number) {
        let moveRownum = Math.ceil(moveSpan * -1 / this.rowElementHeight.value)
        const topIndex = this.model.rows[this.viewTopIndex.value].dataIndex
        if ((topIndex - moveRownum) < 0) {
            moveRownum = topIndex
        }

        const begin = this.viewTopIndex.value - 1
        let end = begin - moveRownum
        if (end < 0) {
            end = 0
        }

        for (let i = begin; i >= end; i--) {
            const dataIndex = topIndex - (begin - i) - 1
            this.bindData(i, dataIndex)
        }
    }

    /**
     * 向上滚动时，将下面的行切换到顶部
     */
    moveBottomRowsToTop() {
        let moveSpace = this.panelHeight.value - this.viewElementHeight.value - this.vleaveSpace.value + this.panelTop.value
        if (moveSpace > this.model.panelInContentTop) {
            moveSpace = this.model.panelInContentTop
        }
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