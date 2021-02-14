import { BaseColumn } from "./base_column";
import { Column, Row } from "./column";

export default class NormalColumn extends BaseColumn implements Column {

  constructor(key: string, title: string, width: number) {
    super(key, title, width, true)
  }

  headerRender = () => {
    return <>{this.title}</>
  }

  contentRender = (data:Row) => {
    return <span>{this.title} - {data.dataIndex + 1}</span>
  }
}