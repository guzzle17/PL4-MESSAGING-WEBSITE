import {React, useState} from 'react'
import './InputMenu.css'

const InputMenu = () => {
    function onMouseDown(){
        document.getElementsByName('spanInput')[0].style.color = "black";
    }

    function onMouseUp(){
        document.getElementsByName('spanInput')[0].style.color = "grey";
    }
    return (
        <div className="InputButton" onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
            <span name='spanInput' className='InputMenu'>+</span>
        </div>
    )
};

export default InputMenu;