import "./App.css";
import React from "react";
import axios from "axios"
import CompanyList from "./CompanyList";
import Search from "./Search";
import Pagination from "@mui/material/Pagination";
import parse from "parse-link-header"
import { Button, InputLabel, FormControl, MenuItem, Select } from "@mui/material";

const API_ENDPOINT = 'http://localhost:3001/search';

const reducer = (state, action) => {
  switch(action.type) {
    case 'PAGE_DATA_FETCH_INIT':
      return {
        ...state,
        pageSize: action.payload.pageSize,
        searchTerm: action.payload.searchTerm,
        currentPage: action.payload.currentPage,
        isLoading: true,
        isError: false,
      };
    case 'PAGE_DATA_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        companies: action.payload.companies,
        numStarredCompanies: action.payload.numStarredCompanies,
        pageCount: action.payload.pageCount,
        showingStarred: action.payload.showingStarred,
      };
    case 'PAGE_DATA_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'UPDATE_STARRED_FOR_COMPANY_INIT':
      return {
        ...state,
        isError: false,
      };
    case 'UPDATE_STARRED_FOR_COMPANY_SUCCESS':
      return {
        ...state,
        isError: false,
        numStarredCompanies: action.payload.numStarredCompanies,
      };
    case 'UPDATE_STARRED_FOR_COMPANY_FAILURE':
      return {
        ...state,
        isError: true,
      };
    default:
      throw new Error(`Unsupported action type: ${action.type}`)
  }
};

const App = () => {

  const initialState = {
    companies: [],
    pageSize: 10,
    currentPage: 1,
    searchTerm: '',
    numStarredCompanies: 0,
    pageCount: 0,
    showingStarred: false,
    isLoading: false,
    isError: false
  };

  const [state, dispatchState] = React.useReducer(reducer, initialState);
  const { companies, pageSize, currentPage, searchTerm, numStarredCompanies, pageCount, showingStarred, isLoading, isError } = state;

  const handleSearch = event => {
    getSearchResults(1, pageSize, event.target.value);
  };

  const getSearchResults = (currentPage, pageSize, searchTerm) => {
    const url = `${API_ENDPOINT}?_page=${currentPage}&_limit=${pageSize}&q=${searchTerm}`;

    dispatchState({
      type: 'PAGE_DATA_FETCH_INIT',
      payload: {
        currentPage,
        pageSize,
        searchTerm,
      }
    });

    axios.get(url)
      .then(response => {
        dispatchState({
          type: 'PAGE_DATA_FETCH_SUCCESS',
          payload: {
            companies: response.data,
            pageCount: getPageCount(response.data, response.headers.link),
            currentPage,
            pageSize,
            searchTerm,
            numStarredCompanies,
          }
        })
      }).catch(error => {
        console.error(`Failed to fetch page data due to error: ${error}`);
        dispatchState({
            type: 'PAGE_DATA_FETCH_FAILURE'
          })
        })
  };

  const getPageCount = (data, headersLink) => {
    if (!headersLink && data.length > 0) {
      return 1;
    } else if (headersLink) {
      const parsedHeaders = parse(headersLink);
      return parseInt(parsedHeaders.last._page);
    } else {
      return 0;
    }
  };

  const toggleIsStarred = (company) => {
    company.starred = !company.starred;

    const data = {starred: company.starred};
    const config = {headers: 'Content-Type: application/json'};

    dispatchState({type: 'UPDATE_STARRED_FOR_COMPANY_INIT'});

    axios.patch(`${API_ENDPOINT}/${company.id}`, data, config)
      .then(() => {
        dispatchState({
          type: 'UPDATE_STARRED_FOR_COMPANY_SUCCESS',
          payload: {
            numStarredCompanies: companies.filter(company => company.starred).length,
          }
        });
      })
      .catch(error => {
        console.error(`Failed to update starred status for company id: ${company.id} due to error: ${error}`);
        dispatchState({type: 'UPDATE_STARRED_FOR_COMPANY_FAILURE'})
      })
  };

  const handleChangePage = (event, page) => {
    getSearchResults(page, pageSize, searchTerm)
  };

  const handleChangePageSize = event => {
    getSearchResults(1, event.target.value, searchTerm)
  };

  const handleShowStarred = () => {
    const url = `${API_ENDPOINT}?_page=${currentPage}&_limit=${pageSize}&starred=true&q=${searchTerm}`;

    axios.get(url)
    .then(response => {
      dispatchState({
        type: 'PAGE_DATA_FETCH_SUCCESS',
        payload: {
          companies: response.data,
          pageCount: getPageCount(response.data, response.headers.link),
          showingStarred: true,
          numStarredCompanies,
        }
      })
    })
    .catch(error => {
      console.error(`Failed to fetch page data due to error: ${error}`);
      dispatchState({
        type: 'PAGE_DATA_FETCH_FAILURE'
      })
    });
  };

  const handleShowAll = () => {
    getSearchResults(1, pageSize, searchTerm)
  };

  React.useEffect(() => {
    dispatchState({
      type: 'PAGE_DATA_FETCH_INIT',
      payload: {
        currentPage: 1,
        pageSize: 10,
        searchTerm: "",
      }
    });

    const getAll = axios.get(`${API_ENDPOINT}`);
    const getPage = axios.get(`${API_ENDPOINT}?_page=${1}&_limit=${10}&q=${''}`);

    Promise.all([getAll, getPage])
      .then(values => {
        const starredCompanies = values[0].data.slice().filter(company => company.starred);

        dispatchState({
          type: 'PAGE_DATA_FETCH_SUCCESS',
          payload: {
            companies: values[1].data,
            numStarredCompanies: starredCompanies.length,
            pageCount: getPageCount(values[1].data, values[1].headers.link),
          }
        })
      })
      .catch(error => {
        console.error(`Failed to fetch page data due to error: ${error}`);
        dispatchState({
          type: 'PAGE_DATA_FETCH_FAILURE'
        })
      });
  }, []);

  return (
    <>
      <header className="App-header-container">
        <img src="https://mybrightwheel.com/wp-content/themes/_brightwheel/img/brightwheel-logo-color.svg" alt="brightwheel logo"/>
      </header>

      <nav className="App-search-container">
        <Search onSearch={handleSearch} />
      </nav>

      {isLoading && <div className="App-loading-indicator-container"><p className="App-loading-indicator">Loading...</p></div>}

      {!isLoading ?
        !showingStarred ?
        <Button className="App-num-starred-companies" variant="outlined" onClick={handleShowStarred}>{`Show starred (${numStarredCompanies})`}</Button>
        : <Button className="App-num-starred-companies" variant="outlined" onClick={handleShowAll}>{'Show all'}</Button>
      : null}

      {isError && <p className="App-error">Something went wrong...</p>}

      {!isLoading && !isError ?
      <section className="App-companies-container">
        <CompanyList companies={companies} onToggleStarred={toggleIsStarred}/>
      </section>
      : null}

      {!isError && !isLoading && companies.length === 0 ? (
        <p className="App-no-results">No results!</p>
      ): null}

      {!isError && !isLoading && companies.length > 0 ? (
        <footer className="App-pagination-container">
          <Pagination
            className="App-pagination"
            variant="outlined"
            shape="rounded"
            color="primary"
            count={pageCount}
            page={currentPage}
            onChange={handleChangePage} />

          <FormControl size="small" className="App-pagination-select">
            <InputLabel>per page</InputLabel>
            <Select
              value={pageSize}
              label="Page size"
              onChange={handleChangePageSize}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={40}>40</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </footer>
      ) : null}
    </>
  );
};

export default App;
