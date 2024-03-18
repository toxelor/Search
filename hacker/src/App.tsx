import React from 'react';
import axios from 'axios';

import './App.css'
//import { ReactComponent as Check } from '../src/logo.svg'

type Story = {
    objectID: string; 
    url: string; 
    title: string; 
    author: string; 
    num_comments: number; 
    points: number;
}

type Stories = Array<Story>

type ListProps = {
    list: Stories;
    onRemoveItem: (item: Story) => void;
}

type ItemProps = {
    item: Story;
    onRemoveItem: (item: Story) => void;
}

type StoriesState = {
    data: Stories;
    isLoading: boolean;
    isError: boolean;
}

interface StoriesFetchInitAction {
    type: 'STORIES_FETCH_INIT'
}

interface StoriesFetchSuccessAction {
    type: 'STORIES_FETCH_SUCCESS'
    payload: Stories
}

interface StoriesFetchFailureAction {
    type: 'STORIES_FETCH_FAILURE'
}

interface StoriesRemoveAction {
    type: 'REMOVE_STORY'
    payload: Story
}

type StoriesAction = 
    | StoriesFetchInitAction
    | StoriesFetchSuccessAction
    | StoriesFetchFailureAction
    | StoriesRemoveAction;

type SearchFormProps = {
    searchTerm: string;
    onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

type InputWithLabelProps = {
    id: string,
    value: string,
    type?: string,
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>)=> void
    children: React.ReactNode
}

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query='

const useSemiPersistentState = (
    key: string, 
    initialState: string): [string, (newValue: string) => void] => {
    const isMounted = React.useRef(false)

    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true
        } else {
            console.log('A')
            localStorage.setItem(key, value)
        }
    }, [value, key])
    
    return [value, setValue]
}

const storiesReducer = (state: StoriesState, action: StoriesAction) =>{
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
                data: action.payload
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
    console.log('C')

    return stories.data.reduce(
        (result, value) => result + value.num_comments,
        0
    )
}

const App = () => {

    const [searchTerm, setSearchTerm] = useSemiPersistentState(
        'search',
        'React'
    )

    const [url, setUrl] = React.useState(
        `${API_ENDPOINT}${searchTerm}`
    )

    const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        { data: [], isLoading: false, isError: false }
    )

    const handleFetchStories = React.useCallback(async () => {
        dispatchStories({ type: 'STORIES_FETCH_INIT' })

        const result = await axios.get(url)
        try{
            dispatchStories({
                type: 'STORIES_FETCH_SUCCESS',
                payload: result.data.hits
            })
        } catch {
            dispatchStories({
                type: 'STORIES_FETCH_FAILURE'
            })
        }
        
    }, [url])

    React.useEffect(() => {
        handleFetchStories()
    }, [handleFetchStories])

    const handleRemoveStory = React.useCallback((item: Story) => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item
        })
    }, [])

    const handleSeacrhInput = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }, [setSearchTerm])

    const handleSeacrhSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
        setUrl(`${API_ENDPOINT}${searchTerm}`)

        event.preventDefault()
    }, [searchTerm])
 
    const title = 'Маша'

    console.log('B:App')

    const sumComments = React.useMemo(() => getSumComments(stories), [
        stories,
    ]) 
  
    return ( 
        <div className='container'> 
            <h1 className='headline-primary'>Hello, {title}, {stories.isLoading ? (<span>i'm thinking...</span>) : (<span>this thingy have {sumComments} comments</span>)}</h1> 
            <SearchForm 
                searchTerm={searchTerm}
                onSearchInput={handleSeacrhInput}
                onSearchSubmit={handleSeacrhSubmit}
            />

            {stories.isError && <p>Something went wrong...</p>}

            {stories.isLoading ? (
                <p>Loading...</p>
            ) : (
                <List 
                list={stories.data} 
                onRemoveItem={handleRemoveStory}/>
            )}

            
        </div> 
    ); 
    } 

const List = React.memo(
    ({ list, onRemoveItem }: ListProps) =>
    <>
        {list.map(item => (
            <Item 
                key={item.objectID} 
                item={item} 
                onRemoveItem={onRemoveItem}
            />
        ))}
    </>
    
)
const Item = React.memo(
    ({ 
        item, 
        onRemoveItem 
    }:  ItemProps ) => (
    <div key={item.objectID} className='item'>
        <span style={{width: '40%'}}>
            <a href={item.url}>{item.title}</a>
        </span> 
        <span style={{width: '30%'}}>{item.author}</span>
        <span style={{width: '10%'}}>{item.num_comments}</span>
        <span style={{width: '10%'}}>{item.points}</span>
        <span style={{width: '5%'}}>
            <button 
            type='button' 
            onClick={() => onRemoveItem(item)}
            className='button button-small'>
                {/*<Check height='18px' width='18px' />*/}
                Delete
            </button>
        </span>
    </div>
    )
)

const InputWithLabel = ({id, children, type = 'text', value, onInputChange}: InputWithLabelProps) => {


    return(
        <>
            <label htmlFor={id} className='label'>
            {children}
            </label>
            <input 
            id='search'
            type={type}
            value={value}
            onChange={onInputChange} 
            className='input'
            />
        </>
    )
}

const SearchForm = React.memo(({
    searchTerm,
    onSearchInput,
    onSearchSubmit
}: SearchFormProps) => (
    <form onSubmit={onSearchSubmit} className='search-form'>
        <InputWithLabel 
            id='search'
            value={searchTerm} 
            onInputChange={onSearchInput}
        >
            <strong>Search: </strong>
        </InputWithLabel>

        <button
            type='submit'
            disabled={!searchTerm}
            className='button button-large'
        >
            Submit
        </button>
    </form>
))


export default App;

