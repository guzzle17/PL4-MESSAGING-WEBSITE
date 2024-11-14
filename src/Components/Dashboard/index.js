import React, { useEffect, useState } from 'react'
import userDefault from '../../Assets/userDefault.png'
import Input from '../Input'

const Dashboard = () => {
    
    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user:detail'));
    
        const fetchConversations = async () => {
            if (!loggedInUser || !loggedInUser.id) {
                console.error('User not logged in or missing user ID');
                return;
            }
    
            const res = await fetch(`http://localhost:8000/api/conversation/${loggedInUser.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            const resData = await res.json();
            console.log("resData >> ", resData[0]);
            setConversations(resData)
        };
    
        fetchConversations();
    }, []);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')))
    const [conversations, setConversations] = useState([])
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
          try {
            const userId = user?.id;
            if (!userId) {
              console.error('User ID is missing');
              return;
            }
      
            const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
      
            if (!response.ok) {
              console.error('Failed to fetch users:', response.status);
              return;
            }
      
            const data = await response.json();
            setUsers(data);
          } catch (error) {
            console.error('Error fetching users:', error);
          }
        };
      
        fetchUsers();
      }, []);
      

    const fetchMessages = async (conversationId, receiver) => {
        try {
          const senderId = user?.id;
          const receiverId = receiver?._id;
      
          if (!conversationId || !senderId || !receiverId) {
            console.error('Missing conversationId, senderId, or receiverId');
            return;
          }
      
          const url = `http://localhost:8000/api/message/${conversationId}?senderId=${senderId}&receiverId=${receiverId}`;
      
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
      
          if (!res.ok) {
            console.error('Failed to fetch messages:', res.status);
            return;
          }
      
          const resData = await res.json();
          console.log('resData:', resData);
      
          setMessages({ messages: resData, receiver, conversationId });
          console.log("Messages: ", messages);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      
    
    const sendMessage = async (e) => {
        e.preventDefault();
        console.log("check", messages.receiver, user?.id, message);

        if (!messages?.receiver?._id || !user?.id || !message) {
            console.error("Missing required fields: conversationId, senderId, message, or receiverId");
            return;
        }

        try {
            const res = await fetch('http://localhost:8000/api/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationId: messages?.conversationId,
                    senderId: user?.id,
                    message,
                    receiverId: messages?.receiver?._id,
                }),
            });

            if (!res.ok) {
                console.error("Failed to send message:", res.statusText);
                return;
            }

            // Clear the message input after successful send
            setMessage(''); // Set to empty string instead of an empty array
            console.log("mess :", message);
            // fetchMessages(messages.conversationId, messages.receiver)
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    
    

    return (
    <div className='w-screen h-[97vh] flex'>
        <div className='w-[25%] h-full bg-secondary'>
            <div className='flex justify-center items-center my-4'>
                <div className='border border-black p-[2px] rounded-full'><img src={userDefault} className='w-[75px] h-[75px]'/></div>
                <div className='ml-4'>
                    <h3 className='text-xl'>{user.fullName}</h3>
                    <p className='text-lg font-light'>My account</p>
                </div>
            </div>
            <hr/>
            <div className='ml-14 mt-2'>
                <div className='text-primary text-lg'>Messages</div>
                <div className='max-h-[calc(95vh-150px)] overflow-y-auto'>
                    {
                        conversations.length > 0 ? 
                        conversations.map(({conversationId, participants, otherUser, last_message }) => {
                            return(
                                <div className='flex items-center py-8 border-b border-b-gray-300'>
                                    <div className='cursor-pointer flex items-center' onClick={() =>
                                        fetchMessages(conversationId, otherUser)
                                    }>
                                    <div><img src={userDefault} width={40} height={65}/></div>
                                    <div className='ml-6'>
                                        <h3 className='font-semibold'>{(participants.length > 2 ? "Group Name" : otherUser.fullName)}</h3>
                                        <p className='font-light text-gray-600'>{(participants.length > 2 ? "group" : otherUser.email)}</p>
                                    </div>
                                    </div>
                                </div>
                            )
                        }) : <div className='text-center tex-lg font-semibold'> No conversations </div>
                    }
                </div>
            </div>
        </div>

        <div className='w-[50%] h-full bg-white flex flex-col items-center'>
            {
                messages.receiver == null ?  <div className='text-center tex-lg font-semibold mt-24'> No conversation selected </div> :
            
            <div className='w-[75%] bg-secondary h-[11.8%] mt-4 rounded-full flex items-center px-14'>
                    <div className='cursor-pointer'><img src={userDefault} width={60} height={60}/></div>
                    <div className='ml-6 mr-auto'>
                        <h3 className='text-lg'>{messages.receiver.fullName}</h3>
                        <p className='text-sm font-light text-gray-600'>{messages.receiver.email}</p>
                    </div>
                    <div className='cursor-pointer'>
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-phone-outgoing"
                        width={24} height={24} viewBox='0 0 24 24' stroke-width='1.5' stroke="black" fill = "none"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path stroke='none' d="M0 0h24v24H0z" fill='none'/>
                        <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"/>
                        <line x1="15" y1="9" x2="20" y2="4"/>
                        <polyline points = "16 4 20 4 20 8"/>
                        </svg>
                    </div>
            </div>
}
            <div className='h-full border w-full overflow-scroll'> 
                <div className='h-[1000px] px-10 py-14'>
                    {
                        messages?.messages?.length > 0 ?
                        messages.messages.map(({user: sender, message}) => {
                            // console.log("check", sender.id, user)
                            
                            if (sender.id === user.id) {
                                return (
                                    <div className="w-fit max-w-[45%] bg-primary rounded-b-xl rounded-tr-xl p-4 ml-auto text-white break-words mb-2">
                                        {message}
                                    </div>
                                )
                            }
                            else {  
                                return (
                                    <div className='w-fit max-w-[45%] bg-secondary rounded-b-xl rounded-tr-xl p-4 break-words mb-2'>
                                        {message}
                                     </div>
                                )
                            }
                        } 
                            
                         ) : messages.receiver != null && <div className='text-center tex-lg font-semibold mt-24'> No messages </div>
                    }
                </div>
            </div>
            {
                messages.receiver != null && <div className='p-15 flex w-full justify-center items-center'>
                <div className='mr-4 p-4 cursor-pointer '>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-circle-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M9 12h6" /><path d="M12 9v6" /></svg>
                </div>
                <Input placeholder='Type a message...' value={message} onChange={(e) => setMessage(e.target.value)} className='w-[70%]' inputClassName='p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none w-full'/>
                <div className={`ml-4 mt-4 p-4 cursor-pointer bg-light rounded-full ${!message && 'pointer-events-none'} `} onClick={(e) => sendMessage(e)}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  
                    stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-send"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 14l11 -11" />
                    <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" /></svg>
                </div>
            </div>
            }
            
        </div>
        
        <div className='w-[25%] h-full px-8 py-24'>
        <div className='text-primary text-lg'>People</div>
        {
            users.length > 0 ? 
            users.map((user) => {
                return(
                    <div className='flex items-center py-8 border-b border-b-gray-300'>
                        <div className='cursor-pointer flex items-center' onClick={() =>
                            fetchMessages("new", user)
                        }>
                        <div><img src={userDefault} width={40} height={65}/></div>
                        <div className='ml-6'>
                            <h3 className='font-semibold'>{user.fullName}</h3>
                            <p className='font-light text-gray-600'>{user.email}</p>
                        </div>
                        </div>
                    </div>
                )
            }) : <div className='text-center tex-lg font-semibold'> No more users </div>
        }
        </div>
    </div>
  )
}

export default Dashboard