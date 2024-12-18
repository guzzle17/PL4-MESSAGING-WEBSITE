import { useState, useEffect } from 'react'
import { Modal } from 'flowbite-react'

export function SearchModal({modalHook, messages, members, currentUser}) {
    const [openModal, setOpenModal] = modalHook
    const [searchValue, setSearchValue] = useState("")
    const [searchReturn, setSearchReturn] = useState("")
    const handleSearch = () => {
        const filteredMessages = messages.filter((message) => message.message?.toLowerCase().includes(searchValue.toLowerCase()))
        const renderedMessages = filteredMessages.map(({ message, user }) => {
            let member = members.find(arrayMember => arrayMember._id === user.id)
            if (member === undefined) member = currentUser
            return (
                <div class="flex items-center content-left mb-2 pt-2 gap-2">
                    {!!(member.profile_picture) ? (
                    <img class='w-8 h-8 rounded-full' src={`http://localhost:8000${member.profile_picture}`} />
                    ) : (
                    <div class="flex items-center justify-center w-9 h-9 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-600">
                        <svg class="w-9 h-9 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 30 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M 15 13.5 a 4.5 4.5 90 1 0 0 -9 a 4.5 4.5 90 0 0 0 9 z m -10.5 13.5 a 10.5 10.5 90 1 1 21 0 H 4.5 z" clip-rule="evenodd"></path></svg>
                    </div>
                    )}
                    <div class="text-sm text-left dark:text-white">
                        <div class="font-medium">{member.fullName}</div>
                        <div class="text-gray-600 dark:text-gray-400">{message}</div>
                    </div>
                </div>
            )
        })
        setSearchReturn(renderedMessages)
    }

    return (
        <div class='block text-center'>
            <Modal show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header>Search conversation</Modal.Header>
                <Modal.Body>
                <div class="grid gap-4 mb-4 grid-cols-2">
                    <div class="flex items-center justify-center col-span-2">
                        <input type="text" name="searchValue" id="SearchValue" onChange={(e) => setSearchValue(e.target.value)} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-[80%] p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Seach something" required />
                        <button onClick={handleSearch} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-1 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Search</button>
                    </div>
                    <div class="block divide-y col-span-2">
                        {searchReturn}
                    </div>
                </div>
                </Modal.Body>
                <Modal.Footer>
                <button type="button" class="text-white ml-auto mr-auto bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={() => setOpenModal(false)}>Back</button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}