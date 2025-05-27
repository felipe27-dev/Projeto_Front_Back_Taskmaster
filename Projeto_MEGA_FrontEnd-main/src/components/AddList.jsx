// src/components/AddList.jsx
import React, { useState } from 'react';
import { X, Plus } from 'react-feather';

// Changed props.getlist to props.onAddList to match TaskBoard
const AddList = ({ onAddList }) => {
    const [listTitle, setListTitle] = useState('');
    const [show, setShow] = useState(false);

    const saveList = () => {
        if (!listTitle.trim()) {
            return;
        }
        // Use the correct prop name passed from TaskBoard
        onAddList(listTitle.trim());
        setListTitle('');
        setShow(false); // Hide form after adding
    }

    const closeBtn = () => {
        setListTitle('');
        setShow(false); // Hide form on close
    }

    return (
        // Removed outer div, adjusted container styling
        <div className="flex flex-col h-fit flex-shrink-0 w-full rounded-md p-2 bg-slate-900/80 border border-slate-700/50">
            {show && (
                <div>
                    <input // Changed textarea to input for single line title
                        type="text"
                        value={listTitle}
                        onChange={(e) => setListTitle(e.target.value)}
                        className='p-2 w-full rounded-md border-2 bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-sky-500 focus:ring-sky-500 outline-none'
                        placeholder='Título da nova lista...'
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') saveList(); }} // Add list on Enter
                    />
                    <div className='flex p-1 mt-2 items-center'>
                        <button
                            onClick={saveList}
                            className='p-1 px-3 rounded bg-sky-600 hover:bg-sky-700 text-white mr-2 transition-colors'
                        >
                            Adicionar Lista
                        </button>
                        <button
                            onClick={closeBtn}
                            className='p-1 rounded hover:bg-slate-600 text-gray-400 hover:text-white transition-colors'
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
            {!show && (
                <button
                    onClick={() => setShow(true)}
                    className='flex p-2 w-full justify-start text-gray-300 rounded items-center bg-white/10 hover:bg-white/20 h-10 transition-colors pl-3'
                >
                    <Plus size={18} className="mr-2" />
                    Adicionar outra lista
                </button>
            )}
        </div>
    );
}

export default AddList;

