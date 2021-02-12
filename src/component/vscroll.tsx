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
        //内容区域向滚动条区域转化的比例
        const toscrollRator = computed(() => props.viewHeight / props.contentHeight)
        //滚动条的高度
        const barHeight = computed(() =>  {
            const height = Math.floor(props.viewHeight * toscrollRator.value)
            return height < 30 ? 30 : height
        })
        //最大单步移动距离
        const maxStepSpace = computed(() => 200 * toscrollRator.value)

        //滚动条区域向内容区域转化的比例
        const toViewRator = computed(() => (props.contentHeight - props.viewHeight) / (props.viewHeight - barHeight.value))
        const positionMaxY = computed(() => props.viewHeight - barHeight.value)
        const showScroll = computed(() => props.contentHeight > props.viewHeight)
        const barY:Ref<number> = ref(0)

        let moveTimer:number = null
        let moveTo: number = null
        let autoMoveTo = false

        let isMouseDown:boolean = false
        let originY:number = 0

        //设置垂直滚动条的位置
        const setY = (newPosition) => {
            if (newPosition < 0) {
                newPosition = 0

            } else if (newPosition > positionMaxY.value) {
                newPosition = positionMaxY.value

            }

            barY.value = newPosition
            emit("scrolling", barY.value * toViewRator.value)
        }

        //设置滚动条的位置
        const movePosition = (span) => {
            if ((span < 0 && barY.value == 0) || (span > 0 && barY.value == positionMaxY.value)) {
                return
            }

            const y = barY.value + span * toscrollRator.value
            setY(y)
        }
        emit('load', movePosition)

        const mouseDownHandler = (e) => {
            if(window.event){       //这是IE浏览器
                e.cancelBubble=true
            } else if(e && e.stopPropagation){     //这是其他浏览器
                e.stopPropagation()//阻止冒泡事件
            }

            originY = e.clientY || e.touches[0].clientY
            isMouseDown = true
            document.onmousemove = (ev) => {
                ev.preventDefault
                if (!isMouseDown) return false;

                //获取拖拽移动的距离
                const eventY = ev.clientY;
                if (eventY !== originY) {
                    const moveY = eventY - originY
                    if (moveY != 0) {
                        let newPosition = barY.value + moveY
                        setY(newPosition)
                        originY = eventY
                    }
                }
            };

            document.onmouseup = (e) => {
                if (!isMouseDown) return false

                isMouseDown = false
                autoMoveTo = false
                return false
            };

            return false
        }

        const barMouseDownHandler = (e) => {
            autoMoveTo = true
            moveTo = e.offsetY - barHeight.value / 2
            autoMove()
        }

        const barMouseUpHandler = (e) => {
            autoMoveTo = false
        }

        const autoMove = () => {
            if (moveTimer) {
                return
            }

            moveTimer = setInterval(() => {
                let dir = 1
                if (moveTo < barY.value) {
                    dir = -1
                }

                let newPosition = barY.value + 2 * dir
                if (newPosition * dir > moveTo * dir) {
                    newPosition = moveTo
                    autoMoveTo = false
                }

                if (newPosition < 0) {
                    newPosition = 0
                    autoMoveTo = false

                } else if (newPosition > positionMaxY.value) {
                    newPosition = positionMaxY.value
                    autoMoveTo = false

                }

                barY.value = newPosition
                emit("scrolling", barY.value * toViewRator.value)
                if (!autoMoveTo) {
                    clearInterval(moveTimer)
                    moveTimer = null
                }
            }, 1);
        }

        return () => (<div v-show={showScroll} class="vscroll" style={'height:' + props.viewHeight + 'px'} 
                        onMousedown={(e) => barMouseDownHandler(e)} onMouseup={(e) => barMouseUpHandler(e)}>
                        <div class="vscroll-bar" style={'height:' + barHeight.value + 'px;transform:translateY(' + barY.value+ 'px)'} 
                            onMousedown={(e) => mouseDownHandler(e)} onMouseup={() => false}></div>
                      </div>)
    }
})