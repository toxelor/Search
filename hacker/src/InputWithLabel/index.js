import React from "react";

const InputWithLabel = ({id, children, type = 'text', value, onInputChange}) => {
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

export default InputWithLabel