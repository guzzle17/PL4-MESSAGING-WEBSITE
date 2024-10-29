import {React, useState} from 'react'
import './DropDownMenu.css'

const DropDownMenu = () => {
    function onMouseDown(){
        document.getElementsByName('spanUser')[0].style.color = "blue";
    }

    function onMouseUp(){
        document.getElementsByName('spanUser')[0].style.color = "black";
    }
    return (
        <div className="DropDownButton" onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
            <span name='spanUser' className='UserMenu'>☰</span>
        </div>
    )
};

export default DropDownMenu;