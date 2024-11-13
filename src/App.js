import React from "react";
import Form from './Pages/Login&SignUp';
import './App.css';
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
          <Dashboard/>
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
