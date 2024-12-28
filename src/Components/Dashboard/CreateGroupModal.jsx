import React from 'react';

export default function CreateGroupModal({
  show,
  onClose,
  searchQuery,
  setSearchQuery,
  filteredUsers,
  selectedMembers,
  handleToggleMember,
  handleCreateGroup,
}) {
  if (!show) return null;

  return (
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
        <div className="max-h-[300px] overflow-y-auto">
          {filteredUsers.map((u) => (
            <div key={u.userId} className="flex items-center justify-between border-b p-2">
              <div className="flex items-center">
                {/* Ảnh đại diện */}
                <img
                  src="https://via.placeholder.com/50"
                  className="w-10 h-10 rounded-full mr-2"
                  alt="User"
                />
                <div>
                  <span className="block font-semibold">{u.fullName}</span>
                  <span className="block text-sm text-gray-600">{u.email}</span>
                </div>
              </div>
              <button className="text-primary" onClick={() => handleToggleMember(u)}>
                {selectedMembers.includes(u) ? 'Remove' : 'Add'}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
            onClick={onClose}
          >
            Hủy
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded" onClick={handleCreateGroup}>
            Create new group
          </button>
        </div>
      </div>
    </div>
  );
}
