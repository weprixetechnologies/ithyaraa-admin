import React, { useEffect, useState } from 'react';
import Layout from '../../layout';
import Container from '../../components/ui/container';
import { Button } from '../../components/ui/button';
import axiosInstance from '../../lib/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { MdEdit, MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';

export default function ListPresaleGroups() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/admin/presale-groups/all');
      if (data.success) {
        setRows(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching presale groups:', error);
      toast.error('Failed to load presale groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (presaleGroupID) => {
    if (!window.confirm('Are you sure you want to delete this presale group?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const { data } = await axiosInstance.delete(`/admin/presale-groups/${presaleGroupID}`);
      if (data.success) {
        toast.success('Presale group deleted successfully');
        loadGroups();
      } else {
        toast.error(data.message || 'Failed to delete presale group');
      }
    } catch (error) {
      console.error('Error deleting presale group:', error);
      toast.error('Failed to delete presale group');
    } finally {
      setDeleteLoading(false);
    }
  };

  const parseJSONSafe = (value) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value || [];
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'upcoming': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout title={'Pre-Sale Groups'} active={'admin-presale-group-list'}>
      <Container>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Pre-Sale Groups</h1>
          <Button onClick={() => navigate('/presale/groups/add')}>Create Pre-Sale Group</Button>
        </div>

        <div className="bg-white border rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Group ID</th>
                <th className="text-left p-3">Group Name</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Start Date</th>
                <th className="text-left p-3">End Date</th>
                <th className="text-left p-3">Show on Homepage</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-3" colSpan={7}>Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="p-3 text-center text-gray-500" colSpan={7}>No presale groups found</td></tr>
              ) : rows.map(group => {
                const bannerImage = parseJSONSafe(group.bannerImage);
                const featuredImage = parseJSONSafe(group.featuredImage);
                const imageUrl = bannerImage[0]?.imgUrl || featuredImage[0]?.imgUrl || '';

                return (
                  <tr key={group.presaleGroupID} className="border-b hover:bg-gray-50">
                    <td className="p-3">{group.presaleGroupID}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {imageUrl && (
                          <img src={imageUrl} alt={group.groupName} className="w-10 h-10 object-cover rounded" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{group.groupName || '-'}</span>
                          {group.description && (
                            <span className="text-xs text-gray-500 line-clamp-1">{group.description}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(group.status)}`}>
                        {group.status || 'upcoming'}
                      </span>
                    </td>
                    <td className="p-3">
                      {group.startDate 
                        ? new Date(group.startDate).toLocaleDateString()
                        : '-'
                      }
                    </td>
                    <td className="p-3">
                      {group.endDate 
                        ? new Date(group.endDate).toLocaleDateString()
                        : '-'
                      }
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        group.showOnHomepage ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {group.showOnHomepage ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/presale/groups/edit/${group.presaleGroupID}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(group.presaleGroupID)}
                          disabled={deleteLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          title="Delete"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Container>
    </Layout>
  );
}

