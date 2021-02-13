import { GRID_HEADER_HEIGHT } from "../const";
import { BaseColumn } from "./base_column";
import { Align, Column, Row } from "./column";

export default class HeaderColumn extends BaseColumn implements Column {

    constructor() {
        super('rowHeader', 0, '_selected', '', 60, false, false)
    }
    
    headerRender = () => {return <input type='checkbox' />}

    contentRender = (data:Row) => {return data.selected ? <input type='checkbox' checked /> : <div style='font-size: 10px;'>{data.dataIndex + 1}</div>}
}