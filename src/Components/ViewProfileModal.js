import { Modal } from "flowbite-react"
import { useState } from "react"

export function ViewProfileModal({ user }) {
    const [openModal, setOpenModal] = useState(false);
    return (
        <div class='block text-center'>
            <button type="button" onClick={() => setOpenModal(true)} id="viewProfileButton" class="text-white ml-auto mr-auto justify-center bg-gray-400 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:focus:ring-blue-800">
                <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 7.5 7.5">
                <path d="M 1.5 7 s -0.5 0 -0.5 -0.5 s 0.5 -2 3 -2 s 3 1.5 3 2 s -0.5 0.5 -0.5 0.5 z m 2.5 -3 a 1.5 1.5 90 1 0 0 -3 a 1.5 1.5 90 0 0 0 3"/>
                </svg>
            </button>
            <div class='text-sm dark:text-white'>View profile</div>
            <Modal show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header>View profile</Modal.Header>
                <Modal.Body>
                <div class="grid gap-4 mb-4 grid-cols-2">
                    <div class="col-span-2">
                        <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                        <input type="text" name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter your name" defaultValue={user?user.fullName:""} required disabled />
                    </div>
                    <div class="col-span-2">
                        <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                        <input type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter your email" defaultValue={user?user.email:""} required disabled/>
                    </div>
                    <div class="col-span-2">
                        <label for="description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Avatar</label>
                        <div class="flex justify-center">
                            <img class="w-36 h-36 rounded-full flex" id="updateProfileAvatar" />
                        </div>
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