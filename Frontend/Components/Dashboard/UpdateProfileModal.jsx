import React from 'react';
import { useNavigate } from 'react-router';

export default function UpdateProfileModal({
  show,
  onClose,
  user,
  setUser,
  placeholder_avatar,
}) {
  const navigate = useNavigate();
  
  if (!show) return null;

  // Đổi hiển thị/ẩn password
  const toggleHidePassword = () => {
    let toggle_button = document.getElementById('toggle-hide-password1');
    let password_input = document.getElementById('changePassword');
    if (!toggle_button || !password_input) return;

    if (password_input.type === 'password') {
      password_input.type = 'text';
      document.getElementById('confirmOldPassword').type = 'text';
      toggle_button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
          stroke-width="1.5" stroke="currentColor" width="15" height="15">
          <path stroke-linecap="round" stroke-linejoin="round" 
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 
            7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 
            6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 
            10.065 7.498a10.523 10.523 0 01-4.293 
            5.774M6.228 6.228L3 3m3.228 3.228l3.65 
            3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 
            0a3 3 0 10-4.243-4.243m4.242 
            4.242L9.88 9.88" />
        </svg>
      `;
    } else {
      password_input.type = 'password';
      document.getElementById('confirmOldPassword').type = 'password';
      toggle_button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
          viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
          width="15" height="15">
          <path stroke-linecap="round" stroke-linejoin="round" 
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 
            7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 
            7.178.07.207.07.431 0 .639C20.577 16.49 16.64 
            19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path stroke-linecap="round" stroke-linejoin="round" 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      `;
    }
    document.getElementById('toggle-hide-password2').innerHTML = toggle_button.innerHTML;
  };

  // Chọn ảnh update (chưa xử lý upload)
  const handleChooseUpdateAvatar = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      let updateProfileAvatar = document.getElementById('updateProfileAvatar');
      updateProfileAvatar.src = URL.createObjectURL(selectedImage);
    }
  };

  // Gửi form cập nhật
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = {
      email: e.target.email.value,
      name: e.target.name.value,
      oldPassword: e.target.confirmOldPassword.value,
      newPassword: e.target.changePassword.value,
    };
    const serializedBody = JSON.stringify(formData);

    try {
      const res = await fetch('http://localhost:8000/api/users/updateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serializedBody,
      });
      const resData = await res.json();
      if (resData.user) {
        localStorage.setItem('user:detail', JSON.stringify(resData.user));
        setUser(resData.user);
        navigate(0); // reload
      } else {
        console.log('Error:', resData);
        alert(resData.message || 'An unexpected error occurred.');
      }
    } catch (error) {
      console.error('handleUpdateProfile error:', error);
      alert('Error updating profile!');
    }
  };

  return (
    <div
      tabIndex="-1"
      aria-hidden="true"
      className="fixed overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 flex z-50 justify-center items-center w-full h-[calc(100%-1rem)] max-h-full"
    >
      <div className="relative p-4 w-full max-w-xl max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              User profile
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 
              hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex 
              justify-center items-center dark:hover:bg-gray-600 
              dark:hover:text-white"
              onClick={onClose}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {/* Body */}
          <form className="p-4 md:p-5" onSubmit={handleUpdateProfile}>
            <div className="grid gap-4 mb-4 grid-cols-2">
              <div className="col-span-2">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="bg-gray-50 border border-gray-300 
                  text-gray-900 text-sm rounded-lg focus:ring-primary-600 
                  focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 
                  dark:border-gray-500 dark:placeholder-gray-400 dark:text-white 
                  dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Enter your name"
                  defaultValue={user ? user.fullName : ''}
                  required
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 
                  text-gray-900 text-sm rounded-lg focus:ring-primary-600 
                  focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 
                  dark:border-gray-500 dark:placeholder-gray-400 dark:text-white 
                  dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Enter your email"
                  defaultValue={user ? user.email : ''}
                  required
                  readOnly
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="confirmOldPassword"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm Old Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmOldPassword"
                    id="confirmOldPassword"
                    className="bg-gray-50 border border-gray-300 text-gray-900 
                    text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 
                    block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 
                    dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 
                    dark:focus:border-primary-500"
                    placeholder="Enter old password"
                  />
                  <button
                    type="button"
                    id="toggle-hide-password1"
                    className="absolute inset-y-0 end-0 flex items-center 
                    cursor-pointer z-10 p-3.5"
                    onClick={toggleHidePassword}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      width="15"
                      height="15"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 
                        7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 
                        7.178.07.207.07.431 0 .639C20.577 16.49 
                        16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="changePassword"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  New password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="changePassword"
                    id="changePassword"
                    className="bg-gray-50 border border-gray-300 
                    text-gray-900 text-sm rounded-lg focus:ring-primary-600 
                    focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 
                    dark:border-gray-500 dark:placeholder-gray-400 dark:text-white 
                    dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    id="toggle-hide-password2"
                    className="absolute inset-y-0 end-0 flex 
                    items-center cursor-pointer z-10 p-3.5"
                    onClick={toggleHidePassword}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      width="15"
                      height="15"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 
                        7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 
                        9.963 7.178.07.207.07.431 0 .639C20.577 
                        16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="description"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Avatar
                </label>
                <div className="flex justify-center">
                  <img
                    className="w-36 h-36 rounded-full flex"
                    id="updateProfileAvatar"
                    src={placeholder_avatar}
                    alt="avatar placeholder"
                  />
                  <div className="ml-10 self-center">
                    <input
                      className="block w-full text-sm text-gray-900 
                      border border-gray-300 rounded-lg cursor-pointer bg-gray-50 
                      dark:text-gray-400 focus:outline-none dark:bg-gray-700 
                      dark:border-gray-600 dark:placeholder-gray-400"
                      aria-describedby="changeImageInputHelp"
                      id="changeImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleChooseUpdateAvatar}
                    />
                    <p
                      className="mt-1 text-sm text-gray-500 dark:text-gray-300"
                      id="changeImageInputHelp"
                    >
                      SVG, PNG, JPG or GIF (MAX. 800x400px).
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="text-white flex justify-self-center items-center mt-5 
              bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none 
              focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 
              text-center dark:bg-blue-600 dark:hover:bg-blue-700 
              dark:focus:ring-blue-800"
            >
              Save changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
