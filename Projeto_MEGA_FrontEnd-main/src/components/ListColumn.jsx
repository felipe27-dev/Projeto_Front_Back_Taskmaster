// src/components/ListColumn.jsx
import React, { useState } from 'react';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal.jsx';
import { Plus, Trash2 } from 'react-feather'; // Added Trash2 back for potential list deletion
import { Droppable } from 'react-beautiful-dnd'; // Or @hello-pangea/dnd

// Props updated for list-based grouping:
// list: { id: listTitle, title: listTitle, cards: tasksInThisList }
// onAddCard: function(taskData) - TaskBoard adds listTitle
// onDeleteCard: function(taskId)
// onToggleTaskStatus: function(taskId, currentStatus)
// onDeleteList: function(listTitle) (Optional, if list deletion is implemented)
const ListColumn = ({ list, onAddCard, onDeleteCard, onToggleTaskStatus, onDeleteList }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    // Submit handler for the modal
    const handleModalSubmit = (taskData) => {
        onAddCard(taskData); // Pass {title, description} up to TaskBoard's handler
        handleCloseModal();
    };

    return (
        <>
            {/* Column container - Make it non-draggable for now, focus on cards */}
            <div className="flex flex-col bg-slate-800/70 rounded-xl p-0 space-y-3 h-fit flex-shrink-0 w-72 shadow-lg border border-slate-700">
                {/* Header da coluna */}
                <div className="flex justify-between items-center p-4 pt-3 pb-1 rounded-t-xl">
                    <h2 className="text-white text-lg font-semibold">{list.title}</h2>
                    {/* Optional: Add delete list button if handler is provided */}
                    {onDeleteList && (
                         <button
                            onClick={() => onDeleteList(list.id)} // list.id is the listTitle
                            className="p-1 rounded hover:bg-red-600/70 text-gray-400 hover:text-white transition-colors"
                            aria-label="Deletar lista"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>

                {/* Area Droppable for tasks (cards) */}
                {/* droppableId is the listTitle */}
                <Droppable droppableId={list.id} type="CARD">
                    {(providedDroppable, snapshotDroppable) => (
                        <div
                            ref={providedDroppable.innerRef}
                            {...providedDroppable.droppableProps}
                            className={`space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] min-h-[60px] px-4 pb-1 custom-scrollbar rounded-b-md
                                        ${snapshotDroppable.isDraggingOver ? 'bg-slate-700/50' : 'bg-transparent'}`}
                        >
                            {/* Map over the tasks (cards) for this list */}
                            {list.cards && list.cards.map((task, cardIndex) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    index={cardIndex}
                                    onDeleteTask={onDeleteCard} // Pass delete handler
                                    onToggleTaskStatus={onToggleTaskStatus} // Pass toggle status handler
                                />
                            ))}
                            {providedDroppable.placeholder}
                        </div>
                    )}
                </Droppable>

                {/* Button to add a new task to this list */}
                <div className="p-4 pt-1">
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center justify-center p-2 w-full rounded-md mt-auto bg-slate-700/80 hover:bg-slate-600/90 text-gray-300 hover:text-white transition-colors"
                    >
                        <Plus size={18} className="mr-2" />
                        Adicionar Tarefa
                    </button>
                </div>
            </div>

            {/* Modal for creating a task */}
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleModalSubmit} // Submits {title, description}
            />
        </>
    );
};

export default ListColumn;

