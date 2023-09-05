import {  useEffect, useCallback, useState, 
  // useRef
 } from 'react';
import type { ChangeEvent, FocusEvent , KeyboardEvent } from 'react';
import type { City } from 'api/getCities';
import type { Header } from 'components/SortableTable';
import { getCities } from 'api/getCities';
import SortableTable from './components/SortableTable';
import useDebounce from './util/useDebounce';
import './App.scss';

const App = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<Error>();
  const [isError, setIsError] = useState<boolean>(false);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  //-- search-field input related
  const PLACE_HOLDER = 'Search for a city';
  const MIN_SEARCH_KICKIN = 150;  //-- search only kicks in after 150ms since the last change to the search term
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, MIN_SEARCH_KICKIN);
  const [searchPlaceHolder, setSearchPlaceHolder] = useState<string>(PLACE_HOLDER);
  // const inputRef = useRef<HTMLInputElement|undefined>();

  //-- header data for sortable-table
  const headers:Header[] = [
    {name: "City", key: "nameAscii", sortable: true},
    {name: "Country", key: "country", sortable: true},
    {name: "Country Code", key: "countryIso3", sortable: true},
    {name: "Capital", key: "capital", sortable: false},
    {name: "Population", key: "population", sortable: true}
  ];

  const runSearch = useCallback(async (term: string) => {
    try 
    {
      setDataLoaded(false);
      const searchResult = await getCities({ searchTerm: term });
      setCities(searchResult);
      setIsError(false);
      setDataLoaded(true);
    } catch (err: any) {
      setError(err);
      setIsError(true);
      setDataLoaded(false);
    }
  }, []);

  useEffect(() => {
    runSearch(debouncedSearchTerm);
  }, [runSearch, debouncedSearchTerm]);

  //-- search-field handlers
  const onSearchFieldFocus = (event: FocusEvent<HTMLInputElement>) => {
    setSearchPlaceHolder("");
  }
  const onSearchFieldBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (searchTerm === '') setSearchPlaceHolder(PLACE_HOLDER);
  }
  const onSearchTermChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const term:string = event.currentTarget.value;
    setSearchTerm(event.currentTarget.value);
    if (term !== "") event.preventDefault();
  };
  const handleKeyDownOnInput = (event: KeyboardEvent<HTMLInputElement>) => {
    //-- for preventing Enter key clears the search-field
    if (event.code === 'Enter') event.preventDefault();
  }

  // const cityRows = useMemo(() =>
  //   cities.map(s => <pre key={s.id}>{JSON.stringify(s)}</pre>),
  // [cities]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>City List</h1>
      </header>
      <form className="App-input">
        <div className={`search-field ${isError? "error" : ""}`}>
          <input id="search" name="search" type="text" 
                 aria-label="search"
                //  ref={inputRef}
                 className={`searchInput ${isError? "error" : ""}`}
                 placeholder= {searchPlaceHolder}
                 onFocus={onSearchFieldFocus} 
                 onBlur={onSearchFieldBlur}
                 onChange={onSearchTermChange}
                 onKeyDown={handleKeyDownOnInput}
          />
          <i className="searchIcon" />
        </div>
      </form>
      <div className="App-output">
        {
          (!dataLoaded && !isError) ? <pre>Searching ...</pre> :
          (!isError && cities.length === 0) ? <pre>There's no matching city or country!</pre> :
          (isError && error) ?  <pre>{`Eek! ${error.message}`}</pre> :
          <SortableTable  headers={headers} items={cities} />
        }
      </div>
    </div>
  );
 };

export default App;