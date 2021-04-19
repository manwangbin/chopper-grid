
import {defineComponent} from 'vue'
import { ChopperGrid } from '../src'
import { Align, Column } from '../src/model/column'
import NormalColumn from '../src/model/normal_column'

export default defineComponent ({
  components: {
    ChopperGrid
  },

  setup () {
    const column1:NormalColumn = new NormalColumn('c1', '列一', 200)
    column1.headerAlign = Align.LEFT
    column1.contentAlign = Align.LEFT
    const columns:Array<Column> = [
      column1,
      new NormalColumn('c2', '列二', 300),
      new NormalColumn('c3', '列三', 400),
      new NormalColumn('c4', '列四', 400),
      new NormalColumn('c5', '列五', 400),
      new NormalColumn('c6', '列六', 400),
      new NormalColumn('c7', '列七', 400)
    ]
    return () => <chopper-grid columns={columns} />
  }
})