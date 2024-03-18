import React from "react";
import { ReactComponent as Check } from '../logo.svg'
import { sortBy } from 'lodash'

const List = ({ list, onRemoveItem }) => {
    const [sort, setSort] = React.useState({
        sortKey: 'NONE',
        isReverse: false,
    })
    
    const [title, author, comment, point] = document.getElementsByClassName('sort-button')

    const SORTS = {
        NONE: list => list,
        TITLE: list => sortBy(list, 'title'),
        AUTHOR: list => sortBy(list, 'author'),
        COMMENT: list => sortBy(list, 'num_comments').reverse(),
        POINT: list => sortBy(list, 'points').reverse(),
    }

    const handleSort = (sortKey, button, buttons) => {
        const isReverse = sort.sortKey === sortKey && !sort.isReverse
        setSort({sortKey, isReverse})
        button.style.background = '#171212'
        button.style.color = '#ffffff'
        const add = isReverse ? '▲' : '▼'
        button.textContent = button.textContent.replace('▲', '').replace('▼', '') + add
        for (let i = 0; i < 3; i++){
            buttons[i].setAttribute('style', 'transparent')
            buttons[i].textContent = buttons[i].textContent.replace('▲', '').replace('▼', '')
        }
        
    }

    const sortFunction = SORTS[sort.sortKey];
    const sortedList = sort.isReverse
    ? sortFunction(list).reverse()
    : sortFunction(list)
    
    return(
    <div> 
        <div className="sorting" style={{ display: 'flex' }}> 
            <span style={{width: '39.5%'}}>
                <button 
                className='button button-small sort-button' 
                type="button"
                onClick={() => {
                        handleSort('TITLE', title, [author, comment, point])
                    }}>
                    Title
                </button>    
            </span> 
            <span style={{width: '29.7%'}}>
                <button 
                className='button button-small sort-button' 
                type="button"

                onClick={() => {
                    handleSort('AUTHOR', author, [title, comment, point])
                    }}>
                    Author
                </button>
            </span> 
            <span style={{width: '10.2%'}}>
                <button 
                className='button button-small sort-button' 
                type="button"

                onClick={() => {
                    handleSort('COMMENT', comment, [author, title, point])
                    }}>
                    Comments
                </button>
            </span> 
            <span style={{width: '10%'}}>
                <button 
                className='button button-small sort-button' 
                type="button"

                onClick={() => {
                    handleSort('POINT', point, [author, comment, author])
                    }}>
                    Points
                </button>
            </span> 
        </div> 
        {sortedList.map(item => ( 
            <Item 
            key={item.objectID} 
            item={item} 
            onRemoveItem={onRemoveItem} 
            /> 
        ))} 
    </div> 
    )
};

const Item =
    ({ item, onRemoveItem }) => {

    return(
    <div key={item.objectID} className='item'>
        <span style={{ width: '40%'}}>
            <a href={item.url}>{item.title}</a>
        </span> 
        <span style={{width: '30%'}}>{item.author}</span>
        <span style={{width: '10%'}}>{item.num_comments}</span>
        <span style={{width: '18%'}}>{item.points}</span>
        
        <span style={{width: '2.17%'}}>
            <button 
            type='button' 
            onClick={() => onRemoveItem(item)}
            className='button button-small button-icon' >
                <Check height='18px' width='18px' />
            </button>
        </span>
    </div>
    )
}

export default List;