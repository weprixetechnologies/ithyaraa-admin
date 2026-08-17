import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from 'src/layout';
import Container from '@/components/ui/container';
import InputUi from '@/components/ui/inputui';
import { Button } from '@/components/ui/button';
import { createReel, getReelByID, updateReel } from '../../lib/api/reelsApi';
import { toast } from 'react-toastify';
import { RiVideoLine, RiArrowLeftLine, RiLoader4Line } from 'react-icons/ri';

const AddReel = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        video_url: '',
        position: 0,
        isActive: true
    });

    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState('');

    const videoInputRef = useRef();

    // Bunny CDN Config
    const storageZone = 'ithyaraa';
    const storageRegion = 'sg.storage.bunnycdn.com';
    const pullZoneUrl = 'https://ithyaraa.b-cdn.net';
    const apiKey = '7017f7c4-638b-48ab-add3858172a8-f520-4b88';

    useEffect(() => {
        if (isEdit) {
            fetchReel();
        }
    }, [id]);

    const fetchReel = async () => {
        try {
            setFetching(true);
            const res = await getReelByID(id);
            if (res.success) {
                setFormData({
                    video_url: res.data.video_url || '',
                    position: res.data.position || 0,
                    isActive: res.data.isActive
                });
                if (res.data.video_url) setVideoPreview(res.data.video_url);
            } else {
                toast.error(res.message || 'Failed to fetch reel data');
                navigate('/reels/list');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching reel data');
        } finally {
            setFetching(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setVideoFile(file);
            setVideoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const uploadToBunny = async (file) => {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
        const uploadUrl = `https://${storageRegion}/${storageZone}/${fileName}`;
        const publicUrl = `${pullZoneUrl}/${fileName}`;

        const res = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                AccessKey: apiKey,
                'Content-Type': file.type
            },
            body: file
        });

        if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            let finalVideoUrl = formData.video_url;

            // Upload file to Bunny if it is new
            if (videoFile) {
                toast.info('Uploading video...');
                finalVideoUrl = await uploadToBunny(videoFile);
            }

            if (!finalVideoUrl) {
                toast.error('Video is required');
                setLoading(false);
                return;
            }

            const payload = {
                ...formData,
                video_url: finalVideoUrl
            };

            let res;
            if (isEdit) {
                res = await updateReel(id, payload);
            } else {
                res = await createReel(payload);
            }

            if (res.success) {
                toast.success(isEdit ? 'Reel updated successfully' : 'Reel added successfully');
                navigate('/reels/list');
            } else {
                toast.error(res.error || res.message || 'Failed to save reel');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Layout active="admin-reels">
                <div className="flex items-center justify-center min-h-screen">
                    <RiLoader4Line className="w-10 h-10 animate-spin text-purple-600" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout active="admin-reels">
            <Container>
                <div className="mb-6 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/reels/list')}
                        className="p-2 hover:bg-purple-50"
                    >
                        <RiArrowLeftLine className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                        {isEdit ? 'Edit Reel' : 'Add New Reel'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Container label="Reel Details">
                            <div className="space-y-4">
                                <InputUi
                                    label="Position"
                                    type="number"
                                    value={formData.position}
                                    datafunction={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                                    placeholder="Order of display"
                                />

                                <div className="flex items-center gap-2 mt-4 text-xs">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <label htmlFor="isActive" className="font-medium text-secondary-text">
                                        Active (Show on homepage)
                                    </label>
                                </div>
                            </div>
                        </Container>

                        <Container label="Video File">
                            <div className="space-y-4">
                                <div
                                    onClick={() => videoInputRef.current.click()}
                                    className="border-2 border-dashed border-purple-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors"
                                >
                                    <RiVideoLine className="w-12 h-12 text-purple-400 mb-2" />
                                    <p className="text-sm text-purple-600 font-medium">
                                        {videoFile ? videoFile.name : (isEdit ? 'Click to change video' : 'Click to upload video')}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">MP4 format recommended</p>
                                </div>
                                <input
                                    type="file"
                                    ref={videoInputRef}
                                    onChange={handleFileChange}
                                    accept="video/*"
                                    className="hidden"
                                />
                            </div>
                        </Container>
                    </div>

                    {videoPreview && (
                        <Container label="Video Preview">
                            <div className="rounded-xl overflow-hidden border border-gray-100 bg-black aspect-[9/16] max-w-[300px] mx-auto shadow-2xl">
                                <video src={videoPreview} controls className="w-full h-full object-contain" />
                            </div>
                        </Container>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-purple-200 transition-all font-semibold"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <RiLoader4Line className="animate-spin" />
                                    {isEdit ? 'Updating...' : 'Adding...'}
                                </span>
                            ) : (
                                isEdit ? 'Update Reel' : 'Add Reel'
                            )}
                        </Button>
                    </div>
                </form>
            </Container>
        </Layout>
    );
};

export default AddReel;
