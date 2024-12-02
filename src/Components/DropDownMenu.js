import {React, useState} from 'react'
import { Dropdown } from 'flowbite-react';
import { CgProfile } from 'react-icons/cg';
import { MdCreate, MdLogout} from 'react-icons/md';

const DropDownMenu = () => {
    function onMouseDown(){
        document.getElementsByName('spanUser')[0].style.color = "blue";
    }

    function onMouseUp(){
        document.getElementsByName('spanUser')[0].style.color = "black";
    }
    return (    
        
        <div className='flex items-center my-8 mx-14'>
            <Dropdown label="" dismissOnClick={false} renderTrigger={() => <svg class="w-8 h-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M1,4 H18 V6 H1 V4 M1,9 H18 V11 H1 V7 M3,14 H18 V16 H1 V14"/>
            </svg>}>
                <Dropdown.Item icon={CgProfile}>Profile</Dropdown.Item>
                <Dropdown.Item icon={MdCreate}>Create new group</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item icon={MdLogout} as="Button">Sign out</Dropdown.Item>
            </Dropdown>
        </div>
        
    )
};

export default DropDownMenu;