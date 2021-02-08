import { computed, defineComponent, Ref, ref } from "vue";

export default defineComponent({

    props: {
        viewHeight: {
            type: Number,
            required: true
        },

        contentHeight: {
            type: Number,
            required: true
        }
    },

    setup (props, { emit }) {
        const toscrollRator = computed(() => props.viewHeight / props.contentHeight)
        const toViewRator = computed(() => props.contentHeight / props.viewHeight)

        const barHeight = computed(() =>  {
            const height = props.viewHeight * toscrollRator.value
            return height < 30 ? 30 : height
        })
        
        const positionMaxY = computed(() => props.viewHeight - barHeight.value)
        const showScroll = computed(() => props.contentHeight > props.viewHeight)
        
        const barY:Ref<number> = ref(0)

        let isMouseDown:boolean = false
        let originY:any = 0
        const mouseDownHandler = (e) => {
            originY = e.clientY || e.touches[0].clientY;
            isMouseDown = true;

            document.onmousemove = (ev) => {
                if (!isMouseDown) return false;
                // 获取拖拽移动的距离
                const eventY = ev.clientY;
                if (eventY !== originY) {
                    const moveY = eventY - originY;
                    let newPosition = barY.value + moveY
                    originY = eventY
                    
                    if (newPosition < 0) {
                        newPosition = 0
                    } else if (newPosition > positionMaxY.value) {
                        newPosition = positionMaxY.value
                    }

                    barY.value = newPosition
                    emit("scrolling", barY.value * toViewRator.value);
                }
            };

            document.onmouseup = (ev) => {
                if (!isMouseDown) return false;
                isMouseDown = false;
                const eventY = ev.clientY;
                if (eventY === originY) return false;

                console.log('move end');
                
            };
        }

        return () => (<div v-show={showScroll} class="vscroll">
                         <div class="vscroll-bar" style={'height:' + barHeight.value + 'px;transform:translateY(' + barY.value+ 'px)'} 
                              onMousedown={mouseDownHandler} ></div>
                      </div>)
    }
})