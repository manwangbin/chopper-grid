import { defineComponent, PropType } from "vue";
import { Column } from "../model/column";


export default defineComponent ({
    props:{
        columns: {
            type: Array as PropType<Array<Column>>,
            required: true
        }
    },

    setup(props, {emit}) {
        let isMouseDown:boolean = false
        let originX:any = 0
        const mouseDownHandler = (e, item:Column) => {
            if(window.event) {       //这是IE浏览器
                e.cancelBubble=true
            } else if(e && e.stopPropagation) {     //这是其他浏览器
                e.stopPropagation()//阻止冒泡事件
            }
            originX = e.clientX || e.touches[0].clientX;
            isMouseDown = true;

            document.onmousemove = (ev) => {
                ev.preventDefault
                if (!isMouseDown) return false;
                // 获取拖拽移动的距离
                const eventX = ev.clientX;
                if (eventX !== originX) {
                    const moveX = eventX - originX;
                    let newWidth = item.width + moveX
                    if (newWidth < 60) {
                        newWidth = 60
                    }
                    originX = eventX
                    emit('sizeChanged', {index: item.index, size: newWidth})
                }
            };

            document.onmouseup = (ev) => {
                if (!isMouseDown) return false;
                isMouseDown = false;
                return false
            };

            return false
        }

        const columnCells = () => (props.columns.map((item) => 
            <div class='header-cell' style={item.headerStyle()}>
                {item.headerRender()}
                <div v-show={item.canResize} class='resize-block' onMousedown={(e) => mouseDownHandler(e, item)} onMouseup={() => false}>
                    <div class='resize-line' />
                </div>
            </div>)
        )

        return () => <div class="header">{columnCells()}</div>
    }
})