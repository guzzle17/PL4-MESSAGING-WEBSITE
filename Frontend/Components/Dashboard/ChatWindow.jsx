import React, { useState } from 'react';
import Input from '../Input';
import userDefault from '../../Assets/userDefault.png';

export default function ChatWindow({
  messages,
  message,
  setMessage,
  sendMessage,
  file,
  setFile,
  handleFileSelect,
  previewUrl,
  setPreviewUrl,
  messageRef,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  // Zoom ảnh
  const openModal = (imageUrl) => {
    setCurrentImage(imageUrl);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="w-[50%] h-screen bg-white flex flex-col items-center">
      {/* Header */}
      {messages?.nameConversation && (
        <div className="w-[75%] bg-secondary h-[80px] my-14 rounded-full flex items-center px-14 py-2">
          <div className="cursor-pointer">
            {messages?.isGroup ? (
              messages?.avatar ? (
                <img
                  src={`http://localhost:8000${messages.avatar}`}
                  className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary"
                  alt="Group Avatar"
                />
              ) : (
                <div className="w-[60px] h-[60px] bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {messages.nameConversation?.charAt(0)}
                </div>
              )
            ) : (
              <img
                src={messages?.avatar ? `http://localhost:8000${messages.avatar}` : userDefault}
                className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary"
                alt="User Avatar"
              />
            )}
          </div>
          <div className="ml-6 mr-auto">
            <h3 className="text-lg">{messages?.nameConversation}</h3>
            <p className="text-sm font-light text-gray-600">{messages?.discription}</p>
          </div>
          {/* Ví dụ nút gọi */}
          <div className="cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon icon-tabler icon-tabler-phone-outgoing"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="black"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
              <line x1="15" y1="9" x2="20" y2="4" />
              <polyline points="16 4 20 4 20 8" />
            </svg>
          </div>
        </div>
      )}

      {/* Danh sách tin nhắn */}
      <div className="h-[75%] w-full overflow-auto shadow-sm">
        <div className="p-14">
          {messages?.messages?.length > 0 ? (
            messages.messages.map((msgItem, index) => {
              const { message: text, type, file_url, user: msgUser = {} } = msgItem;

              // Hiển thị tên người gửi (nếu group và khác user hiện tại)
              const isMe = msgUser.id === undefined; // fallback, tuỳ logic của bạn
              const isCurrentUser = msgUser.id === undefined; // tuỳ logic
              // Hoặc:
              // const isCurrentUser = (msgUser.id === user?.id);

              return (
                <div key={index}>
                  {/* Tên sender (nếu group) */}
                  {messages.isGroup && msgUser.id !== undefined && (
                    <div className="ml-16 text-sm text-gray-700 mb-1 italic">{msgUser.fullName}</div>
                  )}

                  <div className="flex items-start">
                    {/* Avatar sender (nếu không phải mình) */}
                    {msgUser.id !== undefined && msgUser.id !== null && (
                      <img
                        src={msgUser.avatar ? `http://localhost:8000${msgUser.avatar}` : userDefault}
                        className="w-[45px] h-[45px] rounded-full p-[2px] border border-primary mr-3"
                        alt="User Avatar"
                      />
                    )}

                    <div
                      className={`max-w-[40%] rounded-b-xl p-1 mb-6 w-fit break-words ${
                        msgUser.id === undefined
                          ? 'bg-primary text-white rounded-tl-xl ml-auto'
                          : 'bg-secondary rounded-tr-xl'
                      }`}
                    >
                      {text && <p className="ml-4 mr-4 mt-2 mb-2">{text}</p>}
                      {type === 'image' && (
                        <img
                          src={`http://localhost:8000${file_url}`}
                          alt="Image"
                          className="max-w-full rounded cursor-pointer"
                          onClick={() => openModal(`http://localhost:8000${file_url}`)}
                        />
                      )}
                      {type === 'file' && (
                        <a
                          href={`http://localhost:8000${file_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white-600 underline"
                        >
                          {file_url.substring(9)}
                        </a>
                      )}
                      <div ref={messageRef}></div>

                      {/* Modal zoom ảnh */}
                      {isModalOpen && (
                        <div
                          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                          onClick={closeModal}
                        >
                          <button
                            className="absolute top-5 right-5 text-white text-3xl cursor-pointer"
                            onClick={closeModal}
                          >
                            &times;
                          </button>
                          <img
                            src={currentImage}
                            alt="Zoomed"
                            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-lg font-semibold mt-24">
              No Messages or No Conversation Selected
            </div>
          )}
        </div>
      </div>

      {/* Ô soạn tin nhắn */}
      {messages?.nameConversation && (
        <div className="p-14 w-full flex items-center">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            className="w-[100%]"
            inputClassName="p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none w-[99%]"
          />
          {/* Nút gửi */}
          <div
            className={`ml-4 p-2 cursor-pointer bg-light rounded-full ${
              !message && !file ? 'pointer-events-none' : ''
            }`}
            onClick={sendMessage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon icon-tabler icon-tabler-send"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#2c3e50"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <line x1="10" y1="14" x2="21" y2="3" />
              <path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
            </svg>
          </div>

          {/* Nút đính kèm file */}
          <div className="ml-4 p-2 cursor-pointer bg-light rounded-full">
            <input type="file" id="fileInput" className="hidden" onChange={handleFileSelect} />
            <label htmlFor="fileInput" className="cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-circle-plus"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#2c3e50"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <circle cx="12" cy="12" r="9" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="12" y1="9" x2="12" y2="15" />
              </svg>
            </label>
          </div>

          {/* Hiển thị file upload */}
          {file && (
            <div className="mt-4 flex items-center">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Selected"
                    className="w-32 h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-0 right-0 bg-gray-800 text-white rounded-full p-1"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2">{file.name}</span>
                  <button
                    onClick={() => setFile(null)}
                    className="bg-gray-800 text-white rounded-full p-1"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
