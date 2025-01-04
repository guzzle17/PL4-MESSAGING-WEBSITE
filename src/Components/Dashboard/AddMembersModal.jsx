import React from 'react';
import userDefault from '../../Assets/userDefault.png';

export default function AddMembersModal({
  show,
  onClose,
  addMemberQuery,
  setAddMemberQuery,
  filteredAddMembers,
  currentConversation,
  setConversations,
  user
}) {
  if (!show) return null;

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
        onClose();
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[500px] p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Members</h2>
        <input
          type="text"
          placeholder="Search users to add"
          className="w-full border p-2 rounded mb-4"
          value={addMemberQuery}
          onChange={(e) => setAddMemberQuery(e.target.value)}
        />
        <div className="max-h-[300px] overflow-y-auto mb-4">
          {filteredAddMembers.map((member) => (
            <div
              key={member.userId || member.receiverId}
              className="flex items-center justify-between p-2 border-b"
            >
              <div className="flex items-center">
                <img src={userDefault} className="w-10 h-10 rounded-full mr-2" alt="User" />
                <div>
                  <span className="font-semibold">{member.fullName}</span>
                  <span className="block text-sm text-gray-600">{member.email}</span>
                </div>
              </div>
              <button
                onClick={() => handleAddMember(member.receiverId)}
                className="bg-primary text-white px-2 py-1 rounded"
              >
                Add
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded mr-2">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
