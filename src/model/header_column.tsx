import { BaseColumn } from "./base_column"
import { Column, Row } from "./column"

export default class HeaderColumn extends BaseColumn implements Column {

    constructor() {
        super('_selected', '', 60, false, false)
        this.canSort = false
    }

    onMouseEntryHandler = (data:Row) => {
        data.showChecked = true
    }

    onMouseLeaveHandler = (data:Row) => {
        data.showChecked = false
    }

    headerContent = (data:Row) => {
        if (data.showChecked || data.selected) {
            return <input type='checkbox' checked={data.selected} onClick={() => data.selected = !data.selected}/>
        } else {
            return data.dataIndex + 1
        }
    }
    
    headerRender = () => {return <input type='checkbox' />}

    contentRender = (data:Row) => {
        return <div style='font-size: 10px;' 
                    onMouseenter={() => this.onMouseEntryHandler(data)}
                    onMouseleave={() => this.onMouseLeaveHandler(data)}>
                   { this.headerContent(data) }
               </div>
    }
}