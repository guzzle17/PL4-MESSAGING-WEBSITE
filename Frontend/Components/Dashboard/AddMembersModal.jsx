import React from 'react';
import userDefault from '../../Assets/userDefault.png';

export default function AddMembersModal({
  show,
  onClose,
  addMemberQuery,
  setAddMemberQuery,
  filteredAddMembers,
  handleAddMember,
}) {
  if (!show) return null;

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
