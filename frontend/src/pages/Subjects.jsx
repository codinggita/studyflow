import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Subjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newSubject, setNewSubject] = useState({ title: '', color: '#3b82f6' });

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data.data);
    } catch (error) {
      console.error('Error fetching subjects', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.title.trim()) return;
    
    try {
      const res = await api.post('/subjects', newSubject);
      setSubjects([res.data.data, ...subjects]);
      setNewSubject({ title: '', color: '#3b82f6' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating subject', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will also delete all tasks in this subject.')) return;
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects(subjects.filter(s => s._id !== id));
    } catch (error) {
      console.error('Error deleting subject', error);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Subjects</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all your courses in one place.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Subject</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No subjects found</h3>
          <p className="text-gray-500 mt-2">Create your first subject to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div key={subject._id} className="glass-card rounded-xl p-6 group hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 w-full h-2" 
                style={{ backgroundColor: subject.color }}
              ></div>
              <div className="flex justify-between items-start mt-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.title.charAt(0)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{subject.title}</h3>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                  <button className="p-1.5 text-gray-500 hover:text-primary-600 dark:hover:text-primary-500 bg-gray-100 dark:bg-gray-800 rounded-md transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(subject._id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-500 bg-gray-100 dark:bg-gray-800 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{subject.taskCount || 0} Tasks</span>
                <span 
                  onClick={() => navigate(`/tasks?subjectId=${subject._id}`)}
                  className="cursor-pointer hover:text-primary-600 dark:hover:text-primary-500 transition-colors"
                >
                  View Tasks →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Subject</h2>
            
            <form onSubmit={handleAddSubject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Title</label>
                <input 
                  type="text" 
                  autoFocus
                  className="input-field" 
                  placeholder="e.g. Data Structures"
                  value={newSubject.title}
                  onChange={(e) => setNewSubject({...newSubject, title: e.target.value})}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Theme</label>
                <div className="flex gap-3">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewSubject({...newSubject, color})}
                      className={`w-8 h-8 rounded-full transition-transform ${newSubject.color === color ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
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
                  disabled={!newSubject.title.trim()}
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
