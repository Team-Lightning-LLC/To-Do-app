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

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zen-tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('zen-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        console.log('Service Worker registered');
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
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayTasks = filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const bgColor = darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-stone-50 via-white to-stone-50';
  const textColor = darkMode ? 'text-slate-50' : 'text-slate-900';
  const secondaryText = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-700/40 text-slate-50 placeholder-slate-500' : 'bg-stone-100/80 text-slate-900 placeholder-slate-400';
  const buttonBg = darkMode ? 'bg-slate-700/60 hover:bg-slate-600 text-slate-100' : 'bg-stone-300/60 hover:bg-stone-400 text-slate-900';
  const taskItemBg = darkMode ? 'bg-slate-700/40 hover:bg-slate-700/60' : 'bg-stone-100/60 hover:bg-stone-200/60';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-500`}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight mb-1">Clarity</h1>
              <p className={`text-sm ${secondaryText} font-light`}>
                Focus on what matters
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-full transition-colors ${
                  darkMode
                    ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                    : 'bg-stone-200/50 hover:bg-stone-300/50 text-slate-700'
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={exportData}
                className={`p-2.5 rounded-full transition-colors ${
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
                  className={`p-2.5 rounded-full transition-colors ${
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
                  className={`px-3 py-2.5 rounded-lg font-light text-sm transition-colors ${
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
              className={`w-full px-4 py-3 rounded-xl font-light text-base transition-all border-0 focus:outline-none ${inputBg}`}
            />
            <div className="flex gap-3">
              <button
                onClick={() => createTask(newTaskInput)}
                className={`flex-1 py-2.5 rounded-lg font-light transition-colors flex items-center justify-center gap-2 ${buttonBg}`}
              >
                <Plus size={18} /> Add Task
              </button>
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`px-4 py-2.5 rounded-lg font-light transition-colors ${
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
              placeholder="Search tasks..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg font-light text-sm transition-all border-0 focus:outline-none ${
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
            <div className={`text-center py-16 ${secondaryText}`}>
              <p className="font-light text-lg">All clear</p>
              <p className="text-sm font-light mt-1">Your mind is free</p>
            </div>
          ) : (
            displayTasks.map(task => (
              <div
                key={task.id}
                className={`group p-4 rounded-lg transition-all cursor-pointer ${
                  task.completed
                    ? (darkMode ? 'bg-slate-800/30' : 'bg-stone-100/30')
                    : taskItemBg
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    className="mt-1 w-5 h-5 rounded-full cursor-pointer"
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
                        className={`w-full bg-transparent font-light text-base border-0 border-b-2 focus:outline-none ${
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
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
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

        {/* Footer */}
        <div className={`mt-12 pt-8 border-t text-xs font-light ${
          darkMode ? 'border-slate-700 text-slate-500' : 'border-stone-200 text-slate-400'
        }`}>
          <p className="mb-2">Shortcuts:</p>
          <div className="space-y-1 text-xs">
            <p>• Press Enter to add task</p>
            <p>• Double-click to edit</p>
            <p>• Click checkbox to complete</p>
          </div>
        </div>
      </div>
    </div>
  );
}