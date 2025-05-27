// src/components/TaskBoard.jsx (Corrigido - Loop de Renderização)
import React, { useState, useEffect, useCallback } from 'react';
import AddList from './AddList';
import ListColumn from './ListColumn';
import { DragDropContext } from 'react-beautiful-dnd';
import { Plus } from 'react-feather';
import loginVideo from '../assets/logo_animation.mp4';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log("API URL:", API_URL);

export default function TaskBoard({ currentSearchTerm, currentActiveFilters, isSearching, sidebarCollapsed }) {
    const [tasks, setTasks] = useState([]);
    const [listTitles, setListTitles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showVideo, setShowVideo] = useState(true);

    const buildFilterUrl = useCallback(() => {
        const params = new URLSearchParams();
        if (currentSearchTerm && currentSearchTerm.trim() !== '') {
            params.append('search', currentSearchTerm);
        }
        if (currentActiveFilters.status) {
            params.append('status', currentActiveFilters.status);
        }
        if (currentActiveFilters.priority) {
            params.append('priority', currentActiveFilters.priority);
        }
        const queryString = params.toString();
        return queryString ? `${API_URL}/tasks?${queryString}` : `${API_URL}/tasks`;
    }, [currentSearchTerm, currentActiveFilters]);

    // fetchTasks agora depende apenas de buildFilterUrl (que depende dos filtros)
    // Removido listTitles da dependência para evitar loop
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = buildFilterUrl();
            console.log("🔍 Buscando tarefas com URL:", url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const fetchedTasks = Array.isArray(data) ? data : [];
            console.log(`✅ ${fetchedTasks.length} tarefas encontradas`);
            setTasks(fetchedTasks);

            // Atualiza listTitles usando a forma funcional para não precisar de listTitles como dependência
            const uniqueTitles = [...new Set(fetchedTasks.map(task => task.list_title))];
            setListTitles(prevListTitles => {
                const currentTitles = new Set(prevListTitles);
                uniqueTitles.forEach(title => currentTitles.add(title));
                // Garante que 'Backlog' exista se não houver títulos
                if (currentTitles.size === 0) {
                    currentTitles.add('Backlog');
                }
                return [...currentTitles].sort();
            });

        } catch (e) {
            console.error("Failed to fetch tasks:", e);
            setError("Falha ao carregar tarefas. Verifique a conexão ou o backend."); 
            setTasks([]);
            // Em caso de erro, garante que 'Backlog' exista se não houver títulos
            setListTitles(prev => prev.length === 0 ? ['Backlog'] : prev);
        } finally {
            setLoading(false);
        }
    // Removido listTitles das dependências
    }, [buildFilterUrl]); 

    // Busca inicial - Depende de fetchTasks. fetchTasks só muda se buildFilterUrl mudar (filtros mudarem)
    // Este hook agora só roda na montagem inicial e se os filtros mudarem (o que é tratado pelo outro useEffect)
    // Para rodar apenas na montagem, podemos remover a dependência, mas é mais seguro mantê-la.
    useEffect(() => {
        console.log("Effect: Busca inicial ou fetchTasks mudou");
        fetchTasks();
    }, [fetchTasks]);

    // Busca quando filtros mudam (isSearching se torna false)
    // Depende de isSearching e fetchTasks. Se fetchTasks mudar (devido a buildFilterUrl), busca novamente.
    useEffect(() => {
        // Só busca se isSearching for explicitamente false (debounce terminou)
        if (isSearching === false) {
            console.log("Effect: isSearching é false, buscando tarefas...");
            fetchTasks();
        }
    }, [isSearching, fetchTasks]);

    // --- Funções de Manipulação de Tarefas (sem alterações significativas) --- 
    const handleUpdateTask = async (taskId, updatedData) => {
        const originalTasks = tasks;
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, ...updatedData } : task
            )
        );
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const updatedTaskFromServer = await response.json();
            setTasks(prevTasks =>
                prevTasks.map(task => (task.id === taskId ? updatedTaskFromServer : task))
            );
            return updatedTaskFromServer;
        } catch (e) {
            console.error("Failed to update task:", e);
            setError("Falha ao atualizar tarefa. Revertendo alteração.");
            setTasks(originalTasks);
            return null;
        }
    };

    const handleAddCard = async (listTitle, taskData) => {
        if (!taskData || !taskData.title || !taskData.title.trim()) return;
        const newTaskData = { ...taskData, list_title: listTitle, status: 'To Do' };
        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTaskData),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const createdTask = await response.json();
            setTasks(prevTasks => [...prevTasks, createdTask]);
            // Atualiza títulos usando forma funcional
            setListTitles(prev => {
                if (!prev.includes(listTitle)) {
                    return [...prev, listTitle].sort();
                }
                return prev;
            });
        } catch (e) {
            console.error("Failed to create task:", e);
            setError("Falha ao criar tarefa.");
        }
    };

    const handleDeleteCard = async (taskId) => {
        const originalTasks = tasks;
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 404) throw new Error(`HTTP error! status: ${response.status}`);
            // Opcional: Remover título da lista se ficar vazia (requer lógica mais complexa)
        } catch (e) {
            console.error("Failed to delete task:", e);
            setError("Falha ao deletar tarefa. Revertendo alteração.");
            setTasks(originalTasks);
        }
    };

    const handleToggleTaskStatus = async (taskId, currentStatus) => {
        const newStatus = currentStatus === 'To Do' ? 'Done' : 'To Do';
        handleUpdateTask(taskId, { status: newStatus });
    };

    const handleAddList = (newListTitle) => {
        if (!newListTitle || !newListTitle.trim()) return;
        const normalizedTitle = newListTitle.trim();
        // Atualiza títulos usando forma funcional
        setListTitles(prev => {
            if (!prev.includes(normalizedTitle)) {
                return [...prev, normalizedTitle].sort();
            }
            alert(`Lista "${normalizedTitle}" já existe.`);
            return prev;
        });
    };

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        const taskId = parseInt(draggableId.replace('card-', ''), 10);
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const sourceListTitle = source.droppableId;
        const destinationListTitle = destination.droppableId;
        if (sourceListTitle === destinationListTitle) {
            if (source.index === destination.index) return;
            const tasksInList = tasks.filter(t => t.list_title === sourceListTitle);
            const [reorderedTask] = tasksInList.splice(source.index, 1);
            tasksInList.splice(destination.index, 0, reorderedTask);
            const otherTasks = tasks.filter(t => t.list_title !== sourceListTitle);
            setTasks([...otherTasks, ...tasksInList]);
            return;
        }
        setTasks(prevTasks =>
            prevTasks.map(t =>
                t.id === taskId ? { ...t, list_title: destinationListTitle } : t
            )
        );
        handleUpdateTask(taskId, { list_title: destinationListTitle });
    };

    // --- Rendering Logic (sem alterações) --- //
    if (loading) {
        return <div className="p-4 text-center text-slate-400">Carregando tarefas...</div>;
    }
    if (error) {
        return <div className="p-4 text-center text-red-400">{error}</div>;
    }
    const hasActiveSearch = currentSearchTerm || currentActiveFilters.status || currentActiveFilters.priority;
    if (!loading && !error && tasks.length === 0 && hasActiveSearch) {
        return <div className="p-4 text-center text-slate-400">Nenhuma tarefa encontrada com os filtros aplicados.</div>;
    }
    const tasksByList = listTitles.reduce((acc, title) => {
        acc[title] = tasks.filter(task => task.list_title === title);
        return acc;
    }, {});

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-4 p-4 overflow-x-auto h-full items-start">
                {listTitles.map((listTitle) => (
                    <ListColumn
                        key={listTitle}
                        list={{ id: listTitle, title: listTitle, cards: tasksByList[listTitle] || [] }}
                        onAddCard={(taskData) => handleAddCard(listTitle, taskData)}
                        onDeleteCard={handleDeleteCard}
                        onToggleTaskStatus={handleToggleTaskStatus}
                    />
                ))}
                {/* Renderiza AddList apenas se houver títulos ou se não estiver vazio inicialmente */}
                {(listTitles.length > 0 || tasks.length === 0) && (
                    <div className="flex-shrink-0 w-72 pt-1">
                        <AddList onAddList={handleAddList} />
                    </div>
                )}
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
