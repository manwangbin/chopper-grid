import { Align, Sort, Column, Row } from "./column";

export class BaseColumn implements Column {

  key: string

  icon: string

  title: string

  width: number

  canSort: boolean = true

  sort: Sort

  canResize: boolean

  canReindex: boolean

  headerAlign: Align = Align.CENTER

  contentAlign: Align = Align.CENTER

  constructor(key: string, title: string, width: number, canResize: boolean, canReindex: boolean = true) {
    this.key = key
    this.title = title
    this.width = width
    this.canResize = canResize
    this.canReindex = canReindex
  }

  headerStyle = () => {
    return 'width:' + this.width + 'px;height:30px;line-height:30px;text-align:' + this.headerAlign;
  }

  iconRender = () => {return null}

  headerRender = () => {
    return <>{this.title}</>
  }

  contentStyle = (rowHeight: number)=> {
    return 'width:' + this.width + 'px;height:' + rowHeight + 'px;' + 
           'line-height:' + rowHeight + 'px;text-align:' + this.contentAlign;
  }

  contentRender = (data:Row) => {
    return <></>
  }
}