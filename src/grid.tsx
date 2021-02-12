import { defineComponent, inject, ref } from "vue";
import GridService from "./grid.service";
import {GridHeader, GridBottom, List, Group, HScroll, LockLine} from './component'

import './grid.less'

let gridSerivce:GridService
export default defineComponent ({
    props: {
        rowHeight: {
            type: Number,
            required: false,
            default: 34
        }
    },

    components: {
        GridHeader,
        GridBottom,
        List,
        Group,
        HScroll,
        LockLine
    },

    mounted() {
        const getSizeHandler = () => {
            const bodyElement = document.getElementById("chooper-grid")
            const elStyle = document.defaultView.getComputedStyle(bodyElement, null);
            if (gridSerivce) {
                gridSerivce.resizeHandler(elStyle.width, elStyle.height)
            }
        }

        window.addEventListener('resize', getSizeHandler)
        getSizeHandler()
    },

    setup(props) {
        gridSerivce = new GridService()
        const setHPosition = ref((position) => {})

        const body = () => {
            if (gridSerivce.model.state === 1) {
                return <list view-height={gridSerivce.model.viewHeight} row-height={props.rowHeight}></list>
            } else {
                return <group></group>
            }
        }

        const toDragLockLine = () => {
            gridSerivce.model.contentLeft = 0
            setHPosition.value(0)
        }

        const dragLockLineEnd = (x) => {
            if (x < 82) {
                x = 82
            }

            let columnWidth:number = 0
            for (let i = 0; i < gridSerivce.model.columns.length; i++) {
                const itemWidth = gridSerivce.model.columns[i].width + 1
                if (columnWidth <= x && (columnWidth + itemWidth) > x) {
                    gridSerivce.model.lockIndex = i
                    return;
                }

                columnWidth += itemWidth
            }

            gridSerivce.model.lockIndex = gridSerivce.model.columns.length -1
        }

        return () => <div id='gridPanel' class='grid-panel'>
                        {body()}
                        <grid-bottom />
                        <h-scroll view-width={gridSerivce.model.viewWidth} 
                                  hpadding={gridSerivce.lockTableWidth.value} 
                                  contentWidth={gridSerivce.scrollTableWidth.value} 
                                  onLoad={(setPosition) => setHPosition.value = setPosition}
                                  onScrolling={(x) => gridSerivce.hscrollingHandler(x)}/>
                        <lock-line onToDrag={() => toDragLockLine()} onDraged={(x) => dragLockLineEnd(x)}/>
                     </div>
    }
})