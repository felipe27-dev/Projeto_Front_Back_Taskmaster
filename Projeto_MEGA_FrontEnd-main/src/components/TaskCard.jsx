// src/components/TaskCard.jsx
import React from 'react';
import { Trash2 } from 'react-feather';
import { Draggable } from 'react-beautiful-dnd'; // Or @hello-pangea/dnd

// Props updated: Added onToggleTaskStatus(taskId, currentStatus)
export default function TaskCard({ task, index, onDeleteTask, onToggleTaskStatus }) {
    if (!task) {
        return null;
    }

    // Styling based on status
    let statusClasses = 'bg-gray-500/30 text-gray-300'; // Default for safety
    let isDone = task.status === 'Done';
    if (isDone) {
        statusClasses = 'bg-green-500/30 text-green-300';
    } else { // Assumes 'To Do'
        statusClasses = 'bg-yellow-500/30 text-yellow-300';
    }

    // Draggable ID needs to be a string
    const draggableId = `card-${task.id}`;

    // Handler for clicking the status badge
    const handleStatusClick = (e) => {
        e.stopPropagation(); // Prevent card drag from starting on status click
        if (onToggleTaskStatus) {
            onToggleTaskStatus(task.id, task.status);
        }
    };

    return (
        <Draggable draggableId={draggableId} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-slate-700 rounded-lg shadow-md p-3 mb-3 text-sm border border-slate-600 hover:border-slate-500 transition-shadow
                                ${snapshot.isDragging ? 'shadow-xl ring-1 ring-neutral-50 transform scale-105' : 'shadow-md'}
                                ${isDone ? 'opacity-70' : ''}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        {/* Task title - strike through if done */}
                        <h3 className={`text-base font-semibold text-gray-100 break-words mr-2 ${isDone ? 'line-through' : ''}`}>{task.title}</h3>
                        {/* Delete button */}
                        {onDeleteTask && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} // Prevent drag start
                                className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-slate-600 flex-shrink-0"
                                aria-label="Deletar tarefa"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    {/* Task description */}
                    {task.description && (
                        <p className={`text-gray-300 text-xs mb-2 break-words ${isDone ? 'line-through' : ''}`}>{task.description}</p>
                    )}

                    {/* Task delivery date */}
                    {task.delivery_date && (
                        <p className="text-gray-400 text-xs mb-2">
                            Prazo: <span className="font-medium">{new Date(task.delivery_date).toLocaleDateString()}</span>
                        </p>
                    )}
                    <div className="flex gap-2 items-center">    
                    {/* Clickable Status Badge */}
                    {task.status && (
                        <div className="flex flex-wrap gap-2 mt-1">
                            <button
                                onClick={handleStatusClick}
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses} cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-white `}
                                aria-label={`Marcar como ${isDone ? 'To Do' : 'Done'}`}
                            >
                                {task.status}
                            </button>
                        </div>
                    )}
                    {task.priority && (
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-white 
                            ${
                                task.priority === 'alta'
                                ? 'bg-red-500 text-white'
                                : task.priority === 'normal'
                                ? 'bg-yellow-500 text-black'
                                : 'bg-green-500 text-white'
                            }`}
                        >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                    )}
                </div>
                </div>
            )}
        </Draggable>
    );
}

