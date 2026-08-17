import React, { useEffect, useState } from 'react';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import { getHomeCategoryTiles } from '../../lib/api/homeCategoryApi';
import { useNavigate } from 'react-router-dom';
import { RiRefreshLine, RiAddLine, RiImageLine } from 'react-icons/ri';

const ListHomeCategories = () => {
    const [tiles, setTiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getHomeCategoryTiles();
            setTiles(data || []);
        } catch (error) {
            console.error('Error fetching home category tiles', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Layout active={'admin-home-categories-list'}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
                <Container>
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                    Home Category Tiles
                                </h1>
                                <p className="text-secondary-text mt-2 text-lg">
                                    Tiles shown in the &quot;Your Categories&quot; section on the homepage
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={fetchData}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 border border-purple-200 rounded-lg hover:bg-purple-50 text-purple-700 disabled:opacity-50"
                                >
                                    <RiRefreshLine className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/home-categories/add')}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg"
                                >
                                    <RiAddLine className="w-4 h-4" />
                                    Add Home Category Tile
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">
                                <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
                                <p>Loading...</p>
                            </div>
                        ) : tiles.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <RiImageLine className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-lg">No home category tiles yet.</p>
                                <p className="text-sm mt-1">Add a tile to show categories on the homepage.</p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/home-categories/add')}
                                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Add Home Category Tile
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-background border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-text">Image</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-text">Category Name</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-text">Category ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {tiles.map((tile, index) => (
                                            <tr key={tile.categoryID || index} className="hover:bg-background">
                                                <td className="py-3 px-4">
                                                    {tile.imageUrl ? (
                                                        <img
                                                            src={tile.imageUrl}
                                                            alt={tile.categoryName || 'Tile'}
                                                            className="w-16 h-20 object-cover rounded border border-gray-200"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-foreground">
                                                    {tile.categoryName || '—'}
                                                </td>
                                                <td className="py-3 px-4 text-secondary-text">
                                                    {tile.categoryID ?? '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </Container>
            </div>
        </Layout>
    );
};

export default ListHomeCategories;
