import React from 'react';
import { Dropdown, DropdownHeader, DarkThemeToggle } from 'flowbite-react';
import { CgProfile } from 'react-icons/cg';
import { MdCreate, MdLogout } from 'react-icons/md';
import userDefault from '../../Assets/userDefault.png';

export default function Sidebar({
  user,
  conversations,
  searchQuery,
  setSearchQuery,
  filteredUsers,
  filteredGroups,
  fetchMessages,
  handleLogout,
  setShowCreateGroupModal,
  setShowUpdateProfileModal,
  findConversation
}) {
  return (
    <div className="w-[25%] h-screen bg-secondary overflow-auto">
      {/* Thanh trên cùng: dropdown + search */}
      <div className="flex items-center my-8 mx-14">
        {/* Dropdown Menu */}
        <div className="mr-8">
          <Dropdown
            label=""
            dismissOnClick={false}
            renderTrigger={() => (
              <svg
                className="w-8 h-8"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M1,4 H18 V6 H1 V4 M1,9 H18 V11 H1 V7 M3,14 H18 V16 H1 V14" />
              </svg>
            )}
          >
            <DropdownHeader>
              <DarkThemeToggle />
            </DropdownHeader>
            <Dropdown.Item icon={CgProfile} as="button" onClick={() => setShowUpdateProfileModal(true)}>
              Profile
            </Dropdown.Item>
            <Dropdown.Item icon={MdCreate} as="button" onClick={() => setShowCreateGroupModal(true)}>
              Create new group
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item icon={MdLogout} as="button" onClick={handleLogout}>
              Sign out
            </Dropdown.Item>
          </Dropdown>
        </div>

        {/* Search Bar */}
        <div className="flex px-4 py-0.5 rounded-full border-2 border-gray-500 overflow-hidden max-w-md mx-auto font-[sans-serif]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 192.904 192.904"
            width="16px"
            className="fill-gray-600 mr-3 rotate-90"
          >
            <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z" />
          </svg>
          <input
            type="search"
            placeholder="Search something..."
            className="w-full outline-none border-0 focus:ring-0 bg-transparent text-gray-600 text-sm"
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
      </div>

      <hr />

      {/* Danh sách conversation hoặc kết quả search */}
      <div className="mx-14 mt-10">
        <div className="text-primary text-lg">Messages</div>
        <div>
          {/* Nếu đang search => hiển thị user search. Ngược lại => hiển thị conversations */}
          {searchQuery ? (
            filteredUsers.length > 0 ? (
              filteredUsers.map((searchUser, idx) => (
                <div className="flex items-center py-8 border-b border-b-gray-300" key={idx}>
                  <div
                    className="cursor-pointer flex items-center"
                    onClick={() => findConversation([searchUser], searchUser.fullName, searchUser.email, false, searchUser.profile_picture)}
                  >
                    <div>
                      {searchUser.profile_picture ? (
                        <img
                        src={`http://localhost:8000${searchUser.profile_picture}`}
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
                      <h3 className="text-lg font-semibold">{searchUser?.fullName}</h3>
                      <p className="text-sm font-light text-gray-600">{searchUser?.email}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <></>
            )
          ) : conversations.length > 0 ? (
            conversations.map((conv) => {
              const { conversationId, isGroup, nameConversation, discription, members, avatar, unread } =
                conv;

              return (
                <div
                  key={conversationId}
                  className="flex items-center py-8 border-b border-b-gray-300"
                >
                  {isGroup ? (
                    <div
                      className="cursor-pointer flex items-center"
                      onClick={() =>
                        fetchMessages(
                          conversationId,
                          members,
                          nameConversation,
                          discription,
                          isGroup,
                          avatar
                        )
                      }
                    >
                      {avatar ? (
                        <img
                          src={`http://localhost:8000${avatar}`}
                          className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary"
                          alt="Group Avatar"
                        />
                      ) : (
                        <div className="w-[60px] h-[60px] bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {nameConversation?.charAt(0)}
                        </div>
                      )}
                      <div className="ml-6">
                        <h3 className="text-lg font-semibold">{nameConversation}</h3>
                        <p className="text-sm font-light text-gray-600">{discription}</p>
                        {unread && (
                          <span className="ml-auto bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs">
                            •
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer flex items-center"
                      onClick={() =>
                        fetchMessages(
                          conversationId,
                          members,
                          nameConversation,
                          discription,
                          isGroup,
                          avatar
                        )
                      }
                    >
                      {!!avatar ? (
                        <img
                        src={`http://localhost:8000${avatar}`}
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
                      <div className="ml-6">
                        <h3 className="text-lg font-semibold">{nameConversation}</h3>
                        <p className="text-sm font-light text-gray-600">{discription}</p>
                        {unread && (
                          <span className="ml-auto bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs">
                            •
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-lg font-semibold mt-24">No Conversations</div>
          )}
          {searchQuery ? (
            filteredGroups.length > 0 ? (
              filteredGroups.map(group => {
                const { conversationId, isGroup, nameConversation, discription, members, avatar, unread } =
                group;
                
                return (
                  <div
                    key={conversationId}
                    className="flex items-center py-8 border-b border-b-gray-300"
                  >
                    <div
                      className="cursor-pointer flex items-center"
                      onClick={() =>
                        fetchMessages(
                          conversationId,
                          members,
                          nameConversation,
                          discription,
                          isGroup,
                          avatar
                        )
                      }
                    >
                      {avatar ? (
                        <img
                          src={`http://localhost:8000${avatar}`}
                          className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary"
                          alt="Group Avatar"
                        />
                      ) : (
                        <div className="w-[60px] h-[60px] bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {nameConversation?.charAt(0)}
                        </div>
                      )}
                      <div className="ml-6">
                        <h3 className="text-lg font-semibold">{nameConversation}</h3>
                        <p className="text-sm font-light text-gray-600">{discription}</p>
                        {unread && (
                          <span className="ml-auto bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs">
                            •
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (<></>)
          ) : (<></>)}
        </div>
      </div>
    </div>
  );
}
