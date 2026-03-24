import { generateId } from './utils.js';

const createStore = (init) => {
    let state = init();
    const listeners = new Set();
    
    const setState = (partial) => {
        const nextState = typeof partial === 'function' ? partial(state) : partial;
        state = { ...state, ...nextState };

        localStorage.setItem('quiet_todo_data', JSON.stringify({ todos: state.todos }));
        listeners.forEach(l => l(state));
    };

    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    return { getState: () => state, setState, subscribe };
};


const saved = JSON.parse(localStorage.getItem('quiet_todo_data')) || { todos: [] };

export const useStore = createStore(() => ({
    todos: saved.todos || [],
    filterCategory: 'all',
    searchTerm: '',
    
    addTodo: (data) => {
        const newTodo = {
            id: generateId(),
            completed: false,
            createdAt: Date.now(),
            ...data
        };
        useStore.setState((state) => ({ todos: [newTodo, ...state.todos] }));
    },

    updateTodo: (id, updates) => {
        useStore.setState((state) => ({
            todos: state.todos.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
    },

    deleteTodo: (id) => {
        useStore.setState((state) => ({
            todos: state.todos.filter(t => t.id !== id)
        }));
    },

    toggleTodo: (id) => {
        useStore.setState((state) => ({
            todos: state.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
        }));
    },

    setCategory: (cat) => useStore.setState({ filterCategory: cat }),
    setSearch: (term) => useStore.setState({ searchTerm: term.toLowerCase() })
}));
