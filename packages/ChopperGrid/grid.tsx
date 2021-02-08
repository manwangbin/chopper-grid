import { defineComponent, inject } from "vue";
import GridService from "./grid.service";
import GridHeader from './component/grid-header'
import GridBottom from './component/grid-bottom'
import List from './list/list'
import Group from './group/group'

import './grid.less'

export default defineComponent ({
    components: {
        GridHeader,
        GridBottom,
        List,
        Group
    },

    mounted() { 
        window.addEventListener('resize', function() {
            
        })
    },

    setup() {
        const service = new GridService()
        console.log('begin setup grid');
        const body = () => {
            if (service.model.state == 1) {
                return <list></list>
            } else {
                return <group></group>
            }
        }

        return () => <div class='grid-container'><grid-header />{body()}<grid-bottom /></div>
    }
})