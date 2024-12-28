import { Modal } from "flowbite-react"
import { useState } from "react"

export function ViewProfileModal({ user, modalHook }) {
    const [openModal, setOpenModal] = modalHook;
    return (
        <div class='block text-center'>
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
                            {!!(user.profile_picture) ? (
                            <img class='w-36 h-36 rounded-full mt-7 justify-self-center' src={`http://localhost:8000${user.profile_picture}`} />
                            ) : (
                            <div class="flex items-center justify-center mr-auto ml-auto mt-7 w-36 h-36 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-600">
                                <svg class="w-36 h-36 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 30 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M 15 13.5 a 4.5 4.5 90 1 0 0 -9 a 4.5 4.5 90 0 0 0 9 z m -10.5 13.5 a 10.5 10.5 90 1 1 21 0 H 4.5 z" clip-rule="evenodd"></path></svg>
                            </div>
                            )}
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