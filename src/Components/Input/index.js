import React from 'react'

const Input = ({
    label = '',
    name = '',
    type = 'text',
    className = '',
    isRequired = 'false',
    placeholder = '',
    value = '',
    onChange = () => {}

}) => {
  return (
    <div> 
        <label for={name} className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>{label}</label>
        <input type={type} id={name} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
        focus: ring-blue-500 focus:border-blue-500 block w-[300px] p-2.5 mb-6"
        placeholder={placeholder} required={isRequired} onChange={onChange}/>
    </div>
  )
}

export default Input