import React, { useEffect, useState } from 'react';
import Container from '@/components/ui/container';
import Layout from 'src/layout';
import axiosInstance from './../../lib/axiosInstance';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdDragHandle, MdFolder, MdChatBubbleOutline, MdClose } from 'react-icons/md';

const SupportTopicManager = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingTopic, setEditingTopic] = useState(null);
    const [form, setForm] = useState({
        parent_id: null,
        label: '',
        panel: 'both',
        input_type: 'branch',
        prefilled_text: '',
        sort_order: 0,
        is_active: true
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/support/topics');
            if (response.data.success) {
                setTopics(response.data.topics);
            }
        } catch (error) {
            console.error('Error fetching topics:', error);
            toast.error('Failed to fetch topics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    const handleEdit = (topic) => {
        setEditingTopic(topic);
        setForm({
            parent_id: topic.parent_id,
            label: topic.label,
            panel: topic.panel,
            input_type: topic.input_type,
            prefilled_text: topic.prefilled_text || '',
            sort_order: topic.sort_order,
            is_active: topic.is_active
        });
        setIsModalOpen(true);
    };

    const handleAddChild = (parentId) => {
        setEditingTopic(null);
        setForm({
            parent_id: parentId,
            label: '',
            panel: 'both',
            input_type: 'branch',
            prefilled_text: '',
            sort_order: 0,
            is_active: true
        });
        setIsModalOpen(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
             const cleanedForm = { ...form };
             if (cleanedForm.parent_id === 'null' || !cleanedForm.parent_id) cleanedForm.parent_id = null;

            if (editingTopic) {
                await axiosInstance.patch(`/admin/support/topics/${editingTopic.id}`, cleanedForm);
                toast.success('Topic updated');
            } else {
                await axiosInstance.post('/admin/support/topics', cleanedForm);
                toast.success('Topic created');
            }
            setIsModalOpen(false);
            fetchTopics();
        } catch (error) {
            console.error('Error saving topic:', error);
            toast.error('Failed to save topic');
        }
    };

    const toggleActive = async (topic) => {
        try {
            await axiosInstance.patch(`/admin/support/topics/${topic.id}`, { is_active: !topic.is_active });
            toast.success(topic.is_active ? 'Topic deactivated' : 'Topic activated');
            fetchTopics();
        } catch (error) {
             console.error('Error toggling active state:', error);
             toast.error('Failed to toggle active state');
        }
    }

    const TopicItem = ({ topic, depth = 0 }) => (
        <div className="flex flex-col">
            <div 
                className={`flex items-center justify-between p-3 border-b bg-white group hover:bg-slate-50 transition ${depth > 0 ? 'ml-8 border-l-2' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <MdDragHandle className="text-gray-300 group-hover:text-gray-500 cursor-move" />
                    {topic.input_type === 'branch' ? <MdFolder className="text-amber-500"/> : <MdChatBubbleOutline className="text-blue-500"/>}
                    <div className="flex flex-col">
                         <span className={`text-sm font-medium ${!topic.is_active ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                             {topic.label}
                         </span>
                         <div className="flex gap-2 mt-0.5">
                             <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded leading-none">{topic.panel}</span>
                             <span className={`text-[10px] uppercase font-bold border px-1.5 py-0.5 rounded leading-none ${topic.input_type === 'leaf' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-amber-600 border-amber-200 bg-amber-50'}`}>{topic.input_type}</span>
                         </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition shadow-sm rounded-lg bg-white border border-gray-100 p-1">
                    <button 
                         onClick={() => handleAddChild(topic.id)} 
                         disabled={topic.input_type === 'leaf'}
                         className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-30" 
                         title="Add Child"
                    >
                        <MdAdd />
                    </button>
                    <button 
                        onClick={() => handleEdit(topic)} 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" 
                        title="Edit"
                    >
                        <MdEdit />
                    </button>
                    <button 
                        onClick={() => toggleActive(topic)}
                        className={`p-1.5 rounded-lg ${topic.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        title={topic.is_active ? 'Deactivate' : 'Activate'}
                    >
                        <MdDelete />
                    </button>
                </div>
            </div>
            {topic.children && topic.children.length > 0 && (
                <div className="topic-children">
                    {topic.children.map(child => (
                        <TopicItem key={child.id} topic={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <Layout title="Topic Management" active="admin-support-tickets">
            <Container>
                <div className="bg-slate-900 text-white p-8 rounded-3xl mb-8 relative overflow-hidden flex justify-between items-center">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-extrabold tracking-tighter mb-2">Topic Navigator</h2>
                        <p className="text-slate-400 max-w-lg text-sm">Manage the hierarchical support decision tree. Use branches for navigation and leaves for final ticket forms.</p>
                    </div>
                    <button 
                        onClick={() => handleAddChild(null)}
                        className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold hover:bg-blue-500 hover:text-white transition shadow-xl"
                    >
                        Create Root Topic
                    </button>
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <MdFolder size={120}/>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-gray-400">Building tree...</div>
                    ) : topics.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <MdFolder size={48} className="text-gray-200"/>
                            <div className="text-gray-400">No topics configured yet. Start by creating a root topic.</div>
                        </div>
                    ) : (
                        <div className="topic-tree">
                            {topics.map(topic => (
                                <TopicItem key={topic.id} topic={topic} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Edit/Create Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition">
                                <MdClose/>
                            </button>
                            <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">
                                {editingTopic ? 'Refine Topic' : 'New Knowledge Node'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Label Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none transition text-sm font-medium"
                                        required
                                        value={form.label}
                                        onChange={(e) => setForm({...form, label: e.target.value})}
                                        placeholder="e.g. Order Issues"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Target Panel</label>
                                        <select 
                                            className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none transition text-sm font-medium"
                                            value={form.panel}
                                            onChange={(e) => setForm({...form, panel: e.target.value})}
                                        >
                                            <option value="user">User Panel</option>
                                            <option value="brand">Brand Panel</option>
                                            <option value="both">Both</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Node Type</label>
                                        <select 
                                            className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none transition text-sm font-medium"
                                            value={form.input_type}
                                            onChange={(e) => setForm({...form, input_type: e.target.value})}
                                        >
                                            <option value="branch">Branch (Has Children)</option>
                                            <option value="leaf">Leaf (Final Form)</option>
                                        </select>
                                    </div>
                                </div>

                                {form.input_type === 'leaf' && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Prefilled Form Text</label>
                                        <textarea 
                                            className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none transition text-sm h-24"
                                            value={form.prefilled_text}
                                            onChange={(e) => setForm({...form, prefilled_text: e.target.value})}
                                            placeholder="Optional help text for the user..."
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 items-end">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Display Order</label>
                                        <input 
                                            type="number" 
                                            className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none transition text-sm font-medium"
                                            value={form.sort_order}
                                            onChange={(e) => setForm({...form, sort_order: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 p-3">
                                        <input 
                                            type="checkbox" 
                                            id="is_active"
                                            checked={form.is_active}
                                            onChange={(e) => setForm({...form, is_active: e.target.checked})}
                                            className="h-5 w-5 rounded-lg border-2"
                                        />
                                        <label htmlFor="is_active" className="text-xs font-bold text-slate-600">Visible to Public</label>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold hover:bg-slate-200 transition text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-2 bg-blue-600 text-white py-3 px-8 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg text-sm shadow-blue-200"
                                    >
                                        {editingTopic ? 'Confirm Update' : 'Generate Node'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </Container>
        </Layout>
    );
};

export default SupportTopicManager;
