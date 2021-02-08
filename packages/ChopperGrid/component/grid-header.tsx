import { defineComponent, inject } from "vue";
import GridService from "../grid.service";


export default defineComponent ({
    setup() {
        const service = inject(GridService.token)
        const columnCells = () => (service.model.columns.map(item => <div class='header-cell' style={'width:' + item.width + 'px'}>{item.title}</div>))
        return () => (<div class="header"><div class="selected-all header-cell"><input type="checkbox" /></div>{columnCells()}</div>)
    }
})