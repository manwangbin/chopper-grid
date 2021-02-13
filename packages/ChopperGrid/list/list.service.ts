import { reactive, computed } from 'vue'

interface Row {
    key: number,
    dataIndex: number,
    selected: boolean,
    hasData: boolean,
    data?: any
}

interface ListModel {
    rowHeight: number,
    totalNum: number,
    topPosition: number,
    rows: Array<Row>,

    clientHeight: number,
    clientWidth: number,
    virtualHeight: number
}

export default class ListService {

    ROW_NUMBER:number = 60

    sizeTimer:any = null

    model: ListModel

    constructor() {
        this.model = reactive({
            rowHeight: 30,
            totalNum: 1000,
            topPosition: 0,
            rows: [],

            clientWidth: 2000,
            clientHeight: -1,
            virtualHeight: 0
        })

        this.model.rows = this.getInitRows()
    }

    contentHeight = computed(() => this.model.rowHeight * this.model.totalNum)

    rowTopMax = computed(() => this.model.rowHeight * -15)
    rowTopMin = computed(() => this.model.rowHeight * -10)
    rowContentPosition = computed(() => this.model.topPosition * -1 + this.model.virtualHeight)

    vscrollingHandler (y) {
        const up = this.model.topPosition < y
        this.model.topPosition = y
        
        if (up && this.rowContentPosition.value < this.rowTopMax.value) {
            const reuseRows = this.model.rows.splice(0, 10)
            const lastRow = this.model.rows[this.model.rows.length - 1]
            for (let i:number = 0; i < reuseRows.length; i++) {
                reuseRows[i].dataIndex = lastRow.dataIndex + (i + 1);
                reuseRows[i].data = null
            }

            this.model.rows.splice(this.model.rows.length, 0, ...reuseRows)
            this.model.virtualHeight += this.rowTopMin.value * -1

        } else if (!up && this.rowContentPosition.value > this.rowTopMin.value) {
            const first = this.model.rows[0]
            const copyNum = first.dataIndex > 10 ? 10 : first.dataIndex
            if (copyNum > 0) {
                const reuseRows = this.model.rows.splice(this.model.rows.length - copyNum, copyNum)
                for (let i:number = 0; i < reuseRows.length; i++) {
                    reuseRows[i].dataIndex = first.dataIndex - (copyNum - i);
                    reuseRows[i].data = null
                }

                this.model.rows.splice(0, 0, ...reuseRows)
                this.model.virtualHeight -= this.model.rowHeight * copyNum
            }
            
        }
    }

    resizeHandler (width, height) {
        if (this.sizeTimer) {
            clearTimeout(this.sizeTimer)
        }
        
        this.sizeTimer = setTimeout(() => {
            this.model.clientWidth = parseInt(width)
            this.model.clientHeight = parseInt(height)
        }, 75)
    }

    getInitRows() {
        const rows = new Array<Row>();
        for (let i = 0; i < this.ROW_NUMBER && i < this.model.totalNum; i++) {
            rows.push({key: i, dataIndex: i, selected: false, hasData: false} as Row)
        }

        return rows
    }
}