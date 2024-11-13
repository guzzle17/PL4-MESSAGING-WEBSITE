import React, { useState } from 'react';
import Input from '../../Components/Input';
import Button from '../../Components/Button';
import backgroundIMG from '../../Assets/26030.jpg';
import { useNavigate } from 'react-router';

const Form = ({ isSignInPage = true }) => {
    const [data, setData] = useState({
        ...(!isSignInPage && { fullName: '' }),
        email: '',
        password: ''
    });
    const [error, setError] = useState(''); // Trạng thái để lưu thông báo lỗi
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('data >>', data);
    
        try {
            const res = await fetch(`http://localhost:8000/api/${isSignInPage ? 'login' : 'register'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
    
            if (res.status === 400) {
                setError((isSignInPage ? "User email or password is incorrect" : "User already exists"));
                return;
            }
    
    
            const resData = await res.json();
            console.log('data >>', resData);
    
            if (resData.token) {
                localStorage.setItem('user:token', resData.token);
                localStorage.setItem('user:detail', JSON.stringify(resData.user));
                navigate('/');
            } else {
                console.log('Error:', resData);
                alert(resData.message || 'An unexpected error occurred.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Failed to connect to the server. Please check your network connection.');
        }
    };

    return (
        <div className="bg-[#e1edff] h-screen flex justify-center items-center" 
             style={{ backgroundImage: `url(${backgroundIMG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className='bg-white bg-opacity-90 w-[400px] h-auto p-8 shadow-2xl rounded-lg flex flex-col items-center gap-4'>
                <div className='text-4xl font-bold text-center text-gray-800'>
                    Welcome {isSignInPage && 'Back'} <br /> To Our PBL4 <br /> Messaging Website 
                </div>
                <div className='text-lg font-light text-gray-600'>
                    {isSignInPage ? 'Sign in to continue' : 'Sign up now to get started'}
                </div>
                {error && ( // Hiển thị pop-up lỗi nếu có lỗi
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full mb-4 text-center" role="alert">
                        <strong className="font-bold">Error:</strong> <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form className='flex flex-col items-center w-full ml-6' onSubmit={handleSubmit}>
                    {!isSignInPage && (
                        <Input 
                            label="Full name" 
                            name="name" 
                            placeholder='Enter your full name' 
                            className='mb-6 w-full'
                            value={data.fullName} 
                            onChange={(e) => setData({ ...data, fullName: e.target.value })}
                        />
                    )}
                    <Input 
                        label="Email address" 
                        type='email' 
                        name="email" 
                        placeholder='Enter your email' 
                        className='mb-6 w-full'
                        value={data.email} 
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                    <Input 
                        label="Password" 
                        name="password" 
                        type='password' 
                        placeholder='Enter your password' 
                        className='mb-6 w-full'
                        value={data.password} 
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                    />
                    <Button 
                        label={isSignInPage ? 'Sign in' : 'Sign up'} 
                        className='w-[75%] py-2 rounded-md bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition duration-300 mr-10' 
                        type='submit'
                    />   
                </form>
                <div className="text-gray-600 mt-4">
                    {isSignInPage ? "Don't have an account? " : 'Already have an account? '}
                    <span 
                        className='text-blue-500 font-medium cursor-pointer underline hover:text-blue-700'
                        onClick={() => {
                            navigate(`/users/${isSignInPage ? 'sign_up' : 'sign_in'}`)
                            setError("")
                        }}
                    >
                        Sign {isSignInPage ? 'up' : 'in'}
                    </span>
                </div>
            </div> 
        </div>
    );
};

export default Form;
