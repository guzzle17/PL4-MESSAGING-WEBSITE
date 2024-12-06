import React, { useEffect, useState, useRef } from 'react'
import userDefault from '../../Assets/userDefault.png'
import Input from '../Input'
import {io} from 'socket.io-client'
import { Dropdown, DropdownHeader, DarkThemeToggle, Flowbite, Avatar } from 'flowbite-react'
import { CgProfile } from 'react-icons/cg'
import { MdCreate, MdLogout} from 'react-icons/md'
import { useNavigate } from 'react-router'
import placeholder_avatar from '../../Assets/placeholder_avatar.jpg'
import ConversationDetails from '../ConversationDetails'

const Dashboard = () => {
	const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')))
	const [conversations, setConversations] = useState([])
	const [messages, setMessages] = useState(["", "", ""])
	const [message, setMessage] = useState('')
	const [users, setUsers] = useState([])
	const [socket, setSocket] = useState(null)
	const messageRef = useRef(null)
	// zoom img
	const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState('');
	const navigate = useNavigate();

    const openModal = (imageUrl) => {
        setCurrentImage(imageUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

	//end zoom img

	const [file, setFile] = useState(null);

	const [previewUrl, setPreviewUrl] = useState(null);


	/* add group*/	
	const [filteredUsers, setFilteredUsers] = useState([]); // Dữ liệu đã lọc
	const [searchQuery, setSearchQuery] = useState(''); // Giá trị tìm kiếm
	const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
	const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
	// Lấy danh sách người dùng từ API
	// useEffect(() => {
	// 	const fetchUsers = async () => {
	// 		const res = await fetch(`http://localhost:8000/api/users/${user?.id}`, {
	// 			method: 'GET',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 			},
	// 		});
	// 		const resData = await res.json();

	// 		// Cập nhật state
	// 		setUsers(resData); 
	// 		setFilteredUsers(resData); // Hiển thị toàn bộ lúc đầu
	// 	};
	// 	fetchUsers();
	// }, [user]);

	// Xử lý tìm kiếm
	useEffect(() => {
		if (searchQuery) {
			
			const filtered = users.filter((u) => 
				u.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
			);			
			console.log("check full Name", users, filtered	)
			const usersList = filtered.map((item) => item.user);
        	setFilteredUsers(usersList);
			// setFilteredUsers(filtered);
		} else {
			const usersList = users.map((item) => item.user);
        	setFilteredUsers(usersList);
			// setFilteredUsers(users);
			// console.log("a", users)
		}
	}, [searchQuery, users]);

	const [selectedMembers, setSelectedMembers] = useState([]); // Danh sách thành viên đã chọn

	const handleToggleMember = (member) => {
		if (selectedMembers.includes(member)) {
			setSelectedMembers(selectedMembers.filter((m) => m !== member));
		} else {
			setSelectedMembers([...selectedMembers, member]);
		}
	};


	
	const handleCreateGroup = async () => {
		console.log("selected memebers: ", selectedMembers)
		if (!selectedMembers || selectedMembers.length === 0) {
			alert('Vui lòng chọn ít nhất một thành viên.');
			return;
		}
	
		try {
			const response = await fetch('http://localhost:8000/api/conversation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					senderId: user?.id,
					receiverId: selectedMembers.map((m) => m.receiverId),
					isGroup: true,
					groupName: "Nhóm của tôi", // Tên nhóm mặc định
				}),
			});
	
			if (response.ok) {
				const newGroup = await response.json();
				alert('Nhóm đã được tạo thành công!');
				
				// Cập nhật danh sách hội thoại
				setConversations([...conversations, newGroup]);
				
				// Reset trạng thái modal và danh sách
				setShowCreateGroupModal(false);
				setSelectedMembers([]);
				setSearchQuery('');
			} else {
				const error = await response.json();
				console.error('Failed to create group:', error.message);
				alert('Đã xảy ra lỗi khi tạo nhóm. Vui lòng thử lại.');
			}
		} catch (err) {
			console.error('Error creating group:', err);
			alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
		}
	};
	

	const handleLogout = () => {
		localStorage.removeItem('user');
		navigate('/users/sign_in');
	}

	function toggleHidePassword() {
		let toggle_button = document.getElementById('toggle-hide-password1')
		let password_input = document.getElementById('changePassword')
	
		if (password_input.type === 'password') {
			password_input.type = 'text'
			document.getElementById('confirmOldPassword').type = 'text'
			toggle_button.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="15" height="15">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
			</svg>`
		} else {
			password_input.type = 'password'
			document.getElementById('confirmOldPassword').type = 'password'
			toggle_button.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="15" height="15">
				<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>`
		}
		document.getElementById('toggle-hide-password2').innerHTML = toggle_button.innerHTML
	}

	const handleChooseUpdateAvatar = (e) => {
		const selectedImage = e.target.files[0];
		if (selectedImage){
			let updateProfileAvatar = document.getElementById('updateProfileAvatar');
			updateProfileAvatar.src = URL.createObjectURL(selectedImage);
		}
	};

	const handleUpdateProfile = async (e) => {
		e.preventDefault();
		const formData = {
			email: e.target.email.value,
			name: e.target.name.value,
			oldPassword: e.target.confirmOldPassword.value,
			newPassword: e.target.changePassword.value
		};
		const serializedBody = JSON.stringify(formData);

		const res = await fetch('http://localhost:8000/api/updateProfile', {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
			},
			body: serializedBody
		});

		const resData = await res.json();    
		if (resData.user) {
			localStorage.setItem('user:detail', JSON.stringify(resData.user));
			navigate(0);
		} else {
			console.log('Error:', resData);
			alert(resData.message || 'An unexpected error occurred.');
		}
	};



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
		const loggedInUser = JSON.parse(localStorage.getItem('user:detail'));
	
		const fetchConversations = async () => {
			const res = await fetch(`http://localhost:8000/api/conversations/${loggedInUser?.id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const resData = await res.json();
	
			// Kiểm tra dữ liệu trả về
			console.log('Conversations:', resData);
	
			setConversations(resData);
		};
	
		fetchConversations();
	}, []);
	

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

			const usersList = resData.map((item) => item.user);
        	setFilteredUsers(usersList);// Hiển thị toàn bộ lúc đầu
			console.log(resData);
			console.log(users);
		}
		fetchUsers()
	}, [])

	const fetchMessages = async (conversationId, members, nameConversation, discription, isGroup) => {
		const res = await fetch(`http://localhost:8000/api/message/${conversationId}?senderId=${user?.id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		const resData = await res.json()
		//resData: { user: { id: user._id, email: user.email, fullName: user.fullName }, message: message.message, type: message.type, file_url: message.file_url }
		setMessages({ messages: resData, members, conversationId, nameConversation, discription, isGroup }) 
		console.log("messages: ", messages);
	}

	const sendMessage = async () => {
		if (!message && !file) {
			// Không gửi nếu không có nội dung và không có tệp
			return;
		}
	
		const formData = new FormData();
		formData.append('conversationId', messages?.conversationId);
		formData.append('senderId', user?.id);
	
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
				members : messages?.members.map(member => member._id),
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
		<Flowbite>
		<div className='w-screen flex'>
			<div className='w-[25%] h-screen bg-secondary overflow-auto'>
				<div className='flex items-center my-8 mx-14'>
					{/* Dropdown Menu */}
					<div className='mr-8'>
						<Dropdown label="" dismissOnClick={false} renderTrigger={() => <svg class="w-8 h-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
						<path d="M1,4 H18 V6 H1 V4 M1,9 H18 V11 H1 V7 M3,14 H18 V16 H1 V14"/>
						</svg>}>
							<DropdownHeader>
								<DarkThemeToggle />
							</DropdownHeader>
							<Dropdown.Item icon={CgProfile} as="button" onClick={() => setShowUpdateProfileModal(true)}>Profile</Dropdown.Item>
							<Dropdown.Item icon={MdCreate} as="button" onClick={() => {setShowCreateGroupModal(true); setSelectedMembers([])}}>Create new group</Dropdown.Item>
							<Dropdown.Divider />
							<Dropdown.Item icon={MdLogout}  as="button" onClick={handleLogout}>Sign out</Dropdown.Item>
						</Dropdown>
					</div>
					{/* Search Bar */}
					<div class="flex px-4 py-0.5 rounded-full border-2 border-gray-500 overflow-hidden max-w-md mx-auto font-[sans-serif]">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192.904 192.904" width="16px"
						class="fill-gray-600 mr-3 rotate-90">
						<path
							d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z">
						</path>
						</svg>
						<input type="search" placeholder="Search something..." class="w-full outline-none border-0 focus:ring-0 bg-transparent text-gray-600 text-sm" onChange={(e) => setSearchQuery(e.target.value)}/>
					</div>
					


					{/*  */}

					{showCreateGroupModal && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
							<div className="bg-white w-[500px] p-6 rounded shadow-lg">
								<h2 className="text-xl font-bold mb-4">Create new group</h2>
								<input
									type="text"
									placeholder="Tìm kiếm thành viên"
									className="w-full border p-2 rounded mb-4"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
								{(filteredUsers) && <div className="max-h-[300px] overflow-y-auto">
									{filteredUsers.map((user ) => (
										<div
											key={user.userId}
											className="flex items-center justify-between border-b p-2"
										>
											<div className="flex items-center">
												<img
													src={userDefault}
													className="w-10 h-10 rounded-full mr-2"
													alt="User"
												/>
												<div>
													<span className="block font-semibold">{user.fullName}</span>
													<span className="block text-sm text-gray-600">{user.email}</span>
												</div>
											</div>
											<button
												className="text-primary"
												onClick={() => handleToggleMember(user)}
											>
												{selectedMembers.includes(user) ? "Remove" : "Add"}
											</button>
										</div>
									))}
								</div>}

								<div className="mt-4 flex justify-end">
									<button
										className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
										onClick={() => setShowCreateGroupModal(false)}
									>
										Hủy
									</button>
									<button
										className="bg-primary text-white px-4 py-2 rounded"
										onClick={handleCreateGroup}
									>
										Create new group
									</button>
								</div>
							</div>
						</div>
					)}

					{/*  */}

					{showUpdateProfileModal && (<div tabindex="-1" aria-hidden="true" class="fixed overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 flex z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
					<div class="relative p-4 w-full max-w-xl max-h-full">
						{/* Modal content */}
						<div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
							{/* Modal header */}
							<div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
									User profile
								</h3>
								<button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setShowUpdateProfileModal(false)}>
									<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
										<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
									</svg>
									<span class="sr-only">Close modal</span>
								</button>
							</div>
							{/* Modal body */}
							<form class="p-4 md:p-5" onSubmit={handleUpdateProfile}>
								<div class="grid gap-4 mb-4 grid-cols-2">
									<div class="col-span-2">
										<label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
										<input type="text" name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter your name" defaultValue={user?user.fullName:""} required />
									</div>
									<div class="col-span-2">
										<label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
										<input type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter your email" defaultValue={user?user.email:""} required readOnly/>
									</div>
									<div class="col-span-2">
										<label for="confirmOldPassword" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm Old Password</label>
										<div class="relative">
											<input type="password" name="confirmOldPassword" id="confirmOldPassword" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter old password" />
											<button type="button" id="toggle-hide-password1" class="absolute inset-y-0 end-0 flex items-center cursor-pointer z-10 p-3.5" onClick={toggleHidePassword}>
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="15" height="15">
													<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
													<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
											</button>
										</div>
									</div>
									<div class="col-span-2">
										<label for="changePassword" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New password</label>
										<div class="relative">
											<input type="password" name="changePassword" id="changePassword" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter new password" />
											<button type="button" id="toggle-hide-password2" class="absolute inset-y-0 end-0 flex items-center cursor-pointer z-10 p-3.5" onClick={toggleHidePassword}>
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="15" height="15">
													<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
													<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
											</button>
										</div>
									</div>
									<div class="col-span-2">
										<label for="description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Avatar</label>
										<div class="flex justify-center">
											<img class="w-36 h-36 rounded-full flex" id="updateProfileAvatar" src={placeholder_avatar} />
											<div class="ml-10 self-center">
												<input class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="changeImageInputHelp" id="changeImageInput" type="file"  accept="image/*" onChange={handleChooseUpdateAvatar} />
												<p class="mt-1 text-sm text-gray-500 dark:text-gray-300" id="changeImageInputHelp">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
											</div>
											{/*<button type="button" class="text-white flex self-center max-h-max items-center ml-10 bg-blue-500 hover:bg-cyan-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-cyan-400 dark:hover:bg-cyan-700 dark:focus:ring-blue-800" onClick={null}>
												Change avatar
											</button>*/}
										</div>
									</div>
								</div>
								<button type="submit" class="text-white flex justify-self-center items-center mt-5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
									Save changes
								</button>
							</form>
						</div>
					</div>
				</div>
				)}

					{/*  */}

				</div>
				<hr />
				<div className='mx-14 mt-10'>
					<div className='text-primary text-lg'>Messages</div>
					<div>
    {searchQuery?(filteredUsers.length > 0?
		filteredUsers.map((user) => {
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
		):(conversations.length > 0 ? (
        conversations.map(({ conversationId, isGroup, nameConversation, discription, members }) => (
            <div
                key={conversationId}
                className="flex items-center py-8 border-b border-b-gray-300"
            >
                {isGroup ? (
                    // Hiển thị nhóm
                    <div
                        className="cursor-pointer flex items-center"
                        onClick={() => fetchMessages(conversationId, members, nameConversation, discription, isGroup)}
                    >
                        <div className="w-[60px] h-[60px] bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {nameConversation.charAt(0)}
                        </div>
                        <div className="ml-6">
                            <h3 className="text-lg font-semibold">{nameConversation}</h3>
                            <p className="text-sm font-light text-gray-600">
                                {discription}
                            </p>
                        </div>
                    </div>
                ) : (
                    // Hiển thị hội thoại cá nhân
                    <div
                        className="cursor-pointer flex items-center"
                        onClick={() => fetchMessages(conversationId, members, nameConversation, discription, isGroup)}
                    >
                        <img
                            src={userDefault}
                            className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary"
                            alt="User Avatar"
                        />
                        <div className="ml-6">
                            <h3 className="text-lg font-semibold">{nameConversation}</h3>
                            <p className="text-sm font-light text-gray-600">{discription}</p>
                        </div>
                    </div>
					)
                }
            </div>
        ))
    	) : (
        	<div className="text-center text-lg font-semibold mt-24">No Conversations</div>
    	))
	}
</div>

				</div>
			</div>
			<div className='w-[50%] h-screen bg-white flex flex-col items-center'>
				{
					messages?.nameConversation &&
					<div className='w-[75%] bg-secondary h-[80px] my-14 rounded-full flex items-center px-14 py-2'>
						<div className="cursor-pointer">
							{messages.isGroup ? (
								<div>
									<div className="w-[60px] h-[60px] bg-primary rounded-full flex items-center justify-center text-white font-bold">
										{messages.nameConversation?.charAt(0)}
									</div>
									{/* <div className="text-center mt-2">
										<p>{messages.nameConversation || "Nhóm của tôi"}</p>
										<p>{messages.members?.length || 0} thành viên</p>
									</div> */}
								</div>
							) : (
								<img
									src={userDefault}
									width={60}
									height={60}
									className="rounded-full"
									alt="User avatar"
								/>
							)}
						</div>


						<div className='ml-6 mr-auto'>
							<h3 className='text-lg'>{messages?.nameConversation}</h3>
							<p className='text-sm font-light text-gray-600'>{messages?.discription}</p>
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
				<div className='h-[75%] w-full overflow-auto shadow-sm'>
					<div className='p-14'>
						{
							messages?.messages?.length > 0 ? (
								messages.messages.map(({ message, type, file_url, user: { id } = {} }, index) => (
									<div key={index} className={`max-w-[40%] rounded-b-xl p-1 mb-6 w-fit break-words ${id === user?.id ? 'bg-primary text-white rounded-tl-xl ml-auto' : 'bg-secondary rounded-tr-xl'}`}>
										{message && <p className = {`ml-4 mr-4 mt-2 mb-2`}>{message}</p>}
										{type === 'image' && <img src={`http://localhost:8000${file_url}`} alt="Image" className="max-w-full rounded cursor-pointer" onClick={() => openModal(`http://localhost:8000${file_url}`)} />}
										{type === 'file' && (
											<a href={`http://localhost:8000${file_url}`} target="_blank" rel="noopener noreferrer" className="text-white-600 underline">
												{file_url.substring(8)}
											</a>
										)}
										{<div ref={messageRef}></div>}
										
										{isModalOpen && (
											<div
												className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 transition-opacity duration-300"
												onClick={closeModal}
											>
												{/* Nút đóng */}
												<button
													className="absolute top-5 right-5 text-white text-3xl cursor-pointer"
													onClick={closeModal}
												>
													&times;
												</button>
												{/* Ảnh phóng to */}
												<img
													src={currentImage}
													alt="Zoomed"
													className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
												/>
											</div>
										)}
									</div>
								))
							) : (
								<div className='text-center text-lg font-semibold mt-24'>No Messages or No Conversation Selected</div>
							)
						}
					</div>
				</div>

				{
					messages?.nameConversation &&
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
				{messages?.members? (
					<ConversationDetails members={messages.members} nameConversation={messages.nameConversation} description={messages.discription} isGroup={messages.isGroup} />
				) : (
				<div className='w-[25%] h-screen bg-light px-8 py-16 overflow-auto'>
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
				</div>)
				}
				
		</div>
		</Flowbite>
	)
}

export default Dashboard