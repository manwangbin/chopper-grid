import { defineComponent } from "vue";

export default defineComponent ({
    name: 'HelloWord',

    setup () {
        console.log('set up hello companent');
        return () => <div>Hello Word</div>
    }
})