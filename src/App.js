import './App.css';
import { React, useState } from "react";
import SearchBar from './Components/SearchBar';
import DropDownMenu from './Components/DropDownMenu';

function App() {
  return (
    <div className="App">
      <div className="Contacts">
        <DropDownMenu />
        <SearchBar />
      </div>
      <div className="MessageArea">
        Messages
      </div>
    </div>
  );
}



export default App;
