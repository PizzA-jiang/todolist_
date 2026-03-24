import { useStore } from './store.js';
import { Sidebar, QuickAdd, Calendar, DayDetail, StatsModal, StatsButton } from './components.js';

window.isOverviewExpanded = false;

const render = () => {
    document.getElementById('sidebar-container').innerHTML = Sidebar();
    document.getElementById('quick-add-container').innerHTML = QuickAdd();
    document.getElementById('calendar-container').innerHTML = Calendar();
    document.getElementById('stats-trigger-container').innerHTML = StatsButton();
    lucide.createIcons();
};

window.dispatch = (action, payload) => {
    switch(action) {
        case 'ADD_TODO':
            payload.preventDefault();
            const fd = new FormData(payload.target);
            if (!fd.get('title').trim()) return;
            
            const newTodo = {
                title: fd.get('title'),
                category: fd.get('category'),
                priority: fd.get('priority'),
                dueDate: fd.get('dueDate')
            };
            useStore.getState().addTodo(newTodo);
            payload.target.reset();
            render();
            // Animate the new todo item
            setTimeout(() => {
                const todoItems = document.querySelectorAll('.todo-item');
                if (todoItems.length > 0) {
                    const newItem = todoItems[0]; // Assuming new one is first
                    gsap.fromTo(newItem, 
                        { opacity: 0, y: -20, scale: 0.9 },
                        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.2)" }
                    );
                }
            }, 50);
            break;

        case 'TOGGLE_TODO':
            const { id, event } = payload;
            const isChecking = event.target.checked;
            
            if (isChecking) {
                animateCompletion(event.target);
            }
            
            useStore.getState().toggleTodo(id);
            render();
            if (window.activeDate) refreshOverlay();
            break;

        case 'DELETE_TODO':
            useStore.getState().deleteTodo(payload);
            render();
            if (window.activeDate) refreshOverlay();
            break;

        case 'SET_CAT':
            useStore.getState().setCategory(payload);
            render();
            break;

        case 'SEARCH':
            useStore.getState().setSearch(payload);
            render();
            break;

        case 'TOGGLE_SIDEBAR':
            document.getElementById('sidebar-container').classList.toggle('sidebar-active');
            break;

        case 'TOGGLE_OVERVIEW':
            window.isOverviewExpanded = !window.isOverviewExpanded;
            render();
            const collapseEl = document.getElementById('category-collapse');
            if (window.isOverviewExpanded) {
                gsap.fromTo(collapseEl, 
                    { height: 0 },
                    { height: 'auto', duration: 0.6, ease: "back.out(1.7)" }
                );
            } else {
                gsap.to(collapseEl, {
                    height: 0,
                    duration: 0.4,
                    ease: "power2.in"
                });
            }
            break;

        case 'SHOW_DAY':
            window.activeDate = payload;
            const container = document.getElementById('overlay-container');
            container.innerHTML = DayDetail(payload);
            container.classList.add('overlay-visible');
            
            gsap.fromTo(container, 
                { y: '100%', opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.2)" }
            );
            lucide.createIcons();
            break;

        case 'CLOSE_DETAIL':
            window.activeDate = null;
            const ov = document.getElementById('overlay-container');
            gsap.to(ov, {
                y: '100%',
                opacity: 0,
                scale: 0.9,
                duration: 0.5,
                ease: "expo.in",
                onComplete: () => {
                    ov.classList.remove('overlay-visible');
                    ov.innerHTML = '';
                }
            });
            break;

        case 'TOGGLE_STATS':
            const modal = document.getElementById('stats-modal-container');
            if (modal.classList.contains('pointer-events-none')) {
                modal.innerHTML = StatsModal();
                modal.classList.remove('pointer-events-none');
                gsap.to(modal, { opacity: 1, duration: 0.3 });
                gsap.fromTo(modal.firstElementChild, 
                    { scale: 0.8, y: 50, opacity: 0 },
                    { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.4)" }
                );
                renderCharts();
            } else {
                gsap.to(modal.firstElementChild, { 
                    scale: 0.8, y: 50, opacity: 0, duration: 0.4, ease: "expo.in",
                    onComplete: () => {
                        modal.classList.add('pointer-events-none');
                        modal.style.opacity = 0;
                        modal.innerHTML = '';
                    }
                });
            }
            lucide.createIcons();
            break;

        case 'HOVER_DATE':
            if (!payload.text) return;
            const tooltip = document.getElementById('calendar-tooltip');
            tooltip.innerHTML = payload.text.replace(/\\n/g, '<br>');
            tooltip.style.left = (payload.e.clientX + 15) + 'px';
            tooltip.style.top = (payload.e.clientY + 15) + 'px';
            tooltip.style.opacity = '1';
            break;

        case 'HOVER_OUT':
            document.getElementById('calendar-tooltip').style.opacity = '0';
            break;
    }
};

const animateCompletion = (el) => {
    const rect = el.getBoundingClientRect();
    const target = document.getElementById('stats-btn')?.getBoundingClientRect();
    if (!target) return;

    const particle = document.getElementById('fly-particle');
    gsap.set(particle, { 
        x: rect.left, 
        y: rect.top, 
        opacity: 1, 
        scale: 1,
        backgroundColor: '#9DBF9E'
    });

    gsap.to(particle, {
        x: target.left + target.width/2,
        y: target.top + target.height/2,
        scale: 0.2,
        opacity: 0.5,
        duration: 0.8,
        ease: "back.in(1.7)",
        onComplete: () => {
            gsap.set(particle, { opacity: 0 });
            gsap.fromTo('#stats-btn', { scale: 1 }, { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1 });
        }
    });
};

const renderCharts = () => {
    const { todos } = useStore.getState();
    const ctx1 = document.getElementById('statsChart1')?.getContext('2d');
    const ctx2 = document.getElementById('statsChart2')?.getContext('2d');
    const ctx3 = document.getElementById('statsChart3')?.getContext('2d');
    if (!ctx1 || !ctx2 || !ctx3) return;

    // By Category
    const catData = {};
    todos.forEach(t => {
        catData[t.category] = (catData[t.category] || 0) + 1;
    });
    new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: Object.keys(catData),
            datasets: [{
                data: Object.values(catData),
                backgroundColor: ['#9DBF9E', '#D4A373', '#A2B9C8', '#D8A7B1', '#E8E4DE'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // By Priority
    const priData = {};
    todos.forEach(t => {
        priData[t.priority] = (priData[t.priority] || 0) + 1;
    });
    new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: Object.keys(priData),
            datasets: [{
                data: Object.values(priData),
                backgroundColor: '#D4A373',
                borderWidth: 0
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // By Time (last 6 months)
    const timeData = {};
    const now = dayjs();
    for (let i = 5; i >= 0; i--) {
        const month = now.subtract(i, 'month').format('MMM YYYY');
        timeData[month] = 0;
    }
    todos.forEach(t => {
        const month = dayjs(t.dueDate).format('MMM YYYY');
        if (timeData[month] !== undefined) {
            timeData[month]++;
        }
    });
    new Chart(ctx3, {
        type: 'line',
        data: {
            labels: Object.keys(timeData),
            datasets: [{
                data: Object.values(timeData),
                backgroundColor: '#A2B9C8',
                borderColor: '#A2B9C8',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
};

const refreshOverlay = () => {
    const container = document.getElementById('overlay-container');
    if (container.classList.contains('overlay-visible')) {
        container.innerHTML = DayDetail(window.activeDate);
        lucide.createIcons();
    }
};

render();
