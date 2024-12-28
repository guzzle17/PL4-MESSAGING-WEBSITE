import React from 'react';
import userDefault from '../../Assets/userDefault.png';
import ConversationDetails from '../ConversationDetails';

export default function RightPanel({
  users,
  messages,
  conversations,
  currentConversation,
  isAdmin,
  fetchMessages,

  handleRemoveMember,
  handleLeaveGroup,
  handleDeleteGroup,
  handleAddMember,
  showAddMembersModal,
  setShowAddMembersModal,
  addMemberQuery,
  setAddMemberQuery,
  filteredAddMembers,

  handleEditGroup,
  editGroupName,
  setEditGroupName,
  editGroupAvatar,
  setEditGroupAvatar,
  handleAssignAdmin,

  user,
  findConversation
}) {
  return (
    <div className="w-[25%] h-screen bg-light px-8 py-16 overflow-auto">
      {messages?.members ? (
        // Hiển thị thông tin conversation (danh sách members, nút Leave group, xóa group, ...)
        <ConversationDetails
          members={messages.members}
          nameConversation={messages.nameConversation}
          description={messages.discription}
          isGroup={messages.isGroup}
          avatar={currentConversation?.avatar}
          messages={messages.messages}
          admins={currentConversation?.admins}
          handleLeaveGroup={handleLeaveGroup}
          handleRemoveMember={handleRemoveMember}
          handleDeleteGroup={handleDeleteGroup}
          handleEditGroup={handleEditGroup}
          handleAssignAdmin={handleAssignAdmin}
          isAdmin={isAdmin}
          addMembersHook={[showAddMembersModal, setShowAddMembersModal]}
          editGroupNameHook={[editGroupName, setEditGroupName]}
          editGroupAvatarHook={[editGroupAvatar, setEditGroupAvatar]}
          currentUser={user}
          findConversation={findConversation}
        />
      ) : (
        // Hiển thị danh sách "People" (nếu chưa chọn conversation)
        <>
          <div className="text-primary text-lg">People</div>
          <div>
            {users.length > 0 ? (
              users.map(({ userId, user }) => {
                return (
                  <div className="flex items-center py-8 border-b border-b-gray-300" key={userId}>
                    <div
                      className="cursor-pointer flex items-center"
                      onClick={() => findConversation([user], user.fullName, user.email, false, user.profile_picture)}
                    >
                      <div>
                        {user.profile_picture ? (
                          <img
                          src={`http://localhost:8000${user.profile_picture}`}
                          className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary"
                          alt="user avatar"
                          />
                        ) : (
                          <img
                          src={userDefault}
                          className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary"
                          alt="user default"
                          />
                        )}
                      </div>
                      <div className="ml-6">
                        <h3 className="text-lg font-semibold">{user?.fullName}</h3>
                        <p className="text-sm font-light text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-lg font-semibold mt-24">No Users</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
