import { defineComponent, inject } from "vue";
import VScroll from '../component/vscroll'

import GridService from "../grid.service";
import ListService from "./list.service";

const listService = new ListService()

export default defineComponent({
    components: {
        VScroll
    },

    mounted() {
        const getSizeHandler = () => {
            const bodyElement = document.getElementById("gridBody")
            const elStyle = document.defaultView.getComputedStyle(bodyElement, null);
            listService.resizeHandler(elStyle.width, elStyle.height)
        }

        window.addEventListener('resize', getSizeHandler)
        getSizeHandler()
    },

    setup() {
        const gridService:GridService = inject(GridService.token) as GridService
        const dataCells = (data) => gridService.model.columns.map((cell,index) => (
            <div key={'row_' + data.key + '_' + index} class="data-cell" style={'height : ' + listService.model.rowHeight + 'px;line-height:' + listService.model.rowHeight + 'px;width: ' + cell.width + 'px'}></div>
        ))

        const rowHeaderContent = (data) => {
            if (data.selected) {
                return <a-input type="checkbox" selected />
            } else {
                return <span>{data.dataIndex + 1}</span>
            }
        }
  
        const rows = () => listService.model.rows.map(data => (
            <div class='row'>
                <div key={'row_' + data.key} class='row-header data-cell' style={'height : ' + listService.model.rowHeight + 'px;line-height:' + listService.model.rowHeight + 'px;'}>
                    {rowHeaderContent(data)}
                </div>
                {dataCells(data)}
            </div>)
        )

        return () => (
            <div id="gridBody" class='body'>
                <div class='row-content' style={'transform: translateY(' + listService.rowContentPosition.value + 'px)'}>{rows()}</div>
                <v-scroll viewHeight={listService.model.clientHeight} contentHeight={listService.contentHeight.value} onScrolling={(y) => listService.vscrollingHandler(y)}/>
            </div>
        )
    }
})