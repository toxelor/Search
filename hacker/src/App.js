import React from 'react';
import axios from 'axios';

import './App.css'
import SearchForm from './SearchForm/index';
import List from './List/index';

const API_BASE = 'https://hn.algolia.com/api/v1/'
const API_SEARCH = '/search'; 
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page='

const getUrl = (searchTerm, page) => `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`

const useSemiPersistentState = (key, initialState) => {
    const isMounted = React.useRef(false)

    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true
        } else {
            localStorage.setItem(key, value)
        }
    }, [value, key])
    
    return [value, setValue]
}

const storiesReducer = (state, action) =>{
    switch (action.type){
        case 'REMOVE_STORY':
            return {
                ...state,
                data: state.data.filter(
                    story => action.payload.objectID !== story.objectID
                )
            }
        case 'STORIES_FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false
            }
        case 'STORIES_FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload.list,
//                    action.payload.page === 0
//                    ? action.payload.list
//                    : state.data.concat(action.payload.list),
                page: action.payload.page
                }
        case 'STORIES_FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true
            }

        default:
            throw new Error()
    }
}

const getSumComments = stories => {

    return stories.data.reduce(
        (result, value) => result + value.num_comments,
        0
    )
}

const extractSearchTerm = url => url
                                    .substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&'))
                                    .replace(PARAM_SEARCH, '')

const getLastSearches = urls => 
    urls.reduce((result, url, index) => {
        const searchTerm = extractSearchTerm(url)

        if (index === 0) {
            return result.concat(searchTerm)
        }

        const previousSearchTerm = result[result.length - 1]

        if (searchTerm === previousSearchTerm) {
            return result
        } else {
            return result.concat(searchTerm)
        }
    }, [])
    .slice(-6)
    .slice(0, -1)

const App = () => {

    const [searchTerm, setSearchTerm] = useSemiPersistentState(
        'search',
        'React'
    )

    const [urls, setUrls] = React.useState([getUrl(searchTerm, 0)])



    const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        { data: [], page: 0, isLoading: false, isError: false }
    )

    const handleFetchStories = React.useCallback(async () => {
        dispatchStories({ type: 'STORIES_FETCH_INIT' })
        
        try{
            const lastUrl = urls[urls.length-1]
            const result = await axios.get(lastUrl)
            dispatchStories({
                type: 'STORIES_FETCH_SUCCESS',
                payload: {
                    list: result.data.hits,
                    page: result.data.page
                }
            })
        } catch {
            dispatchStories({
                type: 'STORIES_FETCH_FAILURE'
            })
        }
        
    }, [urls])

    React.useEffect(() => {
        handleFetchStories()
    }, [handleFetchStories])

    const handleRemoveStory = React.useCallback(item => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item
        })
    }, [])

    const handleSeacrhInput = React.useCallback(event => {
        setSearchTerm(event.target.value)
    }, [setSearchTerm])

    const handleSeacrhSubmit = event => {
        handleSeacrh(searchTerm, 0)

        event.preventDefault()
    }
 
    const title = 'Anon'


    const sumComments = React.useMemo(() => getSumComments(stories), [
        stories,
    ])

    const handleLastSearch = searchTerm => {
        setSearchTerm(searchTerm)

        handleSeacrh(searchTerm, 0)
    }

    const handleMore = () => {
        const lastUrl = urls[urls.length - 1]
        const searchTerm = extractSearchTerm(lastUrl)
        handleSeacrh(searchTerm, stories.page + 1)
    }

    const handleLess = () => {
        const lastUrl = urls[urls.length - 1]
        const searchTerm = extractSearchTerm(lastUrl)
        handleSeacrh(searchTerm, stories.page - 1)
    }

    const handleSeacrh = (searchTerm, page) => {
        const url = getUrl(searchTerm, page)
        setUrls(urls.concat(url))
    }

    const lastSearchers = getLastSearches(urls)
  
    return ( 
        <div className='container'> 
            <h1 className='headline-primary'>Hello, {title}, {stories.isLoading ? (<span>i'm thinking...</span>) : (<span>this thingy have {sumComments} comments</span>)}</h1> 
            <SearchForm 
                searchTerm={searchTerm}
                onSearchInput={handleSeacrhInput}
                onSearchSubmit={handleSeacrhSubmit}
            />

            <LastSearchers 
                lastSearchers={lastSearchers}
                onLastSearch={handleLastSearch}
            />

            <List list={stories.data} onRemoveItem={handleRemoveStory} />

            {stories.isError && <p>Something went wrong...</p>}


            <div className='navigation'>
                {stories.page > 0 ? (<button className='button button-large' type='button' onClick={handleLess}>
                    ←
                </button>)
                : (<button className='button button-large' type='button'>
                ←
                </button>)}
                <button className='button button-large' type='button'>
                    {stories.isLoading 
                    ? (<span className='loader'>☼</span>)
                    : stories.page + 1 }
                </button>
                {stories.page < 49 ? (<button className='button button-large' type='button' onClick={handleMore}>
                    →
                </button>)
                : (<button className='button button-large' type='button'>
                →
                </button>)}

            </div>
            
        </div> 
    ); 
    }
    
const LastSearchers = ({ lastSearchers, onLastSearch }) => (
    <>
    {
        lastSearchers.map((searchTerm, index) => (
            <button
                className='button button-small'
                key={searchTerm + index}
                type='button'
                onClick={() => onLastSearch(searchTerm)}
            >
                {searchTerm}
            </button>
        ))
    }

    </>
)

export default App;

