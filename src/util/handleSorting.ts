export type SortDir = 'asc' | 'desc';

type SortingOptions = {
  key: string;
  dir: SortDir;
  items: any[];
};

export const handleSorting = ({ key, dir, items }:SortingOptions):any[] => {
  const sorted = [...items].sort((a, b) => {
    if (a[key] === null) return 1;
    if (b[key] === null) return -1;
    if (a[key] === null && b[key] === null) return 0;
    return (
      a[key].toString().localeCompare(b[key].toString(), "en", {numeric: true,}) * (dir === "asc" ? 1 : -1)
    );
  });

  return sorted;
}