const ConversationMediaFilesView = ({selection}) => {
    let selectedTab = "Media"
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
        <div onLoad={() => handleTabChange(selection)}>
            <ul class="flex flex-wrap w-[90%] ml-auto mr-auto text-sm font-medium text-center text-gray-500 border rounded-full border-gray-300 dark:border-gray-700 dark:text-gray-400">
                <li class="w-[50%]" id="Media" onClick={() => handleTabChange('Media')}>
                    <a href="#" class="inline-block w-full py-3 text-blue-600 bg-gray-200 rounded-full active dark:bg-gray-800 dark:text-blue-500">Media</a>
                </li>
                <li class="w-[50%]" id="Files" onClick={() => handleTabChange('Files')}>
                    <a href="#" class="inline-block w-full py-3 rounded-full hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300">Files</a>
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
    )
}

export default ConversationMediaFilesView