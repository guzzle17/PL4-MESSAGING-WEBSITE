import {React, useState} from 'react'
import './MessageView.css'
import placeholder_avatar from '../Assets/placeholder_avatar.jpg'
import InputMenu from './InputMenu'

const MessageView = () => {
    return (
        <div className='MessageView'>
            <div className='ContactStatus'>
                <img src={placeholder_avatar} className='ImageStatus' />
                <p className='NameStatus'><b>Contact Name Here</b></p>
                <p className='StatusStatus'>Status Here</p>
            </div>
            <div className='ChatArea'>
                Messages Here
            </div>
            <div className='InputArea'>
                <InputMenu />
                <input type='text' name='messageinput' className='InputText'/>
                <input type='button' name='sendbutton' className='SendButton' value={''}/>
            </div>
        </div>
        
    )
}

export default MessageView;