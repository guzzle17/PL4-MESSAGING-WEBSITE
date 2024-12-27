import { Dropdown, Modal } from "flowbite-react";
import { useState } from "react";
import { ViewProfileModal } from "./ViewProfileModal";
import { LuMessageCircle } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { BsPersonFillDash, BsPersonFillGear } from "react-icons/bs";
import ConversationMediaFilesView from "./ConversationMediaFilesView";
import { SearchModal } from "./SearchModal";

const ConversationDetails = ({ members, nameConversation, description, isGroup, avatar, messages, admins, handleLeaveGroup, handleRemoveMember, handleDeleteGroup, handleEditGroup, handleAssignAdmin, isAdmin, addMembersHook, editGroupNameHook, editGroupAvatarHook, currentUser, findConversation }) => {
    const [customizeChatListOpen, setCustomizeChatListOpen] = useState(false)
    const [chatMembersListOpen, setChatMembersListOpen] = useState(false)
    const [mediaFilesListOpen, setMediaFilesListOpen] = useState(false)
    const [mediaFilesViewOpen, setMediaFilesViewOpen] = useState("")
    const [openProfileModal, setOpenProfileModal] = useState(false)
    const [openEditGroupNameModal, setOpenEditGroupNameModal] = useState(false)
    const [openEditGroupAvatarModal, setOpenEditGroupAvatarModal] = useState(false)
    const [openSearchModal, setOpenSearchModal] = useState(false)
    const [user, setUser] = useState([])
    const [showAddMembersModal, setShowAddMembersModal] = addMembersHook
    const [editGroupAvatar, setEditGroupAvatar] = editGroupAvatarHook
    const [editGroupName, setEditGroupName] = editGroupNameHook

    return (
    <>
    {(!isGroup) ? (
    <div className='w-full h-screen bg-light items-center dark:bg-gray-700'>
        <div class='block text-center'>
            {!!(avatar) ? (
            <img class='w-20 h-20 rounded-full mt-7 justify-self-center' src={`http://localhost:8000${avatar}`} />
            ) : (
            <div class="flex items-center justify-center mr-auto ml-auto mt-7 w-16 h-16 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-600">
                <svg class="w-16 h-16 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 30 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M 15 13.5 a 4.5 4.5 90 1 0 0 -9 a 4.5 4.5 90 0 0 0 9 z m -10.5 13.5 a 10.5 10.5 90 1 1 21 0 H 4.5 z" clip-rule="evenodd"></path></svg>
            </div>
            )}
            <div class='font-medium dark:text-white mt-2'>
                <div>{nameConversation}</div>
                <div class='text-sm text-gray-500 dark:text-gray-400'>{description}</div>
            </div>
        </div>
        <div class='flex justify-center gap-x-10 mt-6'>
            <div class='block text-center'>
                <button type="button" onClick={() => setOpenProfileModal(true)} id="viewProfileButton" class="text-white ml-auto mr-auto justify-center bg-gray-400 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:focus:ring-blue-800">
                    <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 7.5 7.5">
                    <path d="M 1.5 7 s -0.5 0 -0.5 -0.5 s 0.5 -2 3 -2 s 3 1.5 3 2 s -0.5 0.5 -0.5 0.5 z m 2.5 -3 a 1.5 1.5 90 1 0 0 -3 a 1.5 1.5 90 0 0 0 3"/>
                    </svg>
                </button>
                <div class='text-sm dark:text-white'>View profile</div>
                <ViewProfileModal user={members[0]} modalHook={[openProfileModal, setOpenProfileModal]} />
            </div>
            <div class='block text-center'>
                <button type="button" onClick={() => setOpenSearchModal(true)} id="searchMessagesButton" class="text-white ml-auto mr-auto bg-gray-400 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:focus:ring-blue-800">
                    <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 7.5 7.5">
                    <path d="M 5.871 5.172 a 3.25 3.25 90 1 0 -0.6985 0.699 h -0.0005 q 0.022 0.03 0.049 0.0575 l 1.925 1.925 a 0.5 0.5 90 0 0 0.7075 -0.707 l -1.925 -1.925 a 0.5 0.5 90 0 0 -0.0575 -0.05 z M 6 3.25 a 2.75 2.75 90 1 1 -5.5 0 a 2.75 2.75 90 0 1 5.5 0"/>
                    </svg>
                </button>
                <div class='text-sm dark:text-white'>Search</div>
            </div>
        </div>
        <div class="block mt-6">
            <ConversationMediaFilesView selection={"Media"} messages={messages} /> 
        </div>
    </div>) : (
    <div className='w-full h-screen bg-light items-center dark:bg-gray-700'>
    {(mediaFilesViewOpen !== "") ? (
    <div class='block mt-6' >
        <div class="flex w-full items-center mb-8 font-medium text-lg dark:text-white">
            <button class="text-white ml-[5%] hover:bg-gray-300 focus:outline-none font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2" onClick={() => setMediaFilesViewOpen("")}>
            <svg class="w-4 h-4 rounded-full fill-black dark:fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 7">
            <path fill-rule="evenodd" d="M 7.5 4 a 0.25 0.25 90 0 0 -0.25 -0.25 H 1.3535 l 1.5735 -1.573 a 0.25 0.25 90 1 0 -0.354 -0.354 l -2 2 a 0.25 0.25 90 0 0 0 0.354 l 2 2 a 0.25 0.25 90 0 0 0.354 -0.354 L 1.3535 4.25 H 7.25 A 0.25 0.25 90 0 0 7.5 4"/>
            </svg>
            </button>
            <span>Media & files</span>
        </div>
        <ConversationMediaFilesView selection={mediaFilesViewOpen} messages={messages} />
    </div>) : (
    <>
        <div class='block text-center'>
            {!!(avatar) ? (
            <img class='w-20 h-20 rounded-full mt-7 justify-self-center' src={`http://localhost:8000${avatar}`} />
            ) : (
            <div class="flex items-center justify-center mr-auto ml-auto mt-7 w-16 h-16 overflow-hidden bg-primary rounded-full dark:bg-gray-600">
                <span class="font-medium text-white dark:text-gray-300">{nameConversation.charAt()}</span>
            </div>
            )}
            <div class='font-medium dark:text-white mt-2'>
                <div>{nameConversation}</div>
                <div class='text-sm text-gray-500 dark:text-gray-400'>{description}</div>
            </div>
        </div>
        <div class='flex justify-center gap-x-10 mt-6'>
            <div class='block text-center'>
                <button type="button" onClick={() => setOpenSearchModal(true)} id="searchMessagesButton" class="text-white ml-auto mr-auto bg-gray-400 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:focus:ring-blue-800">
                    <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 7.5 7.5">
                    <path d="M 5.871 5.172 a 3.25 3.25 90 1 0 -0.6985 0.699 h -0.0005 q 0.022 0.03 0.049 0.0575 l 1.925 1.925 a 0.5 0.5 90 0 0 0.7075 -0.707 l -1.925 -1.925 a 0.5 0.5 90 0 0 -0.0575 -0.05 z M 6 3.25 a 2.75 2.75 90 1 1 -5.5 0 a 2.75 2.75 90 0 1 5.5 0"/>
                    </svg>
                </button>
                <div class='text-sm dark:text-white'>Search</div>
            </div>
            <div class='block text-center'>
                <button type="button" onClick={handleLeaveGroup} class="text-white ml-auto mr-auto bg-gray-400 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:focus:ring-blue-800">
                    <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 7.5 7.5">
                    <path fill-rule="evenodd" d="M 5 6.25 a 0.25 0.25 90 0 1 -0.25 0.25 h -4 a 0.25 0.25 90 0 1 -0.25 -0.25 v -4.5 a 0.25 0.25 90 0 1 0.25 -0.25 h 4 a 0.25 0.25 90 0 1 0.25 0.25 v 1 a 0.25 0.25 90 0 0 0.5 0 v -1 A 0.75 0.75 90 0 0 4.75 1 h -4 A 0.75 0.75 90 0 0 0 1.75 v 4.5 A 0.75 0.75 90 0 0 0.75 7 h 4 a 0.75 0.75 90 0 0 0.75 -0.75 v -1 a 0.25 0.25 90 0 0 -0.5 0 z"/>
                    <path fill-rule="evenodd" d="M 7.927 4.177 a 0.25 0.25 90 0 0 0 -0.354 l -1.5 -1.5 a 0.25 0.25 90 0 0 -0.354 0.354 L 7.1465 3.75 H 2.75 a 0.25 0.25 90 0 0 0 0.5 h 4.3965 l -1.0735 1.073 a 0.25 0.25 90 0 0 0.354 0.354 z"/>
                    </svg>
                </button>
                <div class='text-sm dark:text-white'>Leave group</div>
            </div>
        </div>
        <div class="block text-center mt-6 w-[96%] ml-auto mr-auto">
            <button id="customizeChatButton" class="w-full bg-transparent hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm px-2 py-2.5 text-left inline-flex items-center justify-between dark:text-white" type="button" onClick={() => setCustomizeChatListOpen((prevState) => !prevState)}>
            Customize conversation
            <svg class="w-2.5 h-2.5 ms-3 stroke-current dark:stroke-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
            </svg>
            </button>
            {customizeChatListOpen && (
                <div class="block text-center w-full">
                    <button onClick={() => setOpenEditGroupNameModal(true)} class="w-full bg-transparent hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm gap-2 px-2 py-2.5 text-left inline-flex items-center dark:text-white" type="button">
                    <svg class="w-7 h-7 bg-gray-300 rounded-full dark:bg-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M 5.2135 2.0365 a 0.125 0.125 90 0 0 -0.1767 0 L 4.625 2.4482 L 5.5518 3.375 l 0.4118 -0.4115 a 0.125 0.125 90 0 0 0 -0.177 z m 0.1615 1.5152 L 4.4482 2.625 L 2.8232 4.25 H 2.875 a 0.125 0.125 90 0 1 0.125 0.125 v 0.125 h 0.125 a 0.125 0.125 90 0 1 0.125 0.125 v 0.125 h 0.125 a 0.125 0.125 90 0 1 0.125 0.125 v 0.125 h 0.125 a 0.125 0.125 90 0 1 0.125 0.125 v 0.0517 z m -1.867 1.867 A 0.125 0.125 90 0 1 3.5 5.375 V 5.25 h -0.125 a 0.125 0.125 90 0 1 -0.125 -0.125 V 5 h -0.125 a 0.125 0.125 90 0 1 -0.125 -0.125 V 4.75 h -0.125 a 0.125 0.125 90 0 1 -0.125 -0.125 V 4.5 h -0.125 a 0.125 0.125 90 0 1 -0.0437 -0.008 l -0.0447 0.0445 a 0.125 0.125 90 0 0 -0.0275 0.042 l -0.5 1.25 a 0.125 0.125 90 0 0 0.1625 0.1625 l 1.25 -0.5 a 0.125 0.125 90 0 0 0.042 -0.0275 z"/>
                    </svg>
                    Change name
                    </button>
                    <Modal show={openEditGroupNameModal} onClose={() => setOpenEditGroupNameModal(false)}>
                        <Modal.Header>Rename chat</Modal.Header>
                        <Modal.Body>
                        <div class="grid gap-4 grid-cols-2">
                            <div class="col-span-2 mb-3">
                                <label for="groupName" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Group name</label>
                                <input type="text" defaultValue={nameConversation} onChange={(e) => setEditGroupName(e.target.value)} name="groupName" id="groupName" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter group name" required />
                            </div>
                            <button onClick={() => setOpenEditGroupNameModal(false)} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Cancel</button>
                            <button onClick={handleEditGroup} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Save</button>
                        </div>
                        </Modal.Body>
                    </Modal>

                    <button onClick={() => setOpenEditGroupAvatarModal(true)} class="w-full bg-transparent hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm gap-2 px-2 py-2.5 text-left inline-flex items-center dark:text-white" type="button">
                    <svg class="w-7 h-7 bg-gray-300 rounded-full dark:bg-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M 2.0005 2.75 a 0.5 0.5 90 0 1 0.5 -0.5 h 3 a 0.5 0.5 90 0 1 0.5 0.5 v 2.5 a 0.5 0.5 90 0 1 -0.5 0.5 h -3 a 0.5 0.5 90 0 1 -0.5 -0.5 z m 0.25 2.25 v 0.25 a 0.25 0.25 90 0 0 0.25 0.25 h 3 a 0.25 0.25 90 0 0 0.25 -0.25 V 4.375 l -0.9443 -0.4868 a 0.125 0.125 90 0 0 -0.1442 0.0232 l -0.9275 0.9275 l -0.665 -0.443 a 0.125 0.125 90 0 0 -0.1575 0.0155 z m 1.25 -1.625 a 0.375 0.375 90 1 0 -0.75 0 a 0.375 0.375 90 0 0 0.75 0"/>
                    </svg>
                    Change picture
                    </button>
                    <Modal show={openEditGroupAvatarModal} onClose={() => setOpenEditGroupAvatarModal(false)}>
                        <Modal.Header>Change avatar</Modal.Header>
                        <Modal.Body>
                        <div class="grid gap-4 grid-cols-2">
                            <div class="col-span-2 mb-3">
                                <label for="updateGroupAvatar" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Avatar</label>
                                <div class="flex justify-center">
                                    {!!(avatar) ? (
                                    <img class='w-36 h-36 rounded-full mt-7 justify-self-center' src={`http://localhost:8000${avatar}`} />
                                    ) : (
                                    <div class="flex items-center justify-center mr-auto ml-auto mt-7 w-36 h-36 overflow-hidden bg-primary rounded-full dark:bg-gray-600">
                                        <span class="font-medium text-3xl text-white dark:text-gray-300">{nameConversation.charAt()}</span>
                                    </div>
                                    )}
                                    <div class="ml-10 self-center">
                                        <input onChange={(e) => {document.getElementById('updateGroupAvatar').src = URL.createObjectURL(e.target.files[0]); setEditGroupAvatar(e.target.files[0]);}} class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="changeImageInput" type="file"  accept="image/*" />
                                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-300" id="changeImageInputHelp">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setOpenEditGroupAvatarModal(false)} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Cancel</button>
                            <button onClick={handleEditGroup} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Save</button>
                        </div>
                        </Modal.Body>
                    </Modal>

                    {isAdmin && (
                    <button onClick={handleDeleteGroup} class="w-full bg-transparent hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm gap-2 px-2 py-2.5 text-left inline-flex items-center dark:text-white" type="button">
                    <svg class="w-7 h-7 bg-gray-300 rounded-full dark:bg-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M 4.75 2.375 v 0.25 h 0.875 a 0.125 0.125 90 0 1 0 0.25 h -0.1345 l -0.2132 2.665 A 0.5 0.5 90 0 1 4.7788 6 h -1.5575 a 0.5 0.5 90 0 1 -0.4985 -0.46 L 2.5095 2.875 H 2.375 a 0.125 0.125 90 0 1 0 -0.25 H 3.25 v -0.25 A 0.375 0.375 90 0 1 3.625 2 h 0.75 A 0.375 0.375 90 0 1 4.75 2.375 m -1.25 0 v 0.25 h 1 v -0.25 a 0.125 0.125 90 0 0 -0.125 -0.125 h -0.75 a 0.125 0.125 90 0 0 -0.125 0.125 M 3.125 3.2572 l 0.125 2.125 a 0.125 0.125 90 1 0 0.2495 -0.015 l -0.125 -2.125 a 0.125 0.125 90 1 0 -0.2495 0.015 m 1.6325 -0.132 a 0.125 0.125 90 0 0 -0.132 0.1175 l -0.125 2.125 a 0.125 0.125 90 0 0 0.2495 0.0145 l 0.125 -2.125 a 0.125 0.125 90 0 0 -0.1175 -0.132 M 4 3.125 a 0.125 0.125 90 0 0 -0.125 0.125 v 2.125 a 0.125 0.125 90 0 0 0.25 0 V 3.25 a 0.125 0.125 90 0 0 -0.125 -0.125"/>
                    </svg>
                    Delete group
                    </button>
                    )}
                </div>
            )}

            <button id="chatMembersButton" class="w-full bg-transparent hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm px-2 py-2.5 text-left inline-flex items-center justify-between dark:text-white" type="button" onClick={() => setChatMembersListOpen((prevState) => !prevState)}>
            Chat members
            <svg class="w-2.5 h-2.5 ms-3 stroke-current dark:stroke-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
            </svg>
            </button>
            {chatMembersListOpen && (
                <div class="block text-left w-full">
                    {members.map((member) => {
                        return (
                            <div class="flex items-center justify-between ml-2 mt-2 mr-2">
                                <div class="flex items-center gap-2">
                                    {!!(member.profile_picture) ? (
                                    <img class='w-8 h-8 rounded-full' src={`http://localhost:8000${member.profile_picture}`} />
                                    ) : (
                                    <div class="flex items-center justify-center mr-auto ml-auto w-9 h-9 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-600">
                                        <svg class="w-9 h-9 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 30 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M 15 13.5 a 4.5 4.5 90 1 0 0 -9 a 4.5 4.5 90 0 0 0 9 z m -10.5 13.5 a 10.5 10.5 90 1 1 21 0 H 4.5 z" clip-rule="evenodd"></path></svg>
                                    </div>
                                    )}
                                    <div class="text-sm dark:text-white">
                                        <div class="font-medium">{member.fullName}</div>
                                        <div class="text-gray-500 dark:text-gray-400">{member.email}</div>
                                    </div>
                                </div>
                                <div class="flex">
                                    <Dropdown label="" dismissOnClick={false} renderTrigger={() =>
                                    <div class="flex w-8 h-8 items-center justify-center hover:bg-gray-300 rounded-full">
                                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                                        <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
                                        </svg>
                                    </div>}>
                                        <Dropdown.Item icon={LuMessageCircle} as="button" onClick={() => findConversation([member], member.fullName, member.email, false, member.profile_picture)}>Message</Dropdown.Item>
                                        <Dropdown.Item icon={CgProfile} as="button" onClick={() => {setOpenProfileModal(true); setUser(member)}}>Profile</Dropdown.Item>
                                        {isAdmin && (member._id !== currentUser.id) &&  (<>
                                        <Dropdown.Divider />
                                        <Dropdown.Item icon={BsPersonFillDash} as="button" onClick={() => handleRemoveMember(member._id)}>Remove member</Dropdown.Item>
                                        {!admins.includes(member._id) && (<Dropdown.Item icon={BsPersonFillGear} as="button" onClick={() => handleAssignAdmin(member._id)}>Make admin</Dropdown.Item>)}
                                        </>
                                        )}
                                    </Dropdown>
                                    {openProfileModal && (
                                    <ViewProfileModal user={user} modalHook={[openProfileModal, setOpenProfileModal]} />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {isAdmin && (
                    <button onClick={() => setShowAddMembersModal(true)} class="w-full bg-transparent hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm gap-2 px-2 py-2.5 text-left inline-flex items-center dark:text-white" type="button">
                    <svg class="w-8 h-8 bg-gray-300 rounded-full dark:bg-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M 5.125 6 a 0.875 0.875 90 1 0 0 -1.75 a 0.875 0.875 90 0 0 0 1.75 m 0.125 -1.25 v 0.25 h 0.25 a 0.125 0.125 90 0 1 0 0.25 h -0.25 v 0.25 a 0.125 0.125 90 0 1 -0.25 0 v -0.25 h -0.25 a 0.125 0.125 90 0 1 0 -0.25 h 0.25 v -0.25 a 0.125 0.125 90 0 1 0.25 0 m -0.5 -1.5 a 0.75 0.75 90 1 1 -1.5 0 a 0.75 0.75 90 0 1 1.5 0"/>
                    <path d="M 2.5 5.25 c 0 0.25 0.25 0.25 0.25 0.25 h 1.314 A 1.125 1.125 90 0 1 4 5.125 a 1.125 1.125 90 0 1 0.386 -0.8482 Q 4.211 4.2505 4 4.25 c -1.25 0 -1.5 0.75 -1.5 1"/>
                    </svg>
                    Add members
                    </button>)}
                    
                </div>
            )}

            <button id="mediaListButton" class="w-full bg-transparent hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm px-2 py-2.5 text-left inline-flex items-center justify-between dark:text-white" type="button"  onClick={() => setMediaFilesListOpen((prevState) => !prevState)}>
            Media & files
            <svg class="w-2.5 h-2.5 ms-3 stroke-current dark:stroke-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
            </svg>
            </button>
            {mediaFilesListOpen && (
                <div class="block text-center w-full">
                    <button id="getMediaButton" class="w-full bg-transparent hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm gap-2 px-2 py-2.5 text-left inline-flex items-center dark:text-white" type="button" onClick={() => setMediaFilesViewOpen("Media")}>
                    <svg class="w-7 h-7 bg-gray-300 rounded-full dark:bg-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M 3.1255 4.25 a 0.375 0.375 90 1 0 0 -0.75 a 0.375 0.375 90 0 0 0 0.75"/>
                    <path d="M 5.5005 5.25 a 0.5 0.5 90 0 1 -0.5 0.5 h -2.5 a 0.5 0.5 90 0 1 -0.5 -0.5 V 3.25 A 0.5 0.5 90 0 1 2.5 2.75 a 0.5 0.5 90 0 1 0.5 -0.5 h 2.5 a 0.5 0.5 90 0 1 0.5 0.5 v 2 a 0.5 0.5 90 0 1 -0.4995 0.5 M 5.5 2.5 H 3 a 0.25 0.25 90 0 0 -0.25 0.25 h 2.2505 a 0.5 0.5 90 0 1 0.5 0.5 v 1.75 A 0.25 0.25 90 0 0 5.75 4.75 V 2.75 a 0.25 0.25 90 0 0 -0.25 -0.25 M 2.5005 3 a 0.25 0.25 90 0 0 -0.25 0.25 v 2 l 0.6615 -0.5885 a 0.125 0.125 90 0 1 0.1575 -0.0155 l 0.665 0.4432 l 0.9275 -0.9275 a 0.125 0.125 90 0 1 0.1442 -0.0235 l 0.4442 0.4868 V 3.25 a 0.25 0.25 90 0 0 -0.25 -0.25 z"/>
                    </svg>
                    Media
                    </button>

                    <button id="getFilesButton" class="w-full bg-transparent hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm gap-2 px-2 py-2.5 text-left inline-flex items-center dark:text-white" type="button" onClick={() => setMediaFilesViewOpen("Files")}>
                    <svg class="w-7 h-7 bg-gray-300 rounded-full dark:bg-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 8">
                    <path d="M 4.3232 2 H 3 a 0.5 0.5 90 0 0 -0.5 0.5 v 3 a 0.5 0.5 90 0 0 0.5 0.5 h 2 a 0.5 0.5 90 0 0 0.5 -0.5 V 3.1768 A 0.25 0.25 90 0 0 5.4268 3 L 4.5 2.0732 A 0.25 0.25 90 0 0 4.3232 2 M 4.375 2.875 v -0.5 l 0.75 0.75 h -0.5 a 0.25 0.25 90 0 1 -0.25 -0.25 M 3.125 4.25 a 0.125 0.125 90 0 1 0 -0.25 h 1.75 a 0.125 0.125 90 0 1 0 0.25 z M 3 4.625 a 0.125 0.125 90 0 1 0.125 -0.125 h 1.75 a 0.125 0.125 90 0 1 0 0.25 h -1.75 a 0.125 0.125 90 0 1 -0.125 -0.125 m 0.125 0.625 a 0.125 0.125 90 0 1 0 -0.25 h 1 a 0.125 0.125 90 0 1 0 0.25 z"/>                    
                    </svg>
                    Files
                    </button>
                </div>
            )}
            

        </div>
    </>)}
    </div>)}
    {openSearchModal && <SearchModal modalHook={[openSearchModal, setOpenSearchModal]} messages={messages} members={members} currentUser={currentUser} />}
    </>
    )
}

export default ConversationDetails;