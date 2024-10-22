import './App.css';
import { React, useState } from "react";
import SearchBar from './components/SearchBar';

function App() {
  return (
    <div className="App">
      <div className="Contacts">
        <SearchBar />
      </div>
      <div className="MessageArea">
        Messages
      </div>
    </div>
  );
}



export default App;
