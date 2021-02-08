import { defineComponent, inject } from "vue";
import GridService from "./grid.service";
import {GridHeader, GridBottom, List, Group, HScroll} from './component'

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
        HScroll
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
        const body = () => {
            if (gridSerivce.model.state === 1) {
                return <list view-height={gridSerivce.model.viewHeight} row-height={props.rowHeight}></list>
            } else {
                return <group></group>
            }
        }

        return () => <div id='gridPanel' class='grid-panel'>
                        {body()}
                        <grid-bottom />
                        <h-scroll view-width={gridSerivce.model.viewWidth} hpadding={gridSerivce.lockTableWidth.value} 
                                  contentWidth={gridSerivce.scrollTableWidth.value} onScrolling={(x) => gridSerivce.hscrollingHandler(x)}/>
                     </div>
    }
})