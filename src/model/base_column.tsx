import { GRID_HEADER_HEIGHT } from "../const";
import { Align, Column, Row } from "./column";

export class BaseColumn implements Column {

  tag: string

  key: string

  title: string

  width: number

  canResize: boolean

  canReindex: boolean

  headerAlign: Align = Align.CENTER

  contentAlign: Align = Align.CENTER

  constructor(tag:string,  key: string, title: string, width: number, canResize: boolean, canReindex: boolean = true) {
    this.tag = tag
    this.key = key
    this.title = title
    this.width = width
    this.canResize = canResize
    this.canReindex = canReindex
  }

  headerStyle = () => {
    return 'width:' + this.width + 'px;height:30px;line-height:30px;text-align:' + this.headerAlign;
  }

  headerRender = () => {
    return <></>
  }

  contentStyle = (rowHeight: number)=> {
    return 'width:' + this.width + 'px;height:' + rowHeight + 'px;' + 
           'line-height:' + rowHeight + 'px;text-align:' + this.contentAlign;
  }

  contentRender = (data:Row) => {
    return <></>
  }
}