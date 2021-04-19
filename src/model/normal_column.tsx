import { BaseColumn } from "./base_column"
import { Column, Row } from './column'
import { TeamOutlined } from '@ant-design/icons-vue'

export default class NormalColumn extends BaseColumn implements Column {

  constructor(key: string, title: string, width: number) {
    super(key, title, width, true)
  }

  headerRender = () => {
    return <>{this.title}</>
  }

  iconRender = () => {
    return <TeamOutlined style='margin: 0px 10px'/>
  }

  contentRender = (data:Row) => {
    return <span>{this.title} - {data.dataIndex + 1}</span>
  }
}