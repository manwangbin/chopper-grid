import { computed, defineComponent, PropType, Ref, ref, TransitionGroup, watch } from "vue"
import { Column } from "../model/column"

export default defineComponent ({
    props:{
        columns: {
            type: Array as PropType<Array<Column>>,
            required: true
        },

        startIndex: {
            type: Number,
            default: 0
        }
    },

    components: {
        TransitionGroup
    },

    setup(props, {emit}) {
        let isMouseDown:boolean = false
        let originX:any = 0
        let dragIndex:number = -1
        //拖动改变列宽
        const resizeMouseDownHandler = (e, item:Column) => {
            if(window.event) {       //这是IE浏览器
                e.cancelBubble=true
            } else if(e && e.stopPropagation) {     //这是其他浏览器
                e.stopPropagation()//阻止冒泡事件
            }

            originX = e.clientX || e.touches[0].clientX;
            isMouseDown = true;
            dragIndex = props.columns.indexOf(item)

            document.onmousemove = (ev) => {
                ev.preventDefault()
                if(window.event){       //这是IE浏览器
                    e.cancelBubble=true
                }else if(e && e.stopPropagation){     //这是其他浏览器
                    e.stopPropagation()//阻止冒泡事件
                }
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
                    emit('sizeChanged', {index: dragIndex + props.startIndex, size: newWidth})
                }
            };

            document.onmouseup = (ev) => {
                if (!isMouseDown) return false;
                isMouseDown = false;
                return false
            };

            return false
        }

        //拖动改变列表顺序
        let reindexing:boolean = false
        let oldIndex:number = -1
        let leftList:Array<Array<number>> = new Array()
        let rightList:Array<Array<number>> = new Array()
        let leftColumnWidth = 0
        const dragColumn:Ref<Column> = ref(null)
        const dragColumnMoved: Ref<number> = ref(0)
        
        const dragColumnLeft = computed(() => leftColumnWidth + dragColumnMoved.value)
        const initReidnex = (column: Array<Column>, item:Column) => {
            dragColumn.value = item
            dragColumnMoved.value = 0
            leftColumnWidth = 0

            let inLeft:boolean = true
            let columnWidth:number = 0
            leftList = new Array()
            rightList = new Array()

            for (let i = 0; i < column.length; i++) {
                const indexColumn = column[i]
                if (indexColumn.key === dragColumn.value.key) {
                    oldIndex = i
                    inLeft = false
                } else if (inLeft) {
                    leftColumnWidth += indexColumn.width + 1
                    leftList.push([columnWidth, columnWidth + indexColumn.width * 0.7])
                } else if (!inLeft) {
                    const begin = columnWidth + indexColumn.width / 3
                    const end = columnWidth + indexColumn.width + 1
                    rightList.push([begin, end])
                }
                columnWidth += indexColumn.width + 1
            }
        }

        //查找拖动到左边的位置
        const findLeftIndex = (x:number) => {
            for (let i = 0; i < leftList.length; i++) {
                const columnSpan = leftList[leftList.length - i - 1]
                if (x >= columnSpan[0] && x < columnSpan[1]) {
                    return i + 1
                }
            }

            return -1
        }

        //查找拖动到右边的位置
        const findRightIndex = (x:number) => {
            for (let i = 0; i < rightList.length; i++) {
                const columnSpan = rightList[i]
                if (x >= columnSpan[0] && x < columnSpan[1]) {
                    return i + 1
                }
            }

            return -1
        }

        const reindexMouseDownHandler = (e, item:Column) => {
            if(window.event){       //这是IE浏览器
                e.cancelBubble=true
            }else if(e && e.stopPropagation){     //这是其他浏览器
                e.stopPropagation()//阻止冒泡事件
            }
            originX = e.clientX || e.touches[0].clientX
            isMouseDown = true

            //改变列的位置后重新初始化拖动的参数
            let reindexWatch = null
            document.onmousemove = (ev) => {
                ev.preventDefault()
                if(window.event){       //这是IE浏览器
                    e.cancelBubble=true
                }else if(e && e.stopPropagation){     //这是其他浏览器
                    e.stopPropagation()//阻止冒泡事件
                }
                if (!isMouseDown) return false;
                // 获取拖拽移动的距离
                if (!dragColumn.value) {
                    initReidnex(props.columns, item)
                    reindexWatch = watch(() => props.columns, (newColumn, oldColum) => {
                        if (dragColumn.value) {
                            console.log('watch prop colums')
                            initReidnex(newColumn, dragColumn.value)
                        }
                    })
                }

                if (ev.clientX !== originX) {
                    dragColumnMoved.value = ev.clientX - originX
                    if (reindexing) {
                        return
                    }
                    
                    if (dragColumnMoved.value < 0) {
                        const movedIndex = findLeftIndex(dragColumnLeft.value)
                        if (movedIndex > 0) {
                            reindexing = true
                            emit('indexChanged', {'oldIndex': oldIndex, 'newIndex': oldIndex - movedIndex})
                            originX = ev.clientX
                            setTimeout(() => reindexing = false, 1100)
                        }
                    } else if (dragColumnMoved.value > 0) {
                        const movedIndex = findRightIndex(dragColumnLeft.value + dragColumn.value.width)
                        if (movedIndex > 0) {
                            reindexing = true
                            emit('indexChanged', {'oldIndex': oldIndex, 'newIndex': oldIndex + movedIndex})
                            originX = ev.clientX
                            setTimeout(() => reindexing = false, 1100)
                        }
                    }
                }
            };

            document.onmouseup = (ev) => {
                if (!isMouseDown) return false
                isMouseDown = false
                dragColumn.value = null
                if (reindexWatch) {
                    reindexWatch()
                }
                return false
            };

            return false
        }

        const columnCells = () => (props.columns.map((item) => 
            <div class='header-cell' style={item.headerStyle()} key={item.key} 
                 onMousedown={(e) => reindexMouseDownHandler(e, item)} onMouseup={() => false}>
                {item.iconRender()}
                {item.headerRender()}

                <div v-show={item.canResize} class='resize-block' onMousedown={(e) => resizeMouseDownHandler(e, item)} onMouseup={() => false}>
                    <div class='resize-line' />
                </div>
            </div>)
        )

        const dragCell = () => {
            if (dragColumn.value) {
                return <div class='drag-reindex' key="_dragColumn" style={dragColumn.value.headerStyle() + ';left:' + dragColumnLeft.value + 'px'} >
                           {dragColumn.value.headerRender()}
                       </div>
            }
        }

        return () => <div class="header-container">
                        <transition-group name={dragColumn.value ? 'reindex' : ''} class="header" tag="div">
                            {columnCells()}
                        </transition-group>
                        {dragCell()}
                     </div>
    }
})