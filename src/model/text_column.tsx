import { BaseColumn } from "./base_column";
import { Column, Row } from "./column";

export default class TextColumn extends BaseColumn implements Column {

  constructor(index:number, key: string, title: string, width: number) {
    super('text', index, key, title, width, true)
  }

  headerRender = () => {
    return <span>{this.title}</span>
  }

  contentRender = (data:Row) => {
    return <span></span>
  }
}