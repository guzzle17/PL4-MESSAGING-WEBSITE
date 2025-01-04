import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router';
import { Flowbite } from 'flowbite-react';

import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import RightPanel from './RightPanel';

import CreateGroupModal from './CreateGroupModal';
import UpdateProfileModal from './UpdateProfileModal';
import AddMembersModal from './AddMembersModal';

import userDefault from '../../Assets/userDefault.png';
import placeholder_avatar from '../../Assets/placeholder_avatar.jpg';

export default function Dashboard() {
  const navigate = useNavigate();

  // ------------------ STATES ------------------
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')));
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({}); 
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  
  const [socket, setSocket] = useState(null);
  const messageRef = useRef(null);

  // Quản lý hiển thị modal:
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);

  // Tạo nhóm:
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Thêm thành viên:
  const [addMemberQuery, setAddMemberQuery] = useState('');
  const [filteredAddMembers, setFilteredAddMembers] = useState([]);

  // Chỉnh sửa group:
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Upload file
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  //
  const [filteredGroups, setFilteredGroups] = useState([])

  // ------------------ USE EFFECTS ------------------
  // Kết nối socket
  useEffect(() => {
    const newSocket = io('http://localhost:8000'); 
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Lắng nghe socket
  useEffect(() => {
    if (!socket) return;

    // Khi user join
    socket.emit('addUser', user?.id);

    // Lấy danh sách user đang online
    socket.on('getUsers', (users) => {
      console.log('activeUsers :>> ', users);
    });

    // Lắng nghe tin nhắn
    socket.on('getMessage', (data) => {
      if (data.conversationId === currentConversation?.conversationId)
        setMessages((prev) => ({
          ...prev,
          messages: [
            ...(prev.messages || []),
            {
              user: data.user,
              message: data.message,
              type: data.type,
              file_url: data.file_url,
            },
          ],
        }));
    });


    return () => {
      socket.off('getMessage');
      socket.off('getUsers');
    };
  }, [socket, currentConversation]);

  // Auto-scroll mỗi khi có tin nhắn mới
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Lấy danh sách conversation
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      try {
        const res = await fetch(`http://localhost:8000/api/conversation/${user.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const resData = await res.json();
        console.log('Conversations:', resData);
        setConversations(resData);
      } catch (error) {
        console.error('fetchConversations error:', error);
      }
    };
    fetchConversations();
  }, [user]);

  // Lấy danh sách users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const res = await fetch(`http://localhost:8000/api/users/${user.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const resData = await res.json();
        setUsers(resData);

        // Phục vụ cho tìm kiếm tạo group
        const usersList = resData.map((item) => item.user);
        setFilteredUsers(usersList);
      } catch (error) {
        console.error('fetchUsers error:', error);
      }
    };
    fetchUsers();
  }, [user]);

  // Xử lý tìm kiếm người dùng để tạo group
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter((u) =>
        u.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const usersList = filtered.map((item) => item.user);
      setFilteredUsers(usersList);
    } else {
      const usersList = users.map((item) => item.user);
      setFilteredUsers(usersList);
    }
  }, [searchQuery, users]);

  // Xử lý tìm kiếm nhóm
  useEffect(() => {
    if (searchQuery) {
      const filtered = conversations.filter((c) =>
        c.nameConversation.toLowerCase().includes(searchQuery.toLowerCase())
      )
      const filteredGroup = filtered.filter(c => c.isGroup)
      const groupList = filteredGroup.map(i => i);
      setFilteredGroups(groupList)
    }
    else {
      const filtered = conversations.filter(c => c.isGroup)
      const groupList = filtered.map(i => i);
      setFilteredGroups(groupList)
    }
  }, [searchQuery, conversations])

  // Xử lý tìm kiếm add member (showAddMembersModal)
  useEffect(() => {
    if (addMemberQuery) {
      const filtered = users.filter(
        (u) =>
          u.user.fullName.toLowerCase().includes(addMemberQuery.toLowerCase()) &&
          !messages?.members?.some((member) => member._id === u.user.receiverId)
      );
      setFilteredAddMembers(filtered.map((u) => u.user));
    } else {
      setFilteredAddMembers(
        users
          .filter((u) => !messages?.members?.some((member) => member._id === u.user.receiverId))
          .map((u) => u.user)
      );
    }
  }, [addMemberQuery, users, messages?.members]);

  // ------------------ HÀM XỬ LÝ ------------------

  // Hàm tìm hội thoại cá nhân
  const findConversation = async (members, nameConversation, discription, isGroup, avatar) => {
    const conversation = conversations.find(conversation => {
      if (conversation.nameConversation === nameConversation && !conversation.isGroup && conversation.members[0]._id === members[0]._id)
        return conversation
    })
    if (conversation != null)
      fetchMessages(conversation.conversationId, members, nameConversation, discription, isGroup, avatar)
    else fetchMessages('new', members, nameConversation, discription, isGroup, avatar)
	}

  // Hàm load tin nhắn một conversation
  const fetchMessages = async (
    conversationId,
    members,
    nameConversation,
    discription,
    isGroup,
    avatar
  ) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/message/${conversationId}?senderId=${user?.id}&receiverId=${members[0]._id}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const resData = await res.json();

      setMessages({
        messages: resData,
        members,
        conversationId,
        nameConversation,
        discription,
        isGroup,
        avatar,
      });

      // Tìm conversation hiện tại để xác định quyền admin
      const conversation = conversations.find((conv) => conv.conversationId === conversationId);
      setCurrentConversation(conversation);
      if (conversation && conversation.admins.includes(user.id)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('fetchMessages error:', err);
    }
  };

  return (
    <Flowbite>
      <div className="w-screen flex">
        {/* --------- CỘT TRÁI: SIDEBAR --------- */}
        <Sidebar
          user={user}
          conversations={conversations}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredUsers={filteredUsers}
          filteredGroups={filteredGroups}
          fetchMessages={fetchMessages}
          setShowCreateGroupModal={setShowCreateGroupModal}
          setShowUpdateProfileModal={setShowUpdateProfileModal}
          findConversation={findConversation}
        />

        {/* --------- KHUNG CHAT Ở GIỮA --------- */}
        <ChatWindow
          messages={messages}
          currentConversation={currentConversation}
          message={message}
          setMessage={setMessage}
          file={file}
          setFile={setFile}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          messageRef={messageRef}
          user={user}
          socket={socket}
        />

        {/* --------- CỘT PHẢI: RIGHT PANEL --------- */}
        <RightPanel
          users={users}
          messages={messages}
          setMessages={setMessages}
          setConversations={setConversations}
          currentConversation={currentConversation}
          setCurrentConversation={setCurrentConversation}
          isAdmin={isAdmin}
          showAddMembersModal={showAddMembersModal}
          setShowAddMembersModal={setShowAddMembersModal}
          user={user}
          findConversation={findConversation}
        />
      </div>

      {/* ----- MODALS ----- */}
      {showCreateGroupModal && (
        <CreateGroupModal
          show={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredUsers={filteredUsers}
          selectedMembers={selectedMembers}
          setSelectedMembers={setSelectedMembers}
          conversations={conversations}
          setConversations={setConversations}
          user={user}
          users={users}
        />
      )}

      {showUpdateProfileModal && (
        <UpdateProfileModal
          show={showUpdateProfileModal}
          onClose={() => setShowUpdateProfileModal(false)}
          user={user}
          setUser={setUser}
          placeholder_avatar={placeholder_avatar}
        />
      )}

      {showAddMembersModal && (
        <AddMembersModal
          show={showAddMembersModal}
          onClose={() => setShowAddMembersModal(false)}
          addMemberQuery={addMemberQuery}
          setAddMemberQuery={setAddMemberQuery}
          filteredAddMembers={filteredAddMembers}
          currentConversation={currentConversation}
          setConversations={setConversations}
          user={user}
        />
      )}
    </Flowbite>
  );
}
