import React from 'react';

export default function CreateGroupModal({
  show,
  onClose,
  searchQuery,
  setSearchQuery,
  filteredUsers,
  selectedMembers,
  setSelectedMembers,
  conversations,
  setConversations,
  user
}) {
  if (!show) return null;

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
        onClose()
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
              <div className="flex items-center gap-2">
                {/* Ảnh đại diện */}
                {!!(u.profile_picture) ? (
                <img class='w-10 h-10 rounded-full' src={`http://localhost:8000${u.profile_picture}`} />
                ) : (
                <div class="flex items-center justify-center mr-auto ml-auto w-10 h-10 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-600">
                    <svg class="w-10 h-10 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 30 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M 15 13.5 a 4.5 4.5 90 1 0 0 -9 a 4.5 4.5 90 0 0 0 9 z m -10.5 13.5 a 10.5 10.5 90 1 1 21 0 H 4.5 z" clip-rule="evenodd"></path></svg>
                </div>
                )}
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
