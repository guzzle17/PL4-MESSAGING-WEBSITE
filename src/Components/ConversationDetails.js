import { Tabs } from "flowbite-react";
import { ViewProfileModal } from "./ViewProfileModal";

const ConversationDetails = ({ members, nameConversation, description, isGroup }) => {
    let selectedTab = 'Media'
    const handleTabChange = (id) => {
        if (id !== null){
            if (id !== selectedTab) {
                document.getElementById(id).innerHTML = '<a href="#" class="inline-block w-full py-3 text-blue-600 bg-gray-200 rounded-full active dark:bg-gray-800 dark:text-blue-500">'+id+'</a>';
                document.getElementById(selectedTab).innerHTML = '<a href="#" class="inline-block w-full py-3 rounded-full hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300">'+selectedTab+'</a>';
                selectedTab = id;
            }
        }
    }
    return (
    <>
    {(!isGroup) ? (
    <div className='w-[25%] h-screen bg-light items-center dark:bg-gray-700'>
        <div class='block text-center'>
            <img class='w-20 h-20 rounded-full mt-7 justify-self-center' src='../Assets/placeholder_avatar.jpg' />
            <div class='font-medium dark:text-white mt-2'>
                <div>{nameConversation}</div>
                <div class='text-sm text-gray-500 dark:text-gray-400'>{description}</div>
            </div>
        </div>
        <div class='flex justify-center gap-x-10 mt-6'>
            <div class='block text-center'>
                <ViewProfileModal user={members[0]} />
            </div>
            <div class='block text-center'>
                <button type="button" id="searchMessagesButton" class="text-white ml-auto mr-auto bg-gray-400 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:focus:ring-blue-800">
                    <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 7.5 7.5">
                    <path d="M 5.871 5.172 a 3.25 3.25 90 1 0 -0.6985 0.699 h -0.0005 q 0.022 0.03 0.049 0.0575 l 1.925 1.925 a 0.5 0.5 90 0 0 0.7075 -0.707 l -1.925 -1.925 a 0.5 0.5 90 0 0 -0.0575 -0.05 z M 6 3.25 a 2.75 2.75 90 1 1 -5.5 0 a 2.75 2.75 90 0 1 5.5 0"/>
                    </svg>
                </button>
                <div class='text-sm dark:text-white'>Search</div>
            </div>
        </div>
        <div class='block mt-6'>
            <ul class="flex flex-wrap w-[90%] ml-auto mr-auto text-sm font-medium text-center text-gray-500 border rounded-full border-gray-300 dark:border-gray-700 dark:text-gray-400">
                <li class="w-[34%]" id="Media" onClick={() => handleTabChange('Media')}>
                    <a href="#" class="inline-block w-full py-3 text-blue-600 bg-gray-200 rounded-full active dark:bg-gray-800 dark:text-blue-500">Media</a>
                </li>
                <li class="w-[33%]" id="File" onClick={() => handleTabChange('File')}>
                    <a href="#" class="inline-block w-full py-3 rounded-full hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300">File</a>
                </li>
                <li class="w-[33%]" id="Link" onClick={() => handleTabChange('Link')}>
                    <a href="#" class="inline-block w-full py-3 rounded-full hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300">Link</a>
                </li>
            </ul>
            <div class="grid grid-cols-2 md:grid-cols-3 w-[90%] ml-auto mr-auto mt-4 gap-1 overflow-auto">
                <div>
                    <img class="h-auto max-w-full" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image.jpg" alt="" />
                </div>
                <div>
                    <img class="h-auto max-w-full" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg" alt="" />
                </div>
                <div>
                    <img class="h-auto max-w-full " src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg" alt="" />
                </div>
                <div>
                    <img class="h-auto max-w-full " src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg" alt="" />
                </div>
                <div>
                    <img class="h-auto max-w-full " src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg" alt="" />
                </div>
                <div>
                    <img class="h-auto max-w-full " src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg" alt="" />
                </div>
                <div>
                    <img class="h-auto max-w-full " src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-6.jpg" alt="" />
                </div>
                <div>
                    <img class="h-auto max-w-full " src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-7.jpg" alt="" />
                </div>
                <div>
                    <img class="h-auto max-w-full " src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image-8.jpg" alt="" />
                </div>
            </div>
        </div> 
    </div>) : (
    <div className='w-[25%] h-screen bg-light items-center dark:bg-gray-700'>
        <div class='block text-center'>
            <img class='w-20 h-20 rounded-full mt-7 justify-self-center' src='../Assets/placeholder_avatar.jpg' />
            <div class='font-medium dark:text-white mt-2'>
                <div>{nameConversation}</div>
                <div class='text-sm text-gray-500 dark:text-gray-400'>{description}</div>
            </div>
        </div>
        <div class='block text-center mt-6'>
            <button type="button" id="searchMessagesButton" class="text-white ml-auto mr-auto bg-gray-400 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:focus:ring-blue-800">
                <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 7.5 7.5">
                <path d="M 5.871 5.172 a 3.25 3.25 90 1 0 -0.6985 0.699 h -0.0005 q 0.022 0.03 0.049 0.0575 l 1.925 1.925 a 0.5 0.5 90 0 0 0.7075 -0.707 l -1.925 -1.925 a 0.5 0.5 90 0 0 -0.0575 -0.05 z M 6 3.25 a 2.75 2.75 90 1 1 -5.5 0 a 2.75 2.75 90 0 1 5.5 0"/>
                </svg>
            </button>
            <div class='text-sm dark:text-white'>Search</div>
        </div>
    </div>
    )}
    </>
    )
}

export default ConversationDetails;