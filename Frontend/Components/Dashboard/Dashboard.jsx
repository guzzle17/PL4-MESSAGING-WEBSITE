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
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupAvatar, setEditGroupAvatar] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Upload file
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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

    // Lắng nghe khi có thành viên được thêm vào
    socket.on('memberAdded', (data) => {
      if (currentConversation && data.conversationId === currentConversation.conversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversationId === data.conversationId
              ? { ...conv, members: [...conv.members, ...data.newMembers] }
              : conv
          )
        );
      }
    });

    // Lắng nghe khi có thành viên bị xóa
    socket.on('memberRemoved', (data) => {
      if (currentConversation && data.conversationId === currentConversation.conversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversationId === data.conversationId
              ? {
                  ...conv,
                  members: conv.members.filter(
                    (m) => !data.removedMembers.includes(m._id)
                  ),
                }
              : conv
          )
        );
      }
    });

    // Lắng nghe khi group info được cập nhật
    socket.on('groupInfoUpdated', (data) => {
      if (currentConversation && data.conversationId === currentConversation.conversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversationId === data.conversationId
              ? { ...conv, groupName: data.groupName, avatar: data.avatarUrl }
              : conv
          )
        );
        setMessages((prev) => ({
          ...prev,
          nameConversation: data.groupName,
          avatar: data.avatarUrl,
        }));
      }
    });

    // Lắng nghe khi group bị xóa
    socket.on('groupDeleted', (data) => {
      if (currentConversation && data.conversationId === currentConversation.conversationId) {
        setConversations((prev) =>
          prev.filter((conv) => conv.conversationId !== data.conversationId)
        );
        setMessages([]);
        setCurrentConversation(null);
      }
    });

    return () => {
      socket.off('getMessage');
      socket.off('memberAdded');
      socket.off('memberRemoved');
      socket.off('groupInfoUpdated');
      socket.off('groupDeleted');
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
    fetchMessages(conversation.conversationId, members, nameConversation, discription, isGroup, avatar)
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

  // Hàm gửi tin nhắn
  const sendMessage = async () => {
    if (!message && !file) return;

    const formData = new FormData();
    formData.append('conversationId', messages?.conversationId);
    formData.append('senderId', user?.id);
    if (message) formData.append('message', message);
    if (file) formData.append('file', file);

    try {
      const res = await fetch(`http://localhost:8000/api/message`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        socket?.emit('sendMessage', {
          senderId: user?.id,
          members: messages?.members?.map((member) => member._id),
          message: data.message.message,
          conversationId: messages?.conversationId,
          type: data.message.type,
          file_url: data.message.file_url,
        });
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('sendMessage error:', error);
    }

    setMessage('');
    setFile(null);
    setPreviewUrl(null);
  };

  // Hàm đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/users/sign_in');
  };

  // Xử lý chọn file (hình, pdf, ...)
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  // -------------- HÀM TẠO NHÓM ---------------
  const handleToggleMember = (member) => {
    if (selectedMembers.includes(member)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== member));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleCreateGroup = async () => {
    if (!selectedMembers || selectedMembers.length === 0) {
      alert('Vui lòng chọn ít nhất một thành viên.');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id,
          receiverId: selectedMembers.map((m) => m.receiverId),
          isGroup: true,
          groupName: 'Nhóm của tôi',
        }),
      });

      if (response.ok) {
        const newGroup = await response.json();
        alert('Nhóm đã được tạo thành công!');
        setConversations([...conversations, newGroup]);
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

  // -------------- HÀM THÊM THÀNH VIÊN ---------------
  const handleAddMember = async (memberId) => {
    if (!currentConversation) return;
    try {
      const response = await fetch(
        `http://localhost:8000/api/conversation/${currentConversation.conversationId}/addMembers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            membersToAdd: [memberId],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert('Member added successfully!');
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversationId === currentConversation?.conversationId
              ? { ...conv, members: data.members }
              : conv
          )
        );
        setShowAddMembersModal(false);
      } else {
        const error = await response.json();
        console.error('Failed to add member:', error.message);
        alert('Failed to add member.');
      }
    } catch (err) {
      console.error('Error adding member:', err);
      alert('An error occurred while adding the member.');
    }
  };

  // -------------- CÁC HÀM LIÊN QUAN ĐẾN GROUP ---------------
  const handleRemoveMember = async (memberId) => {
    if (!currentConversation) return;
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/conversation/${currentConversation.conversationId}/removeMembers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            membersToRemove: [memberId],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert('Member removed successfully!');
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversationId === currentConversation.conversationId
              ? { ...conv, members: data.members }
              : conv
          )
        );
        setShowAddMembersModal(false); // Hoặc setShowRemoveMembersModal(false) nếu bạn có modal remove riêng
      } else {
        const error = await response.json();
        console.error('Failed to remove member:', error.message);
        alert('Failed to remove member.');
      }
    } catch (err) {
      console.error('Error removing member:', err);
      alert('An error occurred while removing the member.');
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentConversation) return;
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/conversation/${currentConversation.conversationId}/leave`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (response.ok) {
        alert('You have left the group.');
        setConversations((prev) =>
          prev.filter((conv) => conv.conversationId !== currentConversation.conversationId)
        );
        setMessages([]);
        setCurrentConversation(null);
      } else {
        const error = await response.json();
        console.error('Failed to leave group:', error.message);
        alert('Failed to leave the group.');
      }
    } catch (err) {
      console.error('Error leaving group:', err);
      alert('An error occurred while leaving the group.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!currentConversation) return;
    if (!window.confirm('Are you sure you want to delete this group?')) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/conversation/${currentConversation.conversationId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderId: user.id }),
        }
      );

      if (response.ok) {
        alert('Group deleted successfully!');
        setConversations((prev) =>
          prev.filter((conv) => conv.conversationId !== currentConversation.conversationId)
        );
        setMessages([]);
        setCurrentConversation(null);
      } else {
        const error = await response.json();
        console.error('Failed to delete group:', error.message);
        alert('Failed to delete the group.');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      alert('An error occurred while deleting the group.');
    }
  };

  // -------------- CHỈ ĐỊNH ADMIN ---------------
  const handleAssignAdmin = async (memberId) => {
    if (!currentConversation) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/conversation/${currentConversation.conversationId}/assignAdmin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            memberId: memberId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert('Admin role has been assigned successfully!');
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversationId === currentConversation.conversationId
              ? { ...conv, admins: data.admins }
              : conv
          )
        );
      } else {
        const error = await response.json();
        console.error('Failed to assign admin:', error.message);
        alert('Failed to assign admin role.');
      }
    } catch (err) {
      console.error('Error assigning admin:', err);
      alert('An error occurred while assigning admin role.');
    }
  };

  // -------------- EDIT GROUP THÔNG TIN ---------------
  const handleEditGroup = async () => {
    if (!currentConversation) return;

    const formData = new FormData();
    formData.append('senderId', user.id);
    if (editGroupName) formData.append('groupName', editGroupName);
    if (editGroupAvatar) formData.append('avatar', editGroupAvatar);

    try {
      const response = await fetch(
        `http://localhost:8000/api/conversation/${currentConversation.conversationId}`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      if (response.ok) {
        const updatedConversation = await response.json();
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversationId === updatedConversation.conversationId ? updatedConversation : conv
          )
        );
        messages.avatar = updatedConversation.avatar;
        messages.nameConversation = updatedConversation.nameConversation;
        alert('Group information updated successfully!');
      } else {
        const error = await response.json();
        console.error('Failed to edit group:', error.message);
        alert('Failed to update group information.');
      }
    } catch (err) {
      console.error('Error editing group:', err);
      alert('An error occurred while updating group information.');
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
          fetchMessages={fetchMessages}
          handleLogout={handleLogout}
          setShowCreateGroupModal={setShowCreateGroupModal}
          setShowUpdateProfileModal={setShowUpdateProfileModal}
        />

        {/* --------- KHUNG CHAT Ở GIỮA --------- */}
        <ChatWindow
          messages={messages}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          file={file}
          setFile={setFile}
          handleFileSelect={handleFileSelect}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          messageRef={messageRef}
        />

        {/* --------- CỘT PHẢI: RIGHT PANEL --------- */}
        <RightPanel
          users={users}
          messages={messages}
          conversations={conversations}
          currentConversation={currentConversation}
          isAdmin={isAdmin}
          fetchMessages={fetchMessages}
          handleRemoveMember={handleRemoveMember}
          handleLeaveGroup={handleLeaveGroup}
          handleDeleteGroup={handleDeleteGroup}
          handleAddMember={handleAddMember}
          showAddMembersModal={showAddMembersModal}
          setShowAddMembersModal={setShowAddMembersModal}
          addMemberQuery={addMemberQuery}
          setAddMemberQuery={setAddMemberQuery}
          filteredAddMembers={filteredAddMembers}
          handleEditGroup={handleEditGroup}
          editGroupName={editGroupName}
          setEditGroupName={setEditGroupName}
          editGroupAvatar={editGroupAvatar}
          setEditGroupAvatar={setEditGroupAvatar}
          handleAssignAdmin={handleAssignAdmin}
          user={user}
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
          handleToggleMember={handleToggleMember}
          handleCreateGroup={handleCreateGroup}
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
          handleAddMember={handleAddMember}
        />
      )}
    </Flowbite>
  );
}
