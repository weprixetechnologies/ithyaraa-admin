import React, { useEffect, useState } from 'react';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import { getCacheScopes, clearCache, recacheData, getCacheKeys, getCacheData } from '../../lib/api/cacheApi';
import { toast } from 'react-toastify';
import { RiRefreshLine, RiDeleteBin7Line, RiFlashlightLine, RiInformationLine, RiEyeLine, RiCloseLine, RiLoader4Line } from 'react-icons/ri';

const CacheManagement = () => {
    const [scopes, setScopes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalKey, setModalKey] = useState('');
    const [viewLoading, setViewLoading] = useState(false);

    // Dynamic key states
    const [availableKeys, setAvailableKeys] = useState({});
    const [keyLoading, setKeyLoading] = useState({});

    const fetchScopes = async () => {
        try {
            setLoading(true);
            const res = await getCacheScopes();
            if (res.success) {
                setScopes(res.data);
            }
        } catch (error) {
            toast.error('Failed to load cache scopes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScopes();
    }, []);

    const handleClear = async (scopeId) => {
        try {
            setActionLoading(prev => ({ ...prev, [scopeId]: true }));
            const res = await clearCache(scopeId);
            if (res.success) {
                toast.success(res.message || `Cache cleared for ${scopeId}`);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to clear cache');
        } finally {
            setActionLoading(prev => ({ ...prev, [scopeId]: false }));
        }
    };

    const handleClearAll = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!window.confirm('Are you sure you want to clear the ENTIRE cache? This might temporarily slow down the site.')) return;
        try {
            setActionLoading(prev => ({ ...prev, all: true }));
            const res = await clearCache('*');
            if (res.success) {
                toast.success('Entire cache cleared successfully');
            }
        } catch (error) {
            toast.error('Failed to clear entire cache');
        } finally {
            setActionLoading(prev => ({ ...prev, all: false }));
        }
    };

    const handleRecache = async (scopeId) => {
        try {
            setActionLoading(prev => ({ ...prev, [`recache-${scopeId}`]: true }));
            const res = await recacheData(scopeId);
            if (res.success) {
                toast.success(res.message || 'Recache successful');
            }
        } catch (error) {
            toast.error(error.message || 'Recache failed');
        } finally {
            setActionLoading(prev => ({ ...prev, [`recache-${scopeId}`]: false }));
        }
    };

    const handleView = async (scope) => {
        if (scope.isDynamic) {
            // For dynamic scopes, first list available keys
            try {
                setKeyLoading(prev => ({ ...prev, [scope.id]: true }));
                const res = await getCacheKeys(scope.id);
                if (res.success) {
                    setAvailableKeys(prev => ({ ...prev, [scope.id]: res.data }));
                    if (res.data.length === 0) {
                        toast.info(`No active keys found for ${scope.id}`);
                    }
                }
            } catch (error) {
                toast.error('Failed to list keys');
            } finally {
                setKeyLoading(prev => ({ ...prev, [scope.id]: false }));
            }
        } else {
            // For static scopes, directly fetch data
            fetchKeyData(scope.pattern, scope.id);
        }
    };

    const fetchKeyData = async (key, title) => {
        try {
            setViewLoading(true);
            setModalTitle(title);
            setModalKey(key);
            setShowModal(true);
            setModalData(null); // Reset while loading

            const res = await getCacheData(key);
            if (res.success) {
                setModalData(res.data);
            }
        } catch (error) {
            toast.error('Failed to fetch cache data');
        } finally {
            setViewLoading(false);
        }
    };

    return (
        <Layout title="Cache Management" active="admin-cache-manage">
            <Container containerclass="bg-transparent">
                <div className="flex flex-col gap-6">

                    {/* Header Info Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm bg-gradient-to-br from-input to-background">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <RiInformationLine size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Redis Cache Control</h2>
                                <p className="text-secondary-text mt-1 max-w-2xl">
                                    Manage the application's caching layer. Viewing/Clearing specific scopes will help in debugging and ensuring data consistency.
                                </p>
                            </div>
                            <div className="ml-auto">
                                <button
                                    onClick={handleClearAll}
                                    disabled={actionLoading.all}
                                    className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition flex items-center gap-2 border border-red-100 shadow-sm disabled:opacity-50"
                                >
                                    <RiDeleteBin7Line />
                                    {actionLoading.all ? 'Clearing...' : 'CLEAR ALL CACHE'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scopes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            // Skeleton loading
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="h-48 bg-white animate-pulse rounded-2xl border border-gray-100"></div>
                            ))
                        ) : (
                            scopes.map((scope) => (
                                <div key={scope.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-foreground group-hover:text-blue-600 transition truncate">
                                                    {scope.id}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <code className="text-[10px] bg-background px-2 py-0.5 rounded text-gray-500 font-mono">
                                                        {scope.pattern}
                                                    </code>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {scope.isDynamic && (
                                                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium border border-amber-100">
                                                        Dynamic
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Key breakdown for dynamic scopes */}
                                        {scope.isDynamic && availableKeys[scope.id] && (
                                            <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                                                <label className="text-[10px] font-bold text-secondary-text uppercase mb-1 block">Active Keys ({availableKeys[scope.id].length})</label>
                                                <div className="max-h-24 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                                                    {availableKeys[scope.id].map(key => (
                                                        <button
                                                            key={key}
                                                            onClick={() => fetchKeyData(key, `${scope.id} (Key)`)}
                                                            className="text-[10px] text-left px-2 py-1.5 bg-background hover:bg-blue-50 hover:text-blue-600 rounded transition border border-transparent hover:border-blue-100 truncate font-mono"
                                                            title={key}
                                                        >
                                                            {key.replace('cache:', '')}
                                                        </button>
                                                    ))}
                                                    {availableKeys[scope.id].length === 0 && <span className="text-[10px] italic text-gray-400">None found</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex border-t border-gray-50 pt-4 gap-2">
                                        <button
                                            onClick={() => handleView(scope)}
                                            disabled={keyLoading[scope.id]}
                                            className="flex-1 py-2.5 bg-background border border-gray-100 rounded-xl text-xs font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {keyLoading[scope.id] ? <RiLoader4Line className="animate-spin text-blue-600" /> : <RiEyeLine className="text-blue-600" />}
                                            {scope.isDynamic ? (availableKeys[scope.id] ? 'Refresh Keys' : 'View Keys') : 'View'}
                                        </button>

                                        <button
                                            onClick={() => handleClear(scope.id)}
                                            disabled={actionLoading[scope.id]}
                                            className="flex-1 py-2.5 bg-background border border-gray-100 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <RiRefreshLine className={`${actionLoading[scope.id] ? 'animate-spin' : ''} text-red-500`} />
                                            Clear
                                        </button>

                                        {scope.id === 'SHOP_PRODUCTS_PAGE' && (
                                            <button
                                                onClick={() => handleRecache('SHOP_PRODUCTS')}
                                                disabled={actionLoading[`recache-${scope.id}`]}
                                                className="w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 shadow-blue-200 shadow-lg"
                                                title="Recache Now"
                                            >
                                                <RiFlashlightLine className={actionLoading[`recache-${scope.id}`] ? 'animate-pulse' : ''} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Warning */}
                    <div className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-2">
                        <RiInformationLine />
                        Note: Viewing cache fetches live data from Redis without affecting the TTL.
                    </div>
                </div>

                {/* JSON Data Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-input to-background">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Cache Data Viewer</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{modalTitle}</span>
                                        <code className="text-[10px] text-gray-400 font-mono">{modalKey}</code>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                                >
                                    <RiCloseLine size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-auto p-6 bg-background">
                                {viewLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                        <p className="text-sm font-medium text-gray-400">Retrieving data from Redis...</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {modalData ? (
                                            <pre className="text-xs font-mono p-4 bg-gray-50 rounded-2xl overflow-x-auto text-foreground leading-relaxed">
                                                {JSON.stringify(modalData, null, 2)}
                                            </pre>
                                        ) : (
                                            <div className="py-20 text-center">
                                                <div className="text-gray-200 text-6xl mb-4 italic font-serif">Empty</div>
                                                <p className="text-gray-400 font-medium">No data found for this key in cache.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-white border-t border-gray-50 flex justify-end">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </Layout>
    );
};

export default CacheManagement;
