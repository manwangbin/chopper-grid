import { reactive, computed } from 'vue'
import { GRID_HEADER_HEIGHT } from '../../const'
import GridService from '../../grid.service'
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

    relayouting:boolean = false

    sizeTimer:number = null

    relayoutTimer:number = null

    constructor(viewHeight:number, rowHeight:number) {
        this.model = reactive({
            rowHeight: rowHeight,
            totalNum: 1000,
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
    contentHeight = computed(() => this.rowElementHeight.value * this.model.totalNum)
    //cach rows
    cachRowNum = computed(() => {
        // let cacheRowNum = Math.ceil(this.contentHeight.value / this.viewElementHeight.value  * 40 / this.rowElementHeight.value)
        // console.log('cache row num', this.contentHeight.value, this.viewElementHeight.value, cacheRowNum);

        // if (cacheRowNum < 60) {
        //     cacheRowNum = 60
        // }

        return 120
    })
    //数据展示面板的实际高度
    panelHeight = computed(() => this.rowElementHeight.value * this.cachRowNum.value)
    //数据展示面板的TOP
    panelTop = computed(() => this.model.panelInContentTop - this.model.contentTop)
    
    //重新布局的顶部边界值
    vrelayoutMaxTop = computed(() => this.viewElementHeight.value + this.rowElementHeight.value - this.panelHeight.value) 
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
    vscrollingHandler (y) {
        this.relayouting = true
        const up = this.model.contentTop < y
        this.model.contentTop = y   
        if (this.needRelayoutRow(up)) {
            this.relayoutRows(up)

        } else {
            if (up && this.panelTop.value < this.rowTopMax.value) {
                this.moveTopRowsToBottom()
    
            } else if (!up && this.panelTop.value > this.rowTopMin.value) {
                this.moveBottomRowsToTop()
                
            }

        }

        this.relayouting = false
    }

    //-----------------内部私有方法------------------//

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
     * 是否需要重新布局，如果滚动过快（底部或底部已经
     */
    needRelayoutRow(up) {
        if (up && this.panelTop.value < this.vrelayoutMaxTop.value) {
            return true
        }
        if (!up &&this.panelTop.value > this.rowElementHeight.value) {
            return true
        }

        return false
    }

    /**
     * 如果滚动条拖动过快则重新布局所有行控件
     */
    relayoutRows(up) {
        const pageHeight = this.rowTopMin.value * -1;
        let pageNum = 0;
        if (up) {
            pageNum = Math.floor(this.model.contentTop / pageHeight)
        } else {
            const minPanelTop = this.model.contentTop - (this.panelHeight.value - this.viewElementHeight.value - this.vleaveSpace.value)
            pageNum = Math.floor(minPanelTop / pageHeight)
        }
        
        const beginDataIndex = pageNum * 10
        for (let i:number = 0; i < this.model.rows.length; i++) {
            this.model.rows[i].dataIndex = beginDataIndex + i;
        }

        this.model.panelInContentTop = pageNum * pageHeight
    }

    /**
     * 向下滚动的过程中，将底部的行
     */
    moveTopRowsToBottom() {
        let moveNum = Math.floor((this.panelTop.value * -1 - this.vleaveSpace.value) / this.rowElementHeight.value);
        const lastRow = this.model.rows[this.model.rows.length - 1]
        const lastLeaveNum = this.model.totalNum - lastRow.dataIndex - 1
        if (lastLeaveNum < moveNum) {
            moveNum = lastLeaveNum
        }

        const reuseRows = this.model.rows.splice(0, moveNum)
        for (let i:number = 0; i < reuseRows.length; i++) {
            reuseRows[i].dataIndex = lastRow.dataIndex + (i + 1);
            reuseRows[i].data = null
        }

        this.model.rows.splice(this.model.rows.length, 0, ...reuseRows)
        this.model.panelInContentTop += this.rowElementHeight.value * moveNum
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
            for (let i:number = 0; i < reuseRows.length; i++) {
                reuseRows[i].dataIndex = first.dataIndex - (moveNum - i);
                reuseRows[i].data = null
            }

            this.model.rows.splice(0, 0, ...reuseRows)
            this.model.panelInContentTop -= this.rowElementHeight.value * moveNum
        }
    }
}