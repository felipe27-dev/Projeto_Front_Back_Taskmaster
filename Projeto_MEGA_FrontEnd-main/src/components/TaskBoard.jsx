// src/components/TaskBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AddList from './AddList'; // Will be used again
import ListColumn from './ListColumn';
import { DragDropContext } from 'react-beautiful-dnd'; // Droppable for columns might be needed if columns themselves are draggable
import { Plus } from 'react-feather'; // For Add List button
import loginVideo from '../assets/logo_animation.mp4';

// Define the base URL for the API
const API_URL =  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'; // Adjust based on your backend setup
console.log("API URL:", API_URL); // Debugging line to check the API URL



export default function TaskBoard() {
    const [tasks, setTasks] = useState([]);
    // State to manage the distinct list titles, derived from tasks or managed separately
    const [listTitles, setListTitles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showVideo, setShowVideo] = useState(true); // State to control video visibility

    // Function to fetch tasks from the backend
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/tasks`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const fetchedTasks = Array.isArray(data) ? data : [];
            setTasks(fetchedTasks);

            // Derive unique list titles from fetched tasks, ensure 'Backlog' is present if no tasks exist
            const uniqueTitles = [...new Set(fetchedTasks.map(task => task.list_title))];
            if (uniqueTitles.length === 0) {
                setListTitles(['Backlog']); // Default list if empty
            } else {
                // Sort titles alphabetically, or maintain a specific order if needed later
                setListTitles(uniqueTitles.sort());
            }

        } catch (e) {
            console.error("Failed to fetch tasks:", e);
            setError("Falha ao carregar tarefas. Verifique se o backend está rodando.");
            setTasks([]);
            setListTitles(['Backlog']); // Default list on error
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch tasks when the component mounts
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // --- Generic API Update Function --- //
    const handleUpdateTask = async (taskId, updatedData) => {
        // Optimistic UI update
        const originalTasks = tasks;
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, ...updatedData } : task
            )
        );

        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const updatedTaskFromServer = await response.json();
            // Update local state with confirmed data from server
            setTasks(prevTasks =>
                prevTasks.map(task => (task.id === taskId ? updatedTaskFromServer : task))
            );
            return updatedTaskFromServer;
        } catch (e) {
            console.error("Failed to update task:", e);
            setError("Falha ao atualizar tarefa. Revertendo alteração.");
            // Revert optimistic update on failure
            setTasks(originalTasks);
            return null;
        }
    };

    // --- Specific Action Handlers --- //

    // Add a new task (Card) to a specific list
    const handleAddCard = async (listTitle, taskData) => {
        if (!taskData || !taskData.title || !taskData.title.trim()) return;

        const newTaskData = {
            ...taskData,
            list_title: listTitle, // Assign to the correct list
            status: 'To Do' // Default status for new tasks
        };

        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTaskData),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const createdTask = await response.json();
            setTasks(prevTasks => [...prevTasks, createdTask]);
            // If the list was newly created and empty, ensure its title is added
            if (!listTitles.includes(listTitle)) {
                setListTitles(prev => [...prev, listTitle].sort());
            }
        } catch (e) {
            console.error("Failed to create task:", e);
            setError("Falha ao criar tarefa.");
        }
    };

    // Delete a task (Card)
    const handleDeleteCard = async (taskId) => {
        const originalTasks = tasks;
        // Optimistic UI update
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if (!response.ok && response.status !== 404) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // If successful, state is already updated
            // Check if the list becomes empty and remove title if needed (optional)
            // const deletedTask = originalTasks.find(t => t.id === taskId);
            // if (deletedTask) {
            //     const remainingTasksInList = originalTasks.filter(t => t.id !== taskId && t.list_title === deletedTask.list_title);
            //     if (remainingTasksInList.length === 0 && listTitles.length > 1) { // Don't remove the last list
            //         setListTitles(prev => prev.filter(title => title !== deletedTask.list_title));
            //     }
            // }
        } catch (e) {
            console.error("Failed to delete task:", e);
            setError("Falha ao deletar tarefa. Revertendo alteração.");
            setTasks(originalTasks); // Revert UI update
        }
    };

    // Toggle task status ('To Do' <-> 'Done')
    const handleToggleTaskStatus = async (taskId, currentStatus) => {
        const newStatus = currentStatus === 'To Do' ? 'Done' : 'To Do';
        handleUpdateTask(taskId, { status: newStatus });
    };

    // Add a new list (Column)
    const handleAddList = (newListTitle) => {
        if (!newListTitle || !newListTitle.trim()) return;
        const normalizedTitle = newListTitle.trim();
        if (!listTitles.includes(normalizedTitle)) {
            setListTitles(prev => [...prev, normalizedTitle].sort());
            // Optionally, create a placeholder task or call a backend endpoint if managing lists separately
        } else {
            alert(`Lista "${normalizedTitle}" já existe.`);
        }
    };

    // --- Drag and Drop Logic --- //
    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return; // Dropped outside

        // Extract task ID (assuming format `card-${id}`)
        const taskId = parseInt(draggableId.replace('card-', ''), 10);
        const task = tasks.find(t => t.id === taskId);

        if (!task) return;

        const sourceListTitle = source.droppableId;
        const destinationListTitle = destination.droppableId;

        // --- Reordering within the same list --- //
        if (sourceListTitle === destinationListTitle) {
            if (source.index === destination.index) return; // Dropped in the same place

            const tasksInList = tasks.filter(t => t.list_title === sourceListTitle);
            const [reorderedTask] = tasksInList.splice(source.index, 1);
            tasksInList.splice(destination.index, 0, reorderedTask);

            // Update the main tasks state preserving order
            const otherTasks = tasks.filter(t => t.list_title !== sourceListTitle);
            setTasks([...otherTasks, ...tasksInList]);
            // Note: Persisting order within a list would require an 'order' field in the DB/API
            return;
        }

        // --- Moving to a different list --- //
        // Optimistic UI update:
        setTasks(prevTasks =>
            prevTasks.map(t =>
                t.id === taskId ? { ...t, list_title: destinationListTitle } : t
            )
        );

        // API call to update list_title
        handleUpdateTask(taskId, { list_title: destinationListTitle });
        // Status remains unchanged when moving lists
    };

    // --- Rendering Logic --- //

    if (loading) {
        return <div className="p-4 text-center">Carregando tarefas...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    // Group tasks by list_title for rendering columns
    const tasksByList = listTitles.reduce((acc, title) => {
        acc[title] = tasks.filter(task => task.list_title === title);
        // Optionally sort tasks within each list here (e.g., by creation date or a specific order field)
        // acc[title].sort((a, b) => new Date(a.criada_em) - new Date(b.criada_em)); // Example sort
        return acc;
    }, {});

    return (
            <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-4 p-4 overflow-x-auto h-full items-start">
                {listTitles.map((listTitle) => (
                    <ListColumn
                        key={listTitle}
                        // Pass list title and the filtered tasks for this list
                        list={{ id: listTitle, title: listTitle, cards: tasksByList[listTitle] || [] }}
                        // Pass API handlers
                        onAddCard={(taskData) => handleAddCard(listTitle, taskData)}
                        onDeleteCard={handleDeleteCard}
                        onToggleTaskStatus={handleToggleTaskStatus} // Pass the toggle handler
                        // onDeleteList could be added here if list deletion is implemented
                    />
                ))}
                {/* Component/Button to add a new list */}
                <div className="flex-shrink-0 w-72 pt-1"> {/* Align with top of columns */} 
                    <AddList onAddList={handleAddList} />
                </div>
            </div>
            {showVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    <video
                        src={loginVideo}
                        autoPlay
                        onEnded={() => setShowVideo(false)}
                        className="w-80 h-auto rounded-xl shadow-lg"
                    />
                </div>
            )}
            </DragDropContext>

    );
}

