import { defineComponent, inject, watch, Ref, ref, watchEffect } from "vue";
import {GridHeader} from '../index'
import VScroll from '../vscroll'

import GridService from "../../grid.service";
import ListService from "./list.service";
import { Column, Row } from "../../model/column";
import grid from "../../grid";

let listService:ListService;
export default defineComponent({
    props: {
        viewHeight: {
            type: Number,
            required: true
        },

        rowHeight: {
            type: Number,
            required: true
        }
    },

    components: {
        GridHeader,
        VScroll
    },

    setup(props) {
        const gridService:GridService = inject(GridService.token) as GridService
        listService = new ListService(props.viewHeight, props.rowHeight)

        watchEffect(() => {
            listService.model.viewHeight = props.viewHeight
            listService.model.rowHeight = props.rowHeight
         })

        const dataCells = (columns: Array<Column>, data:Row) => columns.map((cell,index) => 
                <div key={'row_' + data.key + '_' + index} class="data-cell" style={cell.contentStyle(props.rowHeight)}>
                    {cell.contentRender(data)}
                </div>
            )

        const rows = (columns: Array<Column>) => listService.model.rows.map(data => (
                <div class='row'>
                    {dataCells(columns, data)}
                </div>)
            )
        
        const onMouseEnterHandler = (e) => {
            
        }

        const onMouseOutHandler = (e) => {

        }

        const onColumnSizeChanged = (e) => {
            gridService.resizeColumn(e.index, e.size)
        }

        return () => (
            <div id="chooper-grid" class='chooper-grid'>
                <div class={['grid-container', 'left-container', gridService.model.contentLeft !== 0 ? 'left-shadow': '']} style={'width:' + gridService.lockTableWidth.value + 'px'}>
                    <grid-header columns={gridService.lockColumns.value} onSizeChanged={(e) => onColumnSizeChanged(e)}/>
                    <div class='body' onMouseenter={onMouseEnterHandler} onMouseout={onMouseOutHandler}>
                        <div class='row-content' style={'transform: translateY(' + listService.panelTop.value + 'px)'}>
                            {rows(gridService.lockColumns.value)}
                        </div>    
                    </div>
                </div>

                <div class="grid-container right-container" style={'width:' + gridService.scrollTableWidth.value + 'px;left:' + gridService.scroollTableLeft.value + 'px'}>
                    <grid-header columns={gridService.scrollColumns.value} onSizeChanged={(e) => onColumnSizeChanged(e)}/>
                    <div class='body' onMouseenter={onMouseEnterHandler} onMouseout={onMouseOutHandler}>
                        <div class='row-content' style={'transform: translateY(' + listService.panelTop.value + 'px)'}>
                            {rows(gridService.scrollColumns.value)}
                        </div>  
                    </div>
                </div>

                <v-scroll viewHeight={listService.viewElementHeight.value} contentHeight={listService.contentHeight.value} onScrolling={(y) => listService.vscrollingHandler(y)}/>
            </div>
        )
    }
})