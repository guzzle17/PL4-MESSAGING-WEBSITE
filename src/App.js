import Form from './Pages/Login&SignUp';
import './App.css';
import { React, useState } from "react";
import SearchBar from './Components/SearchBar';
import DropDownMenu from './Components/DropDownMenu';
import MessageView from './Components/MessageView';
import Dashboard from "./Components/Dashboard";
import {Navigate, Route, Routes} from 'react-router-dom';

const ProtectedRoute = ({children}) => {
  const isLoggedIn = localStorage.getItem('user:token') != null;
  if (!isLoggedIn) return <Navigate to='/users/sign_in'/>;
  return children;
}

// console.log(localStorage.getItem());
// localStorage.clear(); // Xóa toàn bộ dữ liệu

function App() {
  return (
    <Routes>
      <Route path='/' element={
        <ProtectedRoute>
          <div className="App">
            <div className="Contacts">
              <DropDownMenu />
              <SearchBar />
            </div>
            <div className="MessageArea">
              <MessageView />
            </div>
          </div>
        </ProtectedRoute>
      }/>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/users/sign_in" element={<Form isSignInPage={true}/>} />
      <Route path="/users/sign_up" element={<Form isSignInPage={false}/>} />
    </Routes>
  );
}

export default App;
