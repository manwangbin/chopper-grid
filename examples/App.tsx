
import {defineComponent} from 'vue'
import { ChopperGrid } from '../src'

export default defineComponent ({
  components: {
    ChopperGrid
  },

  setup () {
    return () => <chopper-grid />
  }
})