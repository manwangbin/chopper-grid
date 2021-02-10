import { computed, defineComponent, inject, Ref, ref } from "vue";
import GridService from "../grid.service";

export default defineComponent({
  setup (props, {emit}) {
    const moveX:Ref<number> = ref(0)
    const showLine:Ref<boolean> = ref(false) 
    const isMouseDown:Ref<boolean> = ref(false)

    const gridService:GridService = inject(GridService.token) as GridService
    const lineLeft = computed(() => gridService.lockTableWidth.value - 10 + moveX.value)

    let originX:any = 0
    const mouseDownHandler = (e) => {
        if(window.event){       //这是IE浏览器
            e.cancelBubble=true
        }else if(e && e.stopPropagation){     //这是其他浏览器
            e.stopPropagation()//阻止冒泡事件
        }
        originX = e.clientX || e.touches[0].clientX;
        isMouseDown.value = true;
        emit('toDrag')

        document.onmousemove = (ev) => {
            ev.preventDefault
            if (!isMouseDown.value) return false;
            // 获取拖拽移动的距离
            const eventX = ev.clientX;
            if (eventX !== originX) {
                moveX.value = eventX - originX
            }
        };

        document.onmouseup = (ev) => {
            if (!isMouseDown.value) return false
            emit('draged', lineLeft.value)
            moveX.value = 0
            isMouseDown.value = false;
            return false
        };

        return false
    }
    
    return () => <div class='lock_div' style={'height:' + gridService.model.viewHeight + 'px;left:' + lineLeft.value + 'px'}
                   onMouseenter={()=> showLine.value = true} onMouseleave={() => showLine.value = false}
                   onMousedown={(e) => mouseDownHandler(e)} onMouseup={() => false}>
                   <div class='lock_line'></div>
                   <div class='lock_block' v-show={isMouseDown.value}></div>
                 </div>
  }
})