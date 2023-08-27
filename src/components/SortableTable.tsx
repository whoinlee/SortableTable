import {
  useCallback,
  useState, 
  useEffect,
  useMemo
} from 'react';
import type { ChangeEvent } from 'react';
import type { SortDir } from '../util/handleSorting';
import IconButton from './base/IconButton/IconButton';
import "./SortableTable.scss";

export type Header = {
  name: string;                 //-- The text to be displayed in the header column
  key: string;                  //-- The unique identifier to associate a column with subsequent row data
  sortable?: boolean;           //-- whether the column is sortable
}

type SortableTableProps = {
  headers: Header[];
  items: any[];                 //-- table data
  perPages?: number[];          //-- for "perPage" select options
  defaultPerPage?: number;      //-- initial perPage
};

const PER_PAGES:number[] = [5, 10, 15, 20, 25];
const DEFAULT_PER_PAGE: number = 10;

const SortableTable = ({
    headers, 
    items,
    perPages=PER_PAGES,
    defaultPerPage=DEFAULT_PER_PAGE
  }:SortableTableProps) => {
  
  const [perPage, setPerPage] = useState<number>(defaultPerPage);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPageNum, setLastPageNum] = useState<number>(0);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [sortKey, setSortKey] = useState<string>();
  const [sortedItems, setSortedItems] = useState<any[]>([]);

  useEffect(() => {
    const lastPage = Math.max(Math.round(items.length/perPage), 1);
    setLastPageNum(lastPage);
  }, [items, perPage]);

  useEffect(() => {
    setSortedItems([...items]);
  }, [items]);

  const handleSorting = useCallback((key:string, dir:SortDir) => {
    if (key) {
      sortedItems.sort((a, b) => {
        if (a[key] === null) return 1;
        if (b[key] === null) return -1;
        if (a[key] === null && b[key] === null) return 0;
        //-- for covering up sorting by numeric values
        return (
          a[key].toString().localeCompare(b[key].toString(), "en", {
            numeric: true,
          }) * (dir === "asc" ? 1 : -1)
        );
      });
    }
  }, [sortedItems]);

  const onHeaderClick = useCallback((key:string) => {
    let dir:SortDir = (sortDir === "asc" && sortKey) ? "desc" : "asc";
    setSortKey(key);
    setSortDir(dir);
    handleSorting(key, dir); 
  }, [handleSorting, sortDir, sortKey]);

  //-- perPage change handler
  const onPerPageChange = (e:ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.currentTarget.value));
    toFirstPageHandler(); //-- reset to the 1st page on perPage select change
  }

  //-- prevNext control handlers
  const toFirstPageHandler = useCallback(() => { 
    setCurrentPage(1);
  }, []);
  const toPrevPageHandler = useCallback(() => { 
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }, [currentPage]);
  const toNextPageHandler = useCallback(() => { 
    if (currentPage < lastPageNum) setCurrentPage(currentPage + 1);
  }, [currentPage, lastPageNum]);
  const toLastPageHandler = useCallback(() => { 
    setCurrentPage(lastPageNum);
  }, [lastPageNum]);

  const onKeyDownHandler = useCallback((event:KeyboardEvent) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        event.stopPropagation();
        if (event.shiftKey) {
          toFirstPageHandler();
        } else {
          toPrevPageHandler();
        }
        break;
      case "ArrowRight":
        event.preventDefault();
        event.stopPropagation();
        if (event.shiftKey) {
          toLastPageHandler();
        } else {
          toNextPageHandler();
        }
        break;
    }
  }, [toFirstPageHandler, toPrevPageHandler, toNextPageHandler, toLastPageHandler]);

  useEffect(() => {
      document.addEventListener("keydown", onKeyDownHandler);

    return () => {
      document.removeEventListener("keydown", onKeyDownHandler);
    };
  }, [onKeyDownHandler]);

  const headerRow = useMemo(() => 
    headers.map(({name, key, sortable}) => 
              <th key={`tableHeader_${name}`} 
                  className={`sortable-table__header ${sortable ? "" : "non-sortable"}`}
                  onClick={sortable ? () => onHeaderClick(key) : undefined}>
                {name}
                {sortable && <span className={`sortIcon ${(key === sortKey)? (sortDir === "asc")? "up" : "down" : ""}`} />}
              </th>)
  , [headers, onHeaderClick, sortDir, sortKey]);

  const bodyRows = useMemo(() => 
    sortedItems.slice(perPage*(currentPage-1), perPage*currentPage).map((item, i) => {
      return (
        <tr key={`itemRow_${i}`} className="sortable-table__itemRow">
          { headers.map((header, j) => {
              return (
                <td key={`tableItem_${i}${j}`} className="sortable-table__item">{item[header.key].toLocaleString("en-US")}</td>
              )
          })}
        </tr>
      )
    })
  , [sortedItems, perPage, currentPage, headers]);

  return (
    <div className="sortable-table">
      <table>
        <thead>
          <tr className="sortable-table__headerRow">
          { headerRow }
          </tr>
        </thead>
        {/* - */}
        <tbody>
          { bodyRows }
        </tbody>
        {/* - */}
        <tfoot>
          <tr className="sortable-table__footerRow">
            <td className="sortable-table__perPageControl">
              <form>
                <label htmlFor="perPage">Per Page: </label>
                <select name="perPage" 
                        defaultValue={perPage}
                        onChange={onPerPageChange}>
                  {perPages.map(offset => <option key={`option_${offset}`} value={offset}>{offset}</option>)}
                </select>
              </form>
            </td>
            <td colSpan={headers.length - 2}>
              <span className="currentPage">{currentPage}/{lastPageNum}</span>
            </td>
            <td className="sortable-table__prevNextControl">
              <IconButton name="firstPage"
                          iconpath="/assets/FirstPage.svg"
                          callback={toFirstPageHandler}
                          disabled={currentPage === 1} />
              <IconButton name="prevPage"
                          iconpath="/assets/ChevronLeft.svg"
                          callback={toPrevPageHandler}
                          disabled={currentPage === 1} />
              
              <IconButton name="nextPage"
                          iconpath="/assets/ChevronRight.svg"
                          callback={toNextPageHandler}
                          disabled={currentPage === lastPageNum} />
              <IconButton name="lastPage"
                          iconpath="/assets/LastPage.svg"
                          callback={toLastPageHandler}
                          disabled={currentPage === lastPageNum} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default SortableTable;