import React from "react";
import Form from './Pages/Login&SignUp';
import './App.css';
import Dashboard from "./Components/Dashboard";
import {Navigate, Route, Routes} from 'react-router-dom';

const ProtectedRoute = ({children}) => {
  const isLoggedIn = localStorage.getItem('user:token') != null || true;
  if (!isLoggedIn) return <Navigate to='/users/sign_in'/>;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path='/' element={
        <ProtectedRoute>
          <Dashboard/>
        </ProtectedRoute>
      }/>
      <Route path="/users/sign_in" element={<Form isSignInPage={true}/>} />
      <Route path="/users/sign_up" element={<Form isSignInPage={false}/>} />
    </Routes>
  );
}

export default App;
