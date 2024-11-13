import './SearchBar.css';
import React, {useState} from 'react';
import ContactsList from './ContactsList';

const SearchBar = () => {

    const [searchInput, setSearchInput] = useState("");
   
    const handleChange = (e) => {
        var lowerCase = e.target.value.toLowerCase();
        setSearchInput(lowerCase);
    };
   
   return <div>
        <input
            type="search"
            placeholder="Search"
            onChange={handleChange}
            value={searchInput} />
        <ContactsList input={searchInput} />
       </div>
   
};
   
export default SearchBar;