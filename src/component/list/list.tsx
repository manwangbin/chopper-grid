import { defineComponent, inject, Ref, ref, watchEffect, TransitionGroup } from "vue"

import {GridHeader} from '../index'
import VScroll from '../vscroll'

import GridService from "../../grid.service"
import ListService from "./list.service"
import { Column, Row } from "../../model/column"

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
        TransitionGroup,
        GridHeader,
        VScroll
    },

    setup(props) {
        const gridService:GridService = inject(GridService.token) as GridService
        listService = new ListService(props.viewHeight, props.rowHeight)
        const moveVPosition:Ref = ref((span) => {})

        watchEffect(() => {
            listService.model.viewHeight = props.viewHeight
            listService.model.rowHeight = props.rowHeight
         })

        const dataCells = (columns: Array<Column>, data:Row) => columns.map((cell) => 
            <div key={'row_' + data.key + '_' + cell.key} class="data-cell" style={cell.contentStyle(props.rowHeight)}>
                {cell.contentRender(data)}
            </div>
        )

        const rows = (columns: Array<Column>) => listService.model.rows.map(data => (
            <transition-group name={gridService.reindxColumnFlag.value ? 'reindex' : ''} class="row" tag="div" key={'row-' + data.key}>
                {dataCells(columns, data)}
            </transition-group>
        ))

        const mouseWheelHandler = (e) => {
            if(window.event) {       //这是IE浏览器
                e.cancelBubble=true
            } else if(e && e.stopPropagation) {     //这是其他浏览器
                e.stopPropagation()//阻止冒泡事件
            }
            moveVPosition.value(e.deltaY * listService.whellSpan.value)
        }
        
        const onMouseEnterHandler = (e) => {
            window.addEventListener('mousewheel', mouseWheelHandler)
        }

        const onMouseOutHandler = (e) => {
            window.removeEventListener('mousewheel', mouseWheelHandler)
        }

        const onColumnSizeChanged = (e) => {
            gridService.resizeColumn(e.index, e.size)
        }

        const onLockColumnIndexChanged = (e) => {
            gridService.columnIndexChanged(e.oldIndex, e.newIndex)
        }

        const onScrollColumnIndexChanged = (e) => {
            const lockColumnLength = gridService.lockColumns.value.length
            gridService.columnIndexChanged(e.oldIndex + lockColumnLength, e.newIndex + lockColumnLength)
        }

        return () => (
            <div id="chooper-grid" 
                class='chooper-grid' 
                onMouseenter={(e) => onMouseEnterHandler(e)} 
                onMouseleave={(e) => onMouseOutHandler(e)}>
                <div class={['grid-container', 'left-container', gridService.model.contentLeft !== 0 ? 'left-shadow': '']} style={'width:' + gridService.lockTableWidth.value + 'px'}>
                    <grid-header columns={gridService.lockColumns.value} 
                                 onSizeChanged={(e) => onColumnSizeChanged(e)}
                                 onIndexChanged={(e) => onLockColumnIndexChanged(e)} />
                    <div class='body' >
                        <div class='row-content' style={'transform: translateY(' + listService.panelTop.value + 'px)'}>
                            {rows(gridService.lockColumns.value)}
                        </div>    
                    </div>
                </div>

                <div class="grid-container right-container" style={'width:' + gridService.scrollTableWidth.value + 'px;left:' + gridService.scroollTableLeft.value + 'px'}>
                    <grid-header columns={gridService.scrollColumns.value}
                                 startIndex={gridService.lockColumns.value.length}
                                 onSizeChanged={(e) => onColumnSizeChanged(e)}
                                 onIndexChanged={(e) => onScrollColumnIndexChanged(e)}/>
                    <div class='body'>
                        <div class='row-content' style={'transform: translateY(' + listService.panelTop.value + 'px)'}>
                            {rows(gridService.scrollColumns.value)}
                        </div>  
                    </div>
                </div>

                <v-scroll 
                    viewHeight={listService.viewElementHeight.value} 
                    contentHeight={listService.contentHeight.value} 
                    onLoad={(movePosition) => moveVPosition.value = movePosition}
                    onScrolling={(y) => listService.vscrollingHandler(y)}/>
            </div>
        )
    }
})