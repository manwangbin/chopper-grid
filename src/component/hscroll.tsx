import { computed, defineComponent, Ref, ref } from "vue";

export default defineComponent({
    props: {
        viewWidth: {
            type: Number,
            required: true
        },

        hpadding: {
            type: Number,
            required: true,
        },

        contentWidth: {
            type: Number,
            required: true
        }
    },

    setup (props, { emit }) {
        const scrollViewWidth = computed(() => props.viewWidth - props.hpadding)

        const toscrollRator = computed(() => scrollViewWidth.value / props.contentWidth)
        const barWidth = computed(() =>  {
            const height = Math.floor(props.viewWidth * toscrollRator.value)
            return height < 30 ? 30 : height
        })
        const toViewRator = computed(() => (props.contentWidth - scrollViewWidth.value) / (props.viewWidth - barWidth.value))
        
        const positionMaxX = computed(() => props.viewWidth - barWidth.value)
        const showScroll = computed(() => props.contentWidth > scrollViewWidth.value)
        const barX:Ref<number> = ref(0)

        //设置水平值
        const setPosition = (x:number) => {
            barX.value = x
            emit("scrolling", barX.value * toViewRator.value)
        }
        emit('load', setPosition)

        let isMouseDown:boolean = false
        let originX:any = 0
        const mouseDownHandler = (e) => {
            if(window.event){       //这是IE浏览器
                e.cancelBubble=true
            }else if(e && e.stopPropagation){     //这是其他浏览器
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
                    let newPosition = barX.value + moveX
                    originX = eventX
                    
                    if (newPosition < 0) {
                        newPosition = 0
                    } else if (newPosition > positionMaxX.value) {
                        newPosition = positionMaxX.value
                    }

                    barX.value = newPosition
                    emit("scrolling", barX.value * toViewRator.value)
                }
            };

            document.onmouseup = (ev) => {
                if (!isMouseDown) return false;
                isMouseDown = false;
                return false
            };

            return false
        }

        let autoMoveTo = false
        const barMouseDownHandler = (e) => {
            autoMoveTo = true
            autoMove(e.offsetX - barWidth.value / 2)
        }

        const autoMove = (to) => {
            setTimeout(() => {
                let dir = 1
                if (to < barX.value) {
                    dir = -1
                }

                let newPosition = barX.value + 3 * dir
                if (newPosition * dir > to * dir) {
                    newPosition = to
                    autoMoveTo = false
                }

                if (newPosition < 0) {
                    newPosition = 0
                } else if (newPosition > positionMaxX.value) {
                    newPosition = positionMaxX.value
                }

                barX.value = newPosition
                emit("scrolling", barX.value * toViewRator.value)
                if (autoMoveTo) {
                    autoMove(to)
                }

            }, 30);
        }

        const barMouseUpHandler = (e) => {
            autoMoveTo = false
        }

        return () => (<div v-show={showScroll} class="hscroll" style={'width:' + props.viewWidth + 'px'} 
                        onMousedown={(e) => barMouseDownHandler(e)} onMouseup={(e) => barMouseUpHandler(e)}>
                         <div class="hscroll-bar" style={'width:' + barWidth.value + 'px;transform:translateX(' + barX.value+ 'px)'} 
                              onMousedown={(e) => mouseDownHandler(e)} onMouseup={() => false}></div>
                      </div>)
    }
})