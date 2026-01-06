import React, { useState, useEffect } from 'react';

export default function App() {
  const [lists, setLists] = useState([]);
  const [currentListId, setCurrentListId] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [recurFreq, setRecurFreq] = useState('none');
  const [recurTime, setRecurTime] = useState('06:00');
  const [events, setEvents] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('clarity-lists');
    if (saved) {
      const data = JSON.parse(saved);
      setLists(data);
      if (data.length > 0 && !currentListId) {
        setCurrentListId(data[0].id);
      }
    }

    const savedEvents = localStorage.getItem('clarity-events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('clarity-lists', JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem('clarity-events', JSON.stringify(events));
  }, [events]);

  // Service worker and install
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  // Event logging with full context
  const logEvent = (type, listName, taskName = '') => {
    let description = '';
    if (type === 'list_created') {
      description = `made new list "${listName}"`;
    } else if (type === 'task_added') {
      description = `added task "${taskName}" to list "${listName}"`;
    } else if (type === 'task_completed') {
      description = `completed task "${taskName}" from list "${listName}"`;
    } else if (type === 'task_deleted') {
      description = `deleted task "${taskName}" from list "${listName}"`;
    } else if (type === 'task_recycled') {
      description = `moved incomplete task "${taskName}" to list "${listName}"`;
    }

    const event = {
      id: Date.now(),
      type,
      description,
      timestamp: new Date().toISOString(),
      listName,
      taskName
    };
    setEvents([...events, event]);
  };

  const handleDownload = () => {
    if (installPrompt) {
      installPrompt.prompt();
    }
  };

  const createList = () => {
    if (!newListName.trim()) return;
    const newList = {
      id: Date.now().toString(),
      name: newListName,
      recurrence: recurFreq,
      scheduledTime: recurTime,
      dateCreated: new Date().toISOString(),
      tasks: []
    };
    setLists([...lists, newList]);
    setCurrentListId(newList.id);
    setNewListName('');
    setShowNewListForm(false);
    setRecurFreq('none');
    setRecurTime('06:00');

    logEvent('list_created', newListName);
  };

  const addTaskToList = () => {
    if (!newTaskText.trim() || !currentListId) return;

    const updatedLists = lists.map(list => {
      if (list.id === currentListId) {
        const newTask = {
          id: Date.now().toString(),
          text: newTaskText,
          completed: false,
          createdAt: new Date().toISOString()
        };
        logEvent('task_added', list.name, newTaskText);
        return { ...list, tasks: [...list.tasks, newTask] };
      }
      return list;
    });

    setLists(updatedLists);
    setNewTaskText('');
  };

  const toggleTaskCompletion = (listId, taskId) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          tasks: list.tasks.map(task => {
            if (task.id === taskId) {
              const newCompleted = !task.completed;
              if (newCompleted) {
                logEvent('task_completed', list.name, task.text);
              }
              return { ...task, completed: newCompleted };
            }
            return task;
          })
        };
      }
      return list;
    });
    setLists(updatedLists);
  };

  const deleteTask = (taskId) => {
    const currentList = lists.find(l => l.id === currentListId);
    const task = currentList?.tasks.find(t => t.id === taskId);
    
    const updatedLists = lists.map(list => {
      if (list.id === currentListId) {
        return {
          ...list,
          tasks: list.tasks.filter(t => t.id !== taskId)
        };
      }
      return list;
    });
    
    setLists(updatedLists);
    if (task && currentList) {
      logEvent('task_deleted', currentList.name, task.text);
    }
  };

  const getIncompleteTasksFromOtherLists = () => {
    const incomplete = [];
    lists.forEach(list => {
      if (list.id !== currentListId) {
        list.tasks.forEach(task => {
          if (!task.completed) {
            incomplete.push({
              ...task,
              fromList: list.name,
              fromListId: list.id
            });
          }
        });
      }
    });
    return incomplete;
  };

  const completeIncompleteTask = (fromListId, taskId) => {
    const updatedLists = lists.map(list => {
      if (list.id === fromListId) {
        return {
          ...list,
          tasks: list.tasks.map(task => {
            if (task.id === taskId) {
              logEvent('task_completed', list.name, task.text);
              return { ...task, completed: true };
            }
            return task;
          })
        };
      }
      return list;
    });
    setLists(updatedLists);
  };

  const addIncompleteTaskHere = (task) => {
    if (!currentListId) return;
    const currentList = lists.find(l => l.id === currentListId);
    
    const updatedLists = lists.map(list => {
      if (list.id === currentListId) {
        const newTask = {
          id: Date.now().toString(),
          text: task.text,
          completed: false,
          createdAt: new Date().toISOString()
        };
        logEvent('task_recycled', list.name, task.text);
        return { ...list, tasks: [...list.tasks, newTask] };
      }
      return list;
    });
    setLists(updatedLists);
  };

  const currentList = lists.find(l => l.id === currentListId);
  const incompleteFromOthers = getIncompleteTasksFromOtherLists();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #faf9f6 0%, #f8f7f4 100%)',
      color: '#3a3a36',
      fontFamily: '"Noto Serif", Georgia, serif',
      padding: '40px 30px',
      maxWidth: '700px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Subtle wave pattern background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        opacity: 0.02,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Cpath fill='none' stroke='%239aafa9' stroke-width='1' d='M0 50 Q50 30 100 50 T200 50 T300 50 T400 50 M0 100 Q50 80 100 100 T200 100 T300 100 T400 100 M0 150 Q50 130 100 150 T200 150 T300 150 T400 150 M0 200 Q50 180 100 200 T200 200 T300 200 T400 200 M0 250 Q50 230 100 250 T200 250 T300 250 T400 250'/%3E%3C/svg%3E")`,
        backgroundSize: '300px 300px',
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Download Button */}
        {installPrompt && (
          <button onClick={handleDownload} style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '0.85rem',
            background: '#9aafa9',
            color: '#faf9f6',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '0px',
            marginBottom: '40px',
            fontFamily: '"Noto Serif", Georgia, serif',
            fontWeight: '300',
            letterSpacing: '0.05em',
            transition: 'all 400ms ease',
            textTransform: 'lowercase'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#7a8f8a';
            e.target.style.letterSpacing = '0.1em';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#9aafa9';
            e.target.style.letterSpacing = '0.05em';
          }}>
            Download App
          </button>
        )}

        {/* Header */}
        <div style={{ marginBottom: '50px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: '300',
            margin: '0 0 8px 0',
            letterSpacing: '0.15em',
            color: '#3a3a36'
          }}>
            Clarity
          </h1>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: '300',
            color: '#9a9a94',
            margin: 0,
            letterSpacing: '0.1em',
            textTransform: 'lowercase'
          }}>
            Focus on what matters
          </p>
        </div>

        {/* Lists Navigation */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            borderBottom: '1px solid #ede9e2',
            paddingBottom: '10px',
            marginBottom: '16px',
            fontSize: '0.7rem',
            color: '#9a9a94',
            letterSpacing: '0.1em',
            textTransform: 'lowercase'
          }}>
            Your lists
          </div>

          {lists.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {lists.map(list => {
                const incompleteCount = list.tasks.filter(t => !t.completed).length;
                return (
                  <button
                    key={list.id}
                    onClick={() => setCurrentListId(list.id)}
                    style={{
                      padding: '10px 12px',
                      background: currentListId === list.id ? '#ede9e2' : 'transparent',
                      border: 'none',
                      borderBottom: currentListId === list.id ? '1px solid #9aafa9' : '1px solid transparent',
                      color: '#3a3a36',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      fontWeight: '300',
                      textAlign: 'left',
                      transition: 'all 400ms ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (currentListId !== list.id) {
                        e.target.style.background = 'rgba(154, 175, 169, 0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentListId !== list.id) {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    <span>{list.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#9a9a94' }}>
                      {list.recurrence !== 'none' ? `• ${list.recurrence}` : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <button
            onClick={() => setShowNewListForm(!showNewListForm)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'transparent',
              border: '1px solid #ede9e2',
              color: '#9a9a94',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              fontWeight: '300',
              transition: 'all 400ms ease',
              marginTop: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#9aafa9';
              e.target.style.color = '#9aafa9';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#ede9e2';
              e.target.style.color = '#9a9a94';
            }}
          >
            {showNewListForm ? 'Cancel' : '+ New'}
          </button>

          {showNewListForm && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: '#f8f7f4',
              borderLeft: '2px solid #9aafa9'
            }}>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#faf9f6',
                  border: '1px solid #ede9e2',
                  color: '#3a3a36',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  marginBottom: '12px',
                  boxSizing: 'border-box'
                }}
                onKeyPress={(e) => e.key === 'Enter' && createList()}
              />

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.7rem', color: '#9a9a94', display: 'block', marginBottom: '6px', textTransform: 'lowercase', letterSpacing: '0.05em' }}>
                  Repeat
                </label>
                <select
                  value={recurFreq}
                  onChange={(e) => setRecurFreq(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: '#faf9f6',
                    border: '1px solid #ede9e2',
                    color: '#3a3a36',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="none">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {recurFreq !== 'none' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.7rem', color: '#9a9a94', display: 'block', marginBottom: '6px', textTransform: 'lowercase', letterSpacing: '0.05em' }}>
                    Start time
                  </label>
                  <input
                    type="time"
                    value={recurTime}
                    onChange={(e) => setRecurTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#faf9f6',
                      border: '1px solid #ede9e2',
                      color: '#3a3a36',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              <button
                onClick={createList}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#9aafa9',
                  color: '#faf9f6',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  fontWeight: '300',
                  transition: 'background 400ms ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#7a8f8a'}
                onMouseLeave={(e) => e.target.style.background = '#9aafa9'}
              >
                Create
              </button>
            </div>
          )}
        </div>

        {/* Current List */}
        {currentList && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '1.4rem',
                fontWeight: '300',
                margin: '0 0 6px 0',
                color: '#3a3a36',
                letterSpacing: '0.02em'
              }}>
                {currentList.name}
              </h2>
              <p style={{
                fontSize: '0.75rem',
                color: '#9a9a94',
                margin: 0,
                letterSpacing: '0.05em',
                textTransform: 'lowercase'
              }}>
                {currentList.recurrence !== 'none' ? `repeats ${currentList.recurrence} at ${currentList.scheduledTime}` : 'one-time'}
              </p>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add task..."
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: '#faf9f6',
                  border: '1px solid #ede9e2',
                  color: '#3a3a36',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit'
                }}
                onKeyPress={(e) => e.key === 'Enter' && addTaskToList()}
              />
              <button
                onClick={addTaskToList}
                style={{
                  padding: '8px 16px',
                  background: '#9aafa9',
                  color: '#faf9f6',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  fontWeight: '300',
                  transition: 'background 400ms ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#7a8f8a'}
                onMouseLeave={(e) => e.target.style.background = '#9aafa9'}
              >
                Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {currentList.tasks.length === 0 ? (
                <p style={{ color: '#d4cdc4', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0', fontStyle: 'italic' }}>
                  Nothing yet
                </p>
              ) : (
                currentList.tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '10px 12px',
                      background: task.completed ? 'rgba(154, 175, 169, 0.04)' : 'transparent',
                      border: '1px solid #ede9e2',
                      borderRadius: '0px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'all 300ms ease',
                      opacity: task.completed ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!task.completed) {
                        e.target.style.background = 'rgba(154, 175, 169, 0.03)';
                        e.target.style.borderColor = '#b5cac7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = task.completed ? 'rgba(154, 175, 169, 0.04)' : 'transparent';
                      e.target.style.borderColor = '#ede9e2';
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(currentList.id, task.id)}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px',
                        accentColor: '#9aafa9'
                      }}
                    />
                    <span style={{
                      flex: 1,
                      color: task.completed ? '#9a9a94' : '#3a3a36',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      fontSize: '0.9rem',
                      fontWeight: '300'
                    }}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={{
                        padding: '4px 8px',
                        background: 'transparent',
                        border: '1px solid #ede9e2',
                        color: '#9a9a94',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontFamily: 'inherit',
                        fontWeight: '300',
                        transition: 'all 300ms ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#c4a5a0';
                        e.target.style.color = '#c4a5a0';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#ede9e2';
                        e.target.style.color = '#9a9a94';
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Incomplete from Other Lists */}
        {incompleteFromOthers.length > 0 && (
          <div style={{
            marginBottom: '40px',
            padding: '20px',
            background: 'rgba(181, 202, 199, 0.08)',
            borderLeft: '2px solid #9aafa9'
          }}>
            <h3 style={{
              fontSize: '0.7rem',
              color: '#9a9a94',
              margin: '0 0 14px 0',
              fontWeight: '300',
              textTransform: 'lowercase',
              letterSpacing: '0.1em'
            }}>
              From other lists
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {incompleteFromOthers.map(task => (
                <div
                  key={task.id}
                  style={{
                    padding: '10px 12px',
                    background: '#faf9f6',
                    border: '1px solid #ede9e2',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <div>
                    <p style={{
                      margin: '0 0 4px 0',
                      color: '#3a3a36',
                      fontSize: '0.85rem',
                      fontWeight: '300'
                    }}>
                      {task.text}
                    </p>
                    <p style={{
                      margin: 0,
                      color: '#9a9a94',
                      fontSize: '0.7rem',
                      letterSpacing: '0.05em',
                      textTransform: 'lowercase'
                    }}>
                      {task.fromList}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => completeIncompleteTask(task.fromListId, task.id)}
                      style={{
                        padding: '6px 10px',
                        background: 'transparent',
                        border: '1px solid #9aafa9',
                        color: '#9aafa9',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        fontFamily: 'inherit',
                        fontWeight: '300',
                        whiteSpace: 'nowrap',
                        transition: 'all 300ms ease',
                        textTransform: 'lowercase',
                        letterSpacing: '0.05em'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#9aafa9';
                        e.target.style.color = '#faf9f6';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#9aafa9';
                      }}
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => addIncompleteTaskHere(task)}
                      style={{
                        padding: '6px 10px',
                        background: 'transparent',
                        border: '1px solid #9aafa9',
                        color: '#9aafa9',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        fontFamily: 'inherit',
                        fontWeight: '300',
                        whiteSpace: 'nowrap',
                        transition: 'all 300ms ease',
                        textTransform: 'lowercase',
                        letterSpacing: '0.05em'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#9aafa9';
                        e.target.style.color = '#faf9f6';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#9aafa9';
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr style={{
          border: 'none',
          borderTop: '1px solid #ede9e2',
          margin: '40px 0'
        }} />

        <p style={{
          fontSize: '0.7rem',
          color: '#9a9a94',
          textAlign: 'center',
          margin: 0,
          fontWeight: '300',
          letterSpacing: '0.05em',
          textTransform: 'lowercase'
        }}>
          Clarity
        </p>
      </div>
    </div>
  );
}