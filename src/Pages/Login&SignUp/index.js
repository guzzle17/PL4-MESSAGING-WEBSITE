import React, { useState } from 'react';
import Input from '../../Components/Input';
import Button from '../../Components/Button';
import backgroundIMG from '../../Assets/26030.jpg'
const Form = () => {
    const [isSignInPage, setIsSignInPage] = useState(true); 

    const [data, setData] = useState({
        ...(!isSignInPage && {
            fullName:''
            }),
            email:'',
            password: ''
    })
    // console.log('data: >>', data);
    return (
        <div className="bg-[#e1edff] h-screen flex justify-center items-center" style={{ backgroundImage: `url(${backgroundIMG})`, backgroundSize: 'cover' }}>
            <div className='bg-secondary bg-opacity-75 w-[400px] h-[600px] shadow-lg rounded-lg flex flex-col justify-center items-center gap-2 ml-[500px]'>
                <div className='text-4xl font-extrabold'>Welcome {isSignInPage && 'Back'} </div>
                <div className='text-xl font-light mb-10'>{isSignInPage?'Sign in to continue':'Sign up now to get started'}</div>
                <form className='flex flex-col items-center w-full' onSubmit={() => console.log("submitted")}>
                    {!isSignInPage && <Input label="Full name" name="name" placeholder='Enter your full name' className='mb-10'
                    value={data.fullName} onChange={(e) => setData({...data, fullName: e.target.value})}/>}
                    <Input label="Email address" type='email' name="email" placeholder='Enter your email'className='mb-10'
                    value={data.email} onChange={(e) => setData({...data, email: e.target.value})}/>
                    <Input label="Password" name="password" type='password' placeholder='Enter your password' className='mb-10'
                    value={data.password} onChange={(e) => setData({...data, password: e.target.value})}/>
                    <Button label={isSignInPage?'Sign in':'Sign up'} className='w-1/2' type='submit'/>   
                </form>
                <div>{isSignInPage?"Didn't have an account? ":'Already have an account? '} <span className='text-primary cursor-pointer underline' onClick={() => setIsSignInPage(!isSignInPage)}>Sign {isSignInPage?'up':'in'}</span></div>
            </div> 
        </div>
    );
};

export default Form;
