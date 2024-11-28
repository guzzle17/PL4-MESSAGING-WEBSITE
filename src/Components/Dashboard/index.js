import React, { useEffect, useState, useRef } from 'react'
import userDefault from '../../Assets/userDefault.png'
import Input from '../Input'
import {io} from 'socket.io-client'

const Dashboard = () => {
	const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')))
	const [conversations, setConversations] = useState([])
	const [messages, setMessages] = useState(["", "", ""])
	const [message, setMessage] = useState('')
	const [users, setUsers] = useState([])
	const [socket, setSocket] = useState(null)
	const messageRef = useRef(null)

	const [file, setFile] = useState(null);

	const [previewUrl, setPreviewUrl] = useState(null);

	const handleFileSelect = (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
		  setFile(selectedFile);
	  
		  // Generate a preview URL if the file is an image
		  if (selectedFile.type.startsWith('image/')) {
			const url = URL.createObjectURL(selectedFile);
			setPreviewUrl(url);
		  } else {
			setPreviewUrl(null); // No preview for non-image files
		  }
		}
	  };

	useEffect(() => {
		setSocket(io('http://localhost:8080'))
	}, [])

	useEffect(() => {
		socket?.emit('addUser', user?.id);
		socket?.on('getUsers', users => {
			console.log('activeUsers :>> ', users);
		})
		socket?.on('getMessage', (data) => {
			setMessages((prev) => ({
				...prev,
				messages: [
					...prev.messages,
					{
						user: data.user,
						message: data.message,
						type: data.type,
						file_url: data.file_url,
					},
				],
			}));
		});
	}, [socket])

	useEffect(() => {
		messageRef?.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages?.messages])

	useEffect(() => {
		const loggedInUser = JSON.parse(localStorage.getItem('user:detail'))
		const fetchConversations = async () => {
			const res = await fetch(`http://localhost:8000/api/conversations/${loggedInUser?.id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				}
			});
			const resData = await res.json()
			setConversations(resData)
		}
		fetchConversations()
	}, [])

	useEffect(() => {
		const fetchUsers = async () => {
			const res = await fetch(`http://localhost:8000/api/users/${user?.id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				}
			});
			const resData = await res.json()
			setUsers(resData)
		}
		fetchUsers()
	}, [])

	const fetchMessages = async (conversationId, receiver) => {
		const res = await fetch(`http://localhost:8000/api/message/${conversationId}?senderId=${user?.id}&&receiverId=${receiver?.receiverId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		const resData = await res.json()
		//resData: { user: { id: user._id, email: user.email, fullName: user.fullName }, message: message.message, type: message.type, file_url: message.file_url }
		setMessages({ messages: resData, receiver, conversationId }) 
	}

	const sendMessage = async () => {
		if (!message && !file) {
			// Không gửi nếu không có nội dung và không có tệp
			return;
		}
	
		const formData = new FormData();
		formData.append('conversationId', messages?.conversationId);
		formData.append('senderId', user?.id);
		formData.append('receiverId', messages?.receiver?.receiverId);
	
		if (message) {
			formData.append('message', message);
		}
	
		if (file) {
			formData.append('file', file);
		}
	
		const res = await fetch(`http://localhost:8000/api/message`, {
			method: 'POST',
			body: formData,
		});
	
		const data = await res.json();
		// console.log(data.message.type);
		// console.log(data.message.file_url);
		if (res.ok) {
			// Gửi tin nhắn qua socket
			socket?.emit('sendMessage', {
				senderId: user?.id,
				receiverId: messages?.receiver?.receiverId,
				message: data.message.message,
				conversationId: messages?.conversationId,
				type: data.message.type,
				file_url: data.message.file_url,
			});
		} else {
			console.error('Failed to send message');
		}
	
		// Reset state
		setMessage('');
		setFile(null);
	};
	
	  
	return (
		<div className='w-screen flex'>
			<div className='w-[25%] h-screen bg-secondary overflow-scroll'>
				<div className='flex items-center my-8 mx-14'>
					<div><img src={userDefault} width={75} height={75} className='border border-primary p-[2px] rounded-full' /></div>
					<div className='ml-8'>
						<h3 className='text-2xl'>{user?.fullName}</h3>
						<p className='text-lg font-light'>My Account</p>
					</div>
				</div>
				<hr />
				<div className='mx-14 mt-10'>
					<div className='text-primary text-lg'>Messages</div>
					<div>
						{
							conversations.length > 0 ?
								conversations.map(({ conversationId, user }) => {
									return (
										<div className='flex items-center py-8 border-b border-b-gray-300'>
											<div className='cursor-pointer flex items-center' onClick={() => fetchMessages(conversationId, user)}>
												<div><img src={userDefault} className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary" /></div>
												<div className='ml-6'>
													<h3 className='text-lg font-semibold'>{user?.fullName}</h3>
													<p className='text-sm font-light text-gray-600'>{user?.email}</p>
												</div>
											</div>
										</div>
									)
								}) : <div className='text-center text-lg font-semibold mt-24'>No Conversations</div>
						}
					</div>
				</div>
			</div>
			<div className='w-[50%] h-screen bg-white flex flex-col items-center'>
				{
					messages?.receiver?.fullName &&
					<div className='w-[75%] bg-secondary h-[80px] my-14 rounded-full flex items-center px-14 py-2'>
						<div className='cursor-pointer'><img src={userDefault} width={60} height={60} className="rounded-full" /></div>
						<div className='ml-6 mr-auto'>
							<h3 className='text-lg'>{messages?.receiver?.fullName}</h3>
							<p className='text-sm font-light text-gray-600'>{messages?.receiver?.email}</p>
						</div>
						<div className='cursor-pointer'>
							<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-phone-outgoing" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path stroke="none" d="M0 0h24v24H0z" fill="none" />
								<path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
								<line x1="15" y1="9" x2="20" y2="4" />
								<polyline points="16 4 20 4 20 8" />
							</svg>
						</div>
					</div>
				}
				<div className='h-[75%] w-full overflow-scroll shadow-sm'>
					<div className='p-14'>
						{
							messages?.messages?.length > 0 ? (
								messages.messages.map(({ message, type, file_url, user: { id } = {} }, index) => (
									<div key={index} className={`max-w-[40%] rounded-b-xl p-4 mb-6 w-fit break-words ${id === user?.id ? 'bg-primary text-white rounded-tl-xl ml-auto' : 'bg-secondary rounded-tr-xl'}`}>
										{message && <p className = {`mb-2`}>{message}</p>}
										{type === 'image' && <img src={`http://localhost:8000${file_url}`} alt="Image" className="max-w-full rounded" />}
										{type === 'file' && (
											<a href={`http://localhost:8000${file_url}`} target="_blank" rel="noopener noreferrer" className="text-white-600 underline">
												{file_url.substring(8)}
											</a>
										)}
										{<div ref={messageRef}></div>}
									</div>
								))
							) : (
								<div className='text-center text-lg font-semibold mt-24'>No Messages or No Conversation Selected</div>
							)
						}
					</div>
				</div>

				{
					messages?.receiver?.fullName &&
					<div className='p-14 w-full flex items-center'>
						<Input placeholder='Type a message...' value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => {         if (e.key === 'Enter') {           sendMessage();       }       }} className='w-[100%]' inputClassName='p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none w-[99%]' />
						<div className={`ml-4 p-2 cursor-pointer bg-light rounded-full ${(!message && !file) && 'pointer-events-none'}`} onClick={() => sendMessage()}>
							<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-send" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path stroke="none" d="M0 0h24v24H0z" fill="none" />
								<line x1="10" y1="14" x2="21" y2="3" />
								<path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
							</svg>
						</div>
						<div className='ml-4 p-2 cursor-pointer bg-light rounded-full'>
							<input
							type='file'
							id='fileInput'
							className='hidden'
							onChange={handleFileSelect}
							/>
							<label htmlFor='fileInput' className='cursor-pointer'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='icon icon-tabler icon-tabler-circle-plus'
								width='30'
								height='30'
								viewBox='0 0 24 24'
								strokeWidth='1.5'
								stroke='#2c3e50'
								fill='none'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path stroke='none' d='M0 0h24v24H0z' fill='none' />
								<circle cx='12' cy='12' r='9' />
								<line x1='9' y1='12' x2='15' y2='12' />
								<line x1='12' y1='9' x2='12' y2='15' />
							</svg>
							</label>
						</div>
						{file && (
							<div className='mt-4 flex items-center'>
								{previewUrl ? (
								<div className='relative'>
									<img
									src={previewUrl}
									alt='Selected'
									className='w-32 h-32 object-cover rounded'
									/>
									<button
									onClick={() => {
										setFile(null);
										setPreviewUrl(null);
									}}
									className='absolute top-0 right-0 bg-gray-800 text-white rounded-full p-1'
									>
									&times;
									</button>
								</div>
								) : (
								<div className='flex items-center'>
									<span className='mr-2'>{file.name}</span>
									<button
									onClick={() => setFile(null)}
									className='bg-gray-800 text-white rounded-full p-1'
									>
									&times;
									</button>
								</div>
								)}
							</div>
							)}
					</div>
				}
			</div>
			<div className='w-[25%] h-screen bg-light px-8 py-16 overflow-scroll'>
				<div className='text-primary text-lg'>People</div>
				<div>
					{
						users.length > 0 ?
							users.map(({ userId, user }) => {
								return (
									<div className='flex items-center py-8 border-b border-b-gray-300'>
										<div className='cursor-pointer flex items-center' onClick={() => fetchMessages('new', user)}>
											<div><img src={userDefault} className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary" /></div>
											<div className='ml-6'>
												<h3 className='text-lg font-semibold'>{user?.fullName}</h3>
												<p className='text-sm font-light text-gray-600'>{user?.email}</p>
											</div>
										</div>
									</div>
								)
							}) : <div className='text-center text-lg font-semibold mt-24'>No Conversations</div>
					}
				</div>
			</div>
		</div>
	)
}

export default Dashboard