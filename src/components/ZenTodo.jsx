import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Search, Download, Undo2, Sun, Moon } from 'lucide-react';

export default function ZenTodo() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const inputRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('zen-tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('zen-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Register service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('Service Worker registered for offline support');
      });
    }
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    setInstallPrompt(null);
  };

  const createTask = (text) => {
    if (!text.trim()) return;
    const newTask = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: null,
      recurrence: null,
      subtasks: [],
      tags: [],
    };
    setUndoStack([...undoStack, tasks]);
    setTasks([newTask, ...tasks]);
    setNewTaskInput('');
  };

  const deleteTask = (id) => {
    setUndoStack([...undoStack, tasks]);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleComplete = (id) => {
    setUndoStack([...undoStack, tasks]);
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setTasks(prev);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zen-tasks-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const filteredTasks = tasks.filter(task =>
    task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const todayTasks = focusMode
    ? filteredTasks.filter(t => {
        if (!t.dueDate) return true;
        const due = new Date(t.dueDate);
        const today = new Date();
        return due.toDateString() === today.toDateString();
      })
    : filteredTasks;

  const displayTasks = todayTasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50'
        : 'bg-gradient-to-br from-stone-50 via-white to-stone-50 text-slate-900'
    }`}>
      <style>{`
        * {
          font-family: 'Segoe UI', 'Helvetica Neue', system-ui, sans-serif;
        }

        body {
          margin: 0;
          padding: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .task-item {
          animation: slideIn 0.3s ease-out;
        }

        .smooth-transition {
          transition: all 0.2s ease-out;
        }

        input:focus {
          outline: none;
        }

        .zen-focus {
          box-shadow: 0 0 0 2px rgba(168, 162, 158, 0.1);
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight mb-1">Clarity</h1>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} font-light`}>
                Focus on what matters
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-full smooth-transition ${
                  darkMode
                    ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                    : 'bg-stone-200/50 hover:bg-stone-300/50 text-slate-700'
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={exportData}
                className={`p-2.5 rounded-full smooth-transition ${
                  darkMode
                    ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                    : 'bg-stone-200/50 hover:bg-stone-300/50 text-slate-700'
                }`}
              >
                <Download size={18} />
              </button>
              {undoStack.length > 0 && (
                <button
                  onClick={undo}
                  className={`p-2.5 rounded-full smooth-transition ${
                    darkMode
                      ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                      : 'bg-stone-200/50 hover:bg-stone-300/50 text-slate-700'
                  }`}
                >
                  <Undo2 size={18} />
                </button>
              )}
              {showInstallButton && (
                <button
                  onClick={handleInstallClick}
                  className={`px-3 py-2.5 rounded-full font-light text-sm smooth-transition ${
                    darkMode
                      ? 'bg-slate-600 hover:bg-slate-500 text-slate-100'
                      : 'bg-stone-400 hover:bg-stone-500 text-white'
                  }`}
                >
                  Install
                </button>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') createTask(newTaskInput);
              }}
              placeholder="Add a task..."
              className={`w-full px-4 py-3 rounded-xl font-light text-base smooth-transition zen-focus border-0 ${
                darkMode
                  ? 'bg-slate-700/40 text-slate-50 placeholder-slate-500'
                  : 'bg-stone-100/80 text-slate-900 placeholder-slate-400'
              }`}
            />
            <div className="flex gap-3">
              <button
                onClick={() => createTask(newTaskInput)}
                className={`flex-1 py-2.5 rounded-lg font-light smooth-transition flex items-center justify-center gap-2 ${
                  darkMode
                    ? 'bg-slate-700/60 hover:bg-slate-600 text-slate-100'
                    : 'bg-stone-300/60 hover:bg-stone-400 text-slate-900'
                }`}
              >
                <Plus size={18} /> Add Task
              </button>
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`px-4 py-2.5 rounded-lg font-light smooth-transition ${
                  focusMode
                    ? (darkMode
                        ? 'bg-slate-600 text-slate-100'
                        : 'bg-stone-400 text-white')
                    : (darkMode
                        ? 'bg-slate-700/40 hover:bg-slate-700/60 text-slate-300'
                        : 'bg-stone-200/40 hover:bg-stone-200/60 text-slate-700')
                }`}
              >
                {focusMode ? 'Focus' : 'All'}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className={`absolute left-3 top-3.5 ${
              darkMode ? 'text-slate-500' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or filter by tag..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg font-light text-sm smooth-transition zen-focus border-0 ${
                darkMode
                  ? 'bg-slate-700/30 text-slate-50 placeholder-slate-500'
                  : 'bg-stone-100/50 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {displayTasks.length === 0 ? (
            <div className={`text-center py-16 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <p className="font-light text-lg">All clear</p>
              <p className="text-sm font-light mt-1">Your mind is free</p>
            </div>
          ) : (
            displayTasks.map(task => (
              <div
                key={task.id}
                className={`task-item group p-4 rounded-lg smooth-transition cursor-pointer ${
                  darkMode
                    ? `${task.completed ? 'bg-slate-800/30' : 'bg-slate-700/40 hover:bg-slate-700/60'}`
                    : `${task.completed ? 'bg-stone-100/30' : 'bg-stone-100/60 hover:bg-stone-200/60'}`
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    className="mt-1 w-5 h-5 rounded-full cursor-pointer smooth-transition accent-slate-500"
                  />
                  <div
                    className="flex-1 min-w-0"
                    onDoubleClick={() => {
                      setEditingId(task.id);
                      setEditText(task.text);
                    }}
                  >
                    {editingId === task.id ? (
                      <input
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateTask(task.id, { text: editText });
                            setEditingId(null);
                          }
                        }}
                        onBlur={() => {
                          updateTask(task.id, { text: editText });
                          setEditingId(null);
                        }}
                        className={`w-full bg-transparent font-light text-base border-0 border-b-2 smooth-transition ${
                          darkMode
                            ? 'text-slate-50 border-slate-600'
                            : 'text-slate-900 border-stone-300'
                        }`}
                      />
                    ) : (
                      <p className={`font-light text-base leading-relaxed break-words ${
                        task.completed
                          ? (darkMode ? 'text-slate-500 line-through' : 'text-slate-400 line-through')
                          : (darkMode ? 'text-slate-100' : 'text-slate-900')
                      }`}>
                        {task.text}
                      </p>
                    )}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {task.tags.map(tag => (
                          <span
                            key={tag}
                            className={`text-xs font-light px-2 py-0.5 rounded-full ${
                              darkMode
                                ? 'bg-slate-600/40 text-slate-300'
                                : 'bg-stone-200/60 text-slate-600'
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {task.dueDate && (
                      <p className={`text-xs font-light mt-2 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className={`p-2 rounded-lg smooth-transition opacity-0 group-hover:opacity-100 ${
                      darkMode
                        ? 'hover:bg-slate-600 text-slate-400 hover:text-slate-200'
                        : 'hover:bg-stone-300 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className={`mt-12 pt-8 border-t text-xs font-light ${
          darkMode ? 'border-slate-700 text-slate-500' : 'border-stone-200 text-slate-400'
        }`}>
          <p className="mb-2">Shortcuts:</p>
          <div className="space-y-1 text-xs">
            <p>• <kbd>Enter</kbd> to add task</p>
            <p>• Double-click to edit</p>
            <p>• Click to complete</p>
            <p>• Focus Mode shows only today's tasks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
