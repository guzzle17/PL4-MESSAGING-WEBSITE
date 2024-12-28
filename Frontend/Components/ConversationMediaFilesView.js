import { useState, useEffect } from 'react'
import { json } from 'react-router'

const ConversationMediaFilesView = ({selection, messages}) => {
    const [selectedTab, setSelectedTab] = useState('Media')
    const isVideo =['.mpg', '.mp2', '.mpeg', '.mpe', '.mpv', '.mp4']

    const handleTabChange = (id) => {
        if (id !== null){
            if (id !== selectedTab) {
                document.getElementById(id).innerHTML = '<a href="#" class="inline-block w-full py-3 text-blue-600 bg-gray-200 rounded-full active dark:bg-gray-800 dark:text-blue-500">'+id+'</a>';
                document.getElementById(selectedTab).innerHTML = '<a href="#" class="inline-block w-full py-3 rounded-full hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300">'+selectedTab+'</a>';
                setSelectedTab(id)
            }
        }
    }
    const onVideoMouseOver = (e) => {
        const videoElement = document.getElementById(e.target.id)
        if (!videoElement.hasAttribute('controls'))
            videoElement.setAttribute('controls', 'controls')
    }
    const onVideoMouseOut = (e) => {
        const videoElement = document.getElementById(e.target.id)
        if (videoElement.hasAttribute('controls'))
            videoElement.removeAttribute('controls')
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
            {(selectedTab === 'Media') ? (
            <div class="grid grid-cols-2 md:grid-cols-3 w-[90%] ml-auto mr-auto mt-4 gap-1 overflow-auto">
            {messages.map(({ type, file_url }) => (
                <>
                {(type === 'image') && (
                    <div>
                    <img class="h-full max-w-full" src={`http://localhost:8000${file_url}`} />
                    </div>
                )}
                {(type === 'file') && (/\.(mp4|webm|ogg)$/i.test(file_url)) && (
                    <div>
                    <video id={file_url} class="h-auto max-w-full" src={`http://localhost:8000${file_url}`} onMouseOver={onVideoMouseOver} onMouseOut={onVideoMouseOut} />
                    </div>
                )}
                </>
            ))}
            </div>) : (
            <div class="block divide-y">
            {messages.map(({ type, file_url }) => (
                <>
                {(type === 'file') && (!/\.(mp4|webm|ogg)$/i.test(file_url)) && (
                    <button onClick={() => window.open(`http://localhost:8000${file_url}`)}>
                        <div class="flex items-center justify-between ml-2 mt-2 mr-2">
                            <div class="flex items-center gap-2">
                                <div class="flex items-center justify-center mr-auto ml-auto w-9 h-9 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-600">
                                    <svg class="w-9 h-9 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 30 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M 15 13.5 a 4.5 4.5 90 1 0 0 -9 a 4.5 4.5 90 0 0 0 9 z m -10.5 13.5 a 10.5 10.5 90 1 1 21 0 H 4.5 z" clip-rule="evenodd"></path></svg>
                                </div>
                                <div class="text-left text-sm dark:text-white">
                                    <div class="font-medium">{file_url.substring(9)}</div>
                                </div>
                            </div>
                        </div>
                    </button>
                )}
                </>
            ))}
            </div>
            )}
        </div>
    )
}

export default ConversationMediaFilesView