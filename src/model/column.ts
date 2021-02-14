enum Align {
    LEFT = "left",
    CENTER = "center",
    RIGHT = "right"
}

enum Sort {
    ASC = "asc",
    DESC = "desc",
    NO = ""
}

interface Row {
    key: number,
    dataIndex: number,
    selected: boolean,
    actived: boolean,
    showChecked: boolean,
    hasData: boolean,
    data?: any
}

interface iconRender {
    (): object;
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
    key: string
    icon: string
    title: string
    width: number
    canSort: boolean
    sort: Sort
    canResize: boolean
    canReindex: boolean
    headerAlign: Align
    headerStyle: HeaderStyleRender
    iconRender: iconRender
    headerRender: HeaderRender
    contentAlign: Align
    contentStyle: DataStyleRender
    contentRender: ContentRender
}

export {
    Align,
    Sort,
    Row,
    iconRender,
    HeaderRender,
    ContentRender,
    Column
}