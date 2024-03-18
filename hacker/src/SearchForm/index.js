import React from "react";
import InputWithLabel from '../InputWithLabel/index.js'

const SearchForm = React.memo(({
    searchTerm,
    onSearchInput,
    onSearchSubmit
}) => (
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

export default SearchForm