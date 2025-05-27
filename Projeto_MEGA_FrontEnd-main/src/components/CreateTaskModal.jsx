// src/components/CreateTaskModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'react-feather';

// Updated props: onSubmit now expects only { title, description }
// listId is removed as TaskBoard determines the status based on the column
const CreateTaskModal = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [delivery_date, setDeliveryDate] = useState('');
    const [priority, setPriority] = useState('normal'); // Default priority
    // Removed dueDate and priority states as they are not in the backend model

    // Reset fields when modal opens or closes
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDescription('');
            setDeliveryDate('');
            setPriority('normal'); // Reset to default priority
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('O título da tarefa é obrigatório.');
            return;
        }
        // Pass only title and description to the onSubmit handler (handleAddCard in TaskBoard)
        onSubmit({ title, description, delivery_date,priority }); // Default status set to 'To Do'
        onClose(); // Close modal after submitting
    };

    // Prevent modal close on content click
    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose} // Close on overlay click
        >
            <div
                className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md text-gray-200 border border-slate-700"
                onClick={handleModalContentClick}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Criar Tarefa</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-slate-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Title Input */}
                    <div className="mb-4">
                        <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-300 mb-1">
                            Título da tarefa:
                        </label>
                        <input
                            type="text"
                            id="taskTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-sky-500 focus:ring-sky-500 outline-none"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Description Input */}
                    <div className="mb-6"> {/* Increased bottom margin as other fields were removed */}
                        <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-300 mb-1">
                            Descrição da tarefa:
                        </label>
                        <textarea
                            id="taskDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-sky-500 focus:ring-sky-500 outline-none"
                        ></textarea>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-300 mb-1">
                            Data de entrega:
                        </label>
                        <input
                            type="date"
                            id="deliveryDate"
                            value={delivery_date}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-sky-500 focus:ring-sky-500 outline-none"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
                            Prioridade:
                        </label>
                        <select
                            id="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-sky-500 focus:ring-sky-500 outline-none"
                        >
                            <option value="alta">Alta</option>
                            <option value="normal">Normal</option>
                            <option value="baixa">Baixa</option>
                        </select>
                    </div>

                    {/* Removed Due Date and Priority fields */}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150"
                        // Changed color to sky blue for consistency
                    >
                        Criar Tarefa
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;

