import { useStore } from './store.js';
import { categories, priorities, getCalendarDays } from './utils.js';

export const Sidebar = () => {
    const { todos, filterCategory, searchTerm } = useStore.getState();
    const isOverviewExpanded = window.isOverviewExpanded ?? false;

    const filtered = todos.filter(t => {
        const matchesCat = filterCategory === 'all' || t.category === filterCategory;
        const matchesSearch = t.title.toLowerCase().includes(searchTerm);
        return matchesCat && matchesSearch;
    });

    return `
        <div class="flex-1 flex flex-col bg-white rounded-3xl border border-[#E8E4DE] shadow-sm overflow-hidden h-full">
            <div class="p-6 border-b border-[#F2EFED]">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl bg-[#9DBF9E] flex items-center justify-center text-white shadow-inner">
                            <i data-lucide="check-circle-2"></i>
                        </div>
                        <h1 class="font-bold text-lg tracking-tight">Quiet</h1>
                    </div>
                    <button onclick="window.dispatch('TOGGLE_SIDEBAR')" class="md:hidden p-2 text-gray-400">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                
                <div class="relative mb-6">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"></i>
                    <input type="text" placeholder="Search tasks..." value="${searchTerm}"
                        oninput="window.dispatch('SEARCH', this.value)"
                        class="w-full pl-9 pr-4 py-2.5 bg-[#FDFBF7] border border-transparent rounded-xl text-sm focus:border-[#9DBF9E] focus:bg-white transition-all outline-none" />
                </div>

                <nav class="space-y-1">
                    <div class="group">
                        <button onclick="window.dispatch('TOGGLE_OVERVIEW')" 
                            class="w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${filterCategory === 'all' ? 'bg-[#FDFBF7] text-[#4A443F] font-semibold' : 'text-gray-400 hover:bg-gray-50'}">
                            <div class="flex items-center gap-2">
                                <i data-lucide="${isOverviewExpanded ? 'chevron-down' : 'chevron-right'}" class="w-4 h-4"></i>
                                <span class="text-sm">Overview</span>
                            </div>
                            <span class="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">${todos.length}</span>
                        </button>
                        
                        <div id="category-collapse" class="mt-1 ml-4 space-y-1 border-l border-[#F2EFED] pl-2 overflow-hidden" style="height: ${isOverviewExpanded ? 'auto' : '0'};">
                            <button onclick="window.dispatch('SET_CAT', 'all')" 
                                class="w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${filterCategory === 'all' ? 'text-[#9DBF9E] font-bold' : 'text-gray-400 hover:text-gray-600'}">
                                <span>All Tasks</span>
                            </button>
                            ${categories.map(cat => `
                                <button onclick="window.dispatch('SET_CAT', '${cat.id}')" 
                                    class="w-full flex items-center justify-between p-2 rounded-lg transition-all ${filterCategory === cat.id ? 'bg-[#FDFBF7] text-[#4A443F] font-semibold' : 'text-gray-400 hover:bg-gray-50'}">
                                    <div class="flex items-center gap-2">
                                        <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${cat.color}"></div>
                                        <span class="text-xs">${cat.label}</span>
                                    </div>
                                    <span class="text-[9px] text-gray-400">${todos.filter(t => t.category === cat.id).length}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </nav>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                <div class="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-2 mb-2">Recent Tasks</div>
                ${filtered.length ? filtered.map(todo => `
                    <div class="todo-item p-3 rounded-2xl border border-gray-50 bg-[#FDFBF7]/40 flex items-start gap-3 group transition-all">
                        <div class="relative mt-1">
                            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                                onchange="window.dispatch('TOGGLE_TODO', {id: '${todo.id}', event: event})"
                                class="peer appearance-none w-4 h-4 rounded-full border border-gray-300 checked:bg-[#9DBF9E] checked:border-transparent cursor-pointer transition-all">
                            <i data-lucide="check" class="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none"></i>
                        </div>
                        <div class="flex-1 min-w-0" onclick="window.dispatch('SHOW_DAY', '${todo.dueDate}')">
                            <p class="text-xs leading-snug ${todo.completed ? 'line-through text-gray-300' : 'text-gray-700'} truncate font-medium">${todo.title}</p>
                            <p class="text-[9px] text-gray-400 mt-1 uppercase tracking-wider">${dayjs(todo.dueDate).format('MMM D')}</p>
                        </div>
                    </div>
                `).join('') : '<div class="text-center py-10"><p class="text-[11px] text-gray-300 italic">No matches found</p></div>'}
            </div>
        </div>
    `;
};

export const QuickAdd = () => {
    return `
        <div class="bg-white p-4 rounded-3xl border border-[#E8E4DE] shadow-sm">
            <form id="todo-form" class="flex flex-col md:flex-row gap-3 items-center" onsubmit="window.dispatch('ADD_TODO', event)">
                <input name="title" required placeholder="Plant a new seed (Add todo)..." 
                    class="flex-1 w-full px-5 py-3 bg-[#FDFBF7] rounded-2xl text-sm border-transparent focus:ring-1 focus:ring-[#9DBF9E]/30" />
                
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <select name="category" class="bg-[#FDFBF7] border-none text-xs rounded-xl px-4 py-3 cursor-pointer outline-none">
                        ${categories.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
                    </select>
                    <select name="priority" class="bg-[#FDFBF7] border-none text-xs rounded-xl px-4 py-3 cursor-pointer outline-none">
                        ${priorities.map(p => `<option value="${p.id}">${p.label}</option>`).join('')}
                    </select>
                    <input name="dueDate" type="date" value="${dayjs().format('YYYY-MM-DD')}" 
                        class="bg-[#FDFBF7] border-none text-xs rounded-xl px-4 py-3 outline-none" />
                    <button type="submit" class="bg-[#4A443F] text-white p-3 rounded-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-md">
                        <i data-lucide="plus" class="w-5 h-5"></i>
                    </button>
                </div>
            </form>
        </div>
    `;
};

export const Calendar = () => {
    const { todos } = useStore.getState();
    const days = getCalendarDays(new Date());
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return `
        <div class="h-full flex flex-col">
            <div class="px-6 py-4 flex items-center justify-between border-b border-[#F2EFED] bg-white">
                <div class="flex items-center gap-3">
                    <button onclick="window.dispatch('TOGGLE_SIDEBAR')" class="md:hidden p-2 bg-[#FDFBF7] rounded-lg">
                        <i data-lucide="menu" class="w-4 h-4"></i>
                    </button>
                    <h2 class="font-bold text-lg">${dayjs().format('MMMM YYYY')}</h2>
                </div>
                <div class="flex gap-4">
                   <div class="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-widest">
                       <span class="w-2 h-2 rounded-full bg-[#9DBF9E]"></span> Done
                   </div>
                   <div class="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-widest">
                       <span class="w-2 h-2 rounded-full bg-[#D4A373]"></span> To Do
                   </div>
                </div>
            </div>
            
            <div class="grid grid-cols-7 bg-[#FDFBF7]/50">
                ${weekdays.map(d => `<div class="text-center py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">${d}</div>`).join('')}
            </div>

            <div class="flex-1 calendar-grid">
                ${days.map(day => {
                    const dateStr = day.format('YYYY-MM-DD');
                    const dayTodos = todos.filter(t => t.dueDate === dateStr);
                    const isToday = day.isSame(dayjs(), 'day');
                    const isCurrentMonth = day.isSame(dayjs(), 'month');
                    const tooltipText = dayTodos.length > 0 ? dayTodos.map(t => `${t.completed ? '✓' : '•'} ${t.title}`).join('\\\\n') : 'No tasks';

                    return `
                        <div onclick="window.dispatch('SHOW_DAY', '${dateStr}')" 
                             onmouseenter="window.dispatch('HOVER_DATE', {e: event, text: '${tooltipText.replace(/'/g, "\\'")}'})"
                             onmouseleave="window.dispatch('HOVER_OUT')"
                             class="day-cell p-2 flex flex-col gap-1 cursor-pointer relative overflow-hidden group transition-colors ${isCurrentMonth ? '' : 'bg-gray-50/30 opacity-30'}">
                            <div class="flex justify-between items-start">
                                <span class="text-[11px] font-bold ${isToday ? 'bg-[#9DBF9E] text-white w-5 h-5 flex items-center justify-center rounded-full' : 'text-gray-400 group-hover:text-gray-600'}">
                                    ${day.date()}
                                </span>
                            </div>
                            <div class="flex flex-wrap gap-1 mt-auto pb-1">
                                ${dayTodos.slice(0, 4).map(t => `
                                    <div class="w-1.5 h-1.5 rounded-full transition-all transform group-hover:scale-125 ${t.completed ? 'bg-[#9DBF9E]' : 'bg-[#D4A373]'}"></div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
};

export const DayDetail = (date) => {
    const { todos } = useStore.getState();
    const dayTodos = todos.filter(t => t.dueDate === date);

    return `
        <div class="flex flex-col h-full bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden border border-[#E8E4DE]/50">
            <div class="p-8 flex items-center justify-between border-b border-[#F2EFED] bg-[#FDFBF7]/50">
                <div class="flex items-center gap-5">
                    <button onclick="window.dispatch('CLOSE_DETAIL')" class="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#E8E4DE] hover:bg-gray-50 flex items-center justify-center transition-all hover:-translate-x-1">
                        <i data-lucide="arrow-left" class="w-5 h-5"></i>
                    </button>
                    <div>
                        <h2 class="text-2xl font-bold text-[#4A443F]">${dayjs(date).format('MMMM D, YYYY')}</h2>
                        <p class="text-xs text-[#9DBF9E] font-bold uppercase tracking-[0.2em] mt-1">${dayjs(date).format('dddd')}</p>
                    </div>
                </div>
            </div>
            
            <div class="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div class="max-w-2xl mx-auto space-y-4">
                    ${dayTodos.length ? dayTodos.map(todo => `
                        <div class="flex items-center gap-5 p-5 rounded-3xl bg-[#FDFBF7] border border-[#E8E4DE]/40 group hover:shadow-md transition-all">
                            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                                onchange="window.dispatch('TOGGLE_TODO', {id: '${todo.id}', event: event})"
                                class="w-6 h-6 rounded-full border-2 border-gray-200 checked:bg-[#9DBF9E] cursor-pointer appearance-none relative checked:after:content-['✓'] after:absolute after:text-white after:left-1 after:top-0 after:text-xs">
                            <div class="flex-1">
                                <h4 class="text-lg font-semibold ${todo.completed ? 'line-through text-gray-300' : ''}">${todo.title}</h4>
                            </div>
                            <button onclick="window.dispatch('DELETE_TODO', '${todo.id}')" class="opacity-0 group-hover:opacity-100 p-2 text-rose-300 hover:text-rose-500">
                                <i data-lucide="trash-2" class="w-5 h-5"></i>
                            </button>
                        </div>
                    `).join('') : '<p class="text-center py-20 text-gray-300">Quiet day.</p>'}
                </div>
            </div>
        </div>
    `;
};

export const StatsButton = () => `
    <button id="stats-btn" onclick="window.dispatch('TOGGLE_STATS')" 
        class="bg-[#4A443F] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:bg-black transition-all hover:scale-110 active:scale-95">
        <i data-lucide="bar-chart-2"></i>
    </button>
`;

export const StatsModal = () => {
    const { todos } = useStore.getState();
    const completed = todos.filter(t => t.completed).length;
    const pending = todos.length - completed;
    const categoriesCount = categories.map(c => ({
        label: c.label,
        count: todos.filter(t => t.category === c.id).length
    }));

    return `
        <div class="bg-white/95 backdrop-blur-md rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col pointer-events-auto border border-[#E8E4DE]/50">
            <div class="p-8 border-b border-[#F2EFED] flex justify-between items-center bg-[#FDFBF7]/50">
                <div>
                    <h2 class="text-2xl font-bold">Insights</h2>
                    <p class="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Your productivity seed growth</p>
                </div>
                <button onclick="window.dispatch('TOGGLE_STATS')" class="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto p-8 grid md:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-[#9DBF9E]/10 p-6 rounded-3xl">
                            <span class="text-xs font-bold text-[#9DBF9E] uppercase tracking-wider">Completed</span>
                            <div class="text-4xl font-black text-[#4A443F] mt-2">${completed}</div>
                        </div>
                        <div class="bg-[#D4A373]/10 p-6 rounded-3xl">
                            <span class="text-xs font-bold text-[#D4A373] uppercase tracking-wider">Remaining</span>
                            <div class="text-4xl font-black text-[#4A443F] mt-2">${pending}</div>
                        </div>
                    </div>
                    <div class="bg-[#FDFBF7] p-6 rounded-3xl border border-[#F2EFED]">
                        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">By Category</h4>
                        <div class="space-y-3">
                            ${categoriesCount.map(c => `
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-medium text-gray-600">${c.label}</span>
                                    <div class="flex-1 mx-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div class="h-full bg-[#9DBF9E]" style="width: ${todos.length ? (c.count / todos.length * 100) : 0}%"></div>
                                    </div>
                                    <span class="text-xs font-bold text-gray-400">${c.count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="bg-[#FDFBF7] p-6 rounded-3xl border border-[#F2EFED]">
                        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">By Priority</h4>
                        <div class="relative w-full aspect-square max-w-[200px] mx-auto">
                            <canvas id="statsChart2"></canvas>
                        </div>
                    </div>
                </div>
                <div class="space-y-6">
                    <div class="bg-[#FDFBF7] p-6 rounded-3xl border border-[#F2EFED]">
                        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">By Time (Last 6 Months)</h4>
                        <div class="relative w-full aspect-square max-w-[250px] mx-auto">
                            <canvas id="statsChart3"></canvas>
                        </div>
                    </div>
                    <div class="flex flex-col items-center justify-center bg-[#FDFBF7] rounded-[2rem] p-8 border border-[#F2EFED]">
                        <div class="relative w-full aspect-square max-w-[250px]">
                            <canvas id="statsChart1"></canvas>
                        </div>
                        <div class="mt-8 text-center">
                            <p class="text-sm text-gray-400 italic">"Small steps everyday lead to big results."</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
