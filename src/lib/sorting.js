export const stringSortFunc = (field, d) => d
    ? (a,b) => b[field].localeCompare(a[field])
    : (a,b) => a[field].localeCompare(b[field]);

export const valueSortFunc = (field, d) => d
    ? (a,b) => b[field] - a[field]
    : (a,b) => a[field] - b[field];

export const createMultiSorter = sorters => (l1, l2) => {
    for (let sorter of sorters) {
        const answer = sorter(l1, l2);
        if (answer !== 0) return answer;
    }
    return 0;
};
