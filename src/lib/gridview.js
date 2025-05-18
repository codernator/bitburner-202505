export const Formatters = {
    stringFormatter: v => v ?? '',
    numberFormatter: ns => v => ns.formatNumber(v ?? -1),
}

export class Justify {
    static get Left() { return 'left'; }
    static get Right() { return 'right'; }
}

export class Column {
    constructor(
        key,
        name,
        formatFunc,
        leftMargin,
        rightMargin,
        horizontalJustify
    )
    {
        this.key = key;
        this.name = name;
        this.formatFunc = formatFunc;
        this.leftMargin = leftMargin;
        this.rightMargin = rightMargin;
        this.horizontalJustify = horizontalJustify;
    }

    justify(formatted) {
        switch (this.horizontalJustify) {
            case Justify.Left: return [
                this.leftMargin,
                Math.max(0, this.rightMargin - formatted.length),
            ];
            case Justify.Right: return [
                Math.max(0, this.leftMargin - formatted.length),
                this.rightMargin,
            ];
            default: throw Error(`Unknown justify ${this.horizontalJustify}`);
        }
    }

    spacer(len, cha = ' ') {
        return [...Array(len).keys()].map(_ => cha).join('');
    }

    field(container) {
        const datum = container[this.key] ?? null;
        const formatted = this.formatFunc(datum);
        const [left, right] = this.justify(formatted);
        return `${this.spacer(left)}${formatted}${this.spacer(right)}`;
    }
    header() {
        const [left, right] = this.justify(this.name);
        return `${this.spacer(left)}${this.name}${this.spacer(right)}`;
    }

    line() {
        return `${this.spacer(this.leftMargin, '-')}${this.spacer(this.rightMargin, '-')}`;
    }
}

export class Grid {
    constructor(
        columns,
        sortFunc,
        rowsPerLine = 1,
        fieldSeparator = '|',
        rowSeparator = '\n',
    )
    {
        this.columns = columns;
        this.sortFunc = sortFunc;
        this.rowsPerLine = rowsPerLine;
        this.fieldSeparator = fieldSeparator;
        this.rowSeparator = rowSeparator;
    }

    create(values) {
        const rows = createRows(values.sort(this.sortFunc), this.columns, this.rowsPerLine, this.fieldSeparator);
        const header = this.columns.map(column => column.header()).join(this.fieldSeparator);

        return [
            header,
            this.columns.map(column => column.line()).join(this.fieldSeparator),
            ...rows
        ].join(this.rowSeparator);


        function* createRows(sorted, columns, rowsPerLine, fieldSeparator) {
            let index = 0;
            for (let row of sorted) {
                index++;
                yield columns.map(column => column.field(row)).join(fieldSeparator);
                if (rowsPerLine === 0) continue;
                if (rowsPerLine === 1 || index % rowsPerLine === 0)
                    yield columns.map(column => column.line()).join(fieldSeparator);
            }
        }
    }
}
