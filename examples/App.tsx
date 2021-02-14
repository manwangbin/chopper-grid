
import {defineComponent} from 'vue'
import { ChopperGrid } from '../src'
import { Column } from '../src/model/column'
import TextColumn from '../src/model/text_column'

export default defineComponent ({
  components: {
    ChopperGrid
  },

  setup () {
    const columns:Array<Column> = [
      new TextColumn('c1', '列一', 200),
      new TextColumn('c2', '列二', 300),
      new TextColumn('c3', '列三', 400),
      new TextColumn('c4', '列四', 400),
      new TextColumn('c5', '列五', 400),
      new TextColumn('c6', '列六', 400),
      new TextColumn('c7', '列七', 400)
    ]
    return () => <chopper-grid columns={columns} />
  }
})