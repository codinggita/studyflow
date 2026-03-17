import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, CheckCircle2, Circle, Clock, MoreVertical, Trash2, Edit, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

const Tasks = () => {
  const [searchParams] = useSearchParams();
  const subjectIdParam = searchParams.get('subjectId');

  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const limit = 10;

  const [newTask, setNewTask] = useState({
    title: '',
    subject: subjectIdParam || '',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState('All'); // All, Pending, Completed
  
  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchTasks();
  }, [currentPage, debouncedSearch, filter, subjectIdParam]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        setSubjects(res.data.data);
        if (!newTask.subject && res.data.data.length > 0) {
          setNewTask(prev => ({ ...prev, subject: res.data.data[0]._id }));
        }
      } catch (error) {
        console.error('Error fetching subjects', error);
      }
    };
    fetchSubjects();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        search: debouncedSearch,
        completed: filter === 'All' ? undefined : (filter === 'Completed' ? 'true' : 'false'),
        subject: subjectIdParam || undefined
      };
      
      const res = await api.get('/tasks', { params });
      setTasks(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalTasks(res.data.total);
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setIsLoading(false);
    }
  };

  // We keep the filteredTasks name for compatibility with existing render logic
  // but note that the backend is now doing the filtering
  const filteredTasks = tasks;

  const toggleTaskStatus = async (id, currentStatus) => {
    try {
      // Optimitic update
      setTasks(tasks.map(t => t._id === id ? { ...t, completed: !currentStatus } : t));
      await api.put(`/tasks/${id}`, { completed: !currentStatus });
    } catch (error) {
      console.error('Error updating task', error);
      // Revert on error
      setTasks(tasks.map(t => t._id === id ? { ...t, completed: currentStatus } : t));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (error) {
      console.error('Error deleting task', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.subject || !newTask.dueDate) return;
    
    try {
      const res = await api.post('/tasks', newTask);
      setTasks([res.data.data, ...tasks]);
      setIsModalOpen(false);
      setNewTask({ ...newTask, title: '' });
    } catch (error) {
      console.error('Error creating task', error);
      alert(error.response?.data?.message || 'Error creating task');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'Medium': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'Low': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and prioritize your study assignments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 px-6 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Controls: Search & Filter */}
      <div className="glass-card p-4 rounded-xl mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:w-96 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search tasks or subjects..." 
            className="input-field pl-10 bg-white dark:bg-dark-bg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-2 bg-gray-100 dark:bg-dark-bg p-1 rounded-lg">
          {['All', 'Pending', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === f ? 'bg-white dark:bg-dark-surface shadow-sm text-primary-600 dark:text-primary-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl">
            <Filter className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No tasks found</h3>
            <p className="text-gray-500 mt-1 sm:px-10">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task._id} 
              className={`glass-card p-4 rounded-xl flex items-center justify-between group transition-all duration-200 border-l-4 ${task.completed ? 'border-l-green-500 opacity-60' : 'border-l-primary-500'}`}
            >
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <button 
                  onClick={() => toggleTaskStatus(task._id, task.completed)}
                  className="mt-1 flex-shrink-0 focus:outline-none"
                  aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500 transition-transform hover:scale-110" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 hover:text-primary-500 transition-colors" />
                  )}
                </button>
                
                <div className="min-w-0 flex-1">
                  <h3 className={`text-lg font-semibold truncate ${task.completed ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span 
                      className="font-medium px-2 py-0.5 rounded-md"
                      style={{ 
                        backgroundColor: task.subject?.color ? `${task.subject.color}20` : '#f3f4f6',
                        color: task.subject?.color || '#4b5563'
                      }}
                    >
                      {task.subject?.title || 'No Subject'}
                    </span>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                  <button 
                    onClick={() => handleDelete(task._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Task</h2>
            
            <form onSubmit={handleAddTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  className="input-field" 
                  placeholder="e.g. Complete chapter 5 exercises"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                {subjects.length === 0 ? (
                  <p className="text-sm text-red-500 mb-2">You must create a subject first.</p>
                ) : (
                  <select
                    required
                    className="input-field appearance-none bg-white dark:bg-dark-surface"
                    value={newTask.subject}
                    onChange={(e) => setNewTask({...newTask, subject: e.target.value})}
                  >
                    {subjects.map(s => (
                      <option key={s._id} value={s._id}>{s.title}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    className="input-field appearance-none bg-white dark:bg-dark-surface"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={!newTask.title.trim() || !newTask.subject || subjects.length === 0}
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg glass-card disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === i + 1 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'glass-card hover:bg-gray-100 dark:hover:bg-dark-surface'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg glass-card disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Tasks;
