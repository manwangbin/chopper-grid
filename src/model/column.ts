enum Align {
    LEFT = "left",
    CENTER = "center",
    RIGHT = "right"
}

interface Row {
    key: number,
    dataIndex: number,
    selected: boolean,
    hasData: boolean,
    data?: any
}

interface HeaderRender {
    (): object;
}

interface ContentRender {
    (data: Row): object;
}

interface HeaderStyleRender {
    (): string
}

interface DataStyleRender {
    (rowHeight:number): string
}

interface Column {
    index: number
    key: string
    tag: string
    title: string
    width: number
    canResize: boolean
    headerAlign: Align
    headerStyle: HeaderStyleRender
    headerRender: HeaderRender
    contentAlign: Align
    contentStyle: DataStyleRender
    contentRender: ContentRender
}

export {
    Align,
    Row,
    HeaderRender,
    ContentRender,
    Column
}