import React, { useEffect, useState } from 'react';
import Layout from '../../layout';
import Container from '../../components/ui/container';
import { Button } from '../../components/ui/button';
import { listFlashSales } from '../../lib/api/flashSaleApi';
import { useNavigate } from 'react-router-dom';
import { 
  RiFlashlightLine, 
  RiAddLine, 
  RiEditLine, 
  RiCalendarLine,
  RiTimeLine,
  RiPriceTag3Line,
  RiShoppingBag3Line
} from 'react-icons/ri';

export default function ListFlashSales() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { success, data } = await listFlashSales();
        if (success) setRows(data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'upcoming':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ended':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Layout title={'Flash Sales'} active={'admin-flash-sale-list'}>
      <div className="min-h-screen bg-gray-50">
      <Container>
          {/* Header */}
          <div className="mb-8 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-gray-900 mb-2">Flash Sales</h1>
                <p className="text-gray-500 text-sm">Manage limited-time promotional sales</p>
              </div>
              <Button 
                onClick={() => navigate('/flash-sale/add')}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-sm"
              >
                <RiAddLine className="w-4 h-4" />
                New Sale
              </Button>
            </div>
          </div>

          {/* Content */}
                {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm">Loading flash sales...</p>
              </div>
            </div>
                ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
              <RiFlashlightLine className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-light mb-2">No flash sales yet</p>
              <p className="text-gray-400 text-sm mb-6">Create your first flash sale to get started</p>
              <Button 
                onClick={() => navigate('/flash-sale/add')}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white"
              >
                <RiAddLine className="w-4 h-4" />
                Create Flash Sale
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">
              {rows.map((sale) => (
                <div 
                  key={sale.saleID} 
                  className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                >
                  <div className="p-6">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <RiFlashlightLine className="w-5 h-5 text-amber-500" />
                          <h3 className="text-lg font-medium text-gray-900">
                            {sale.name || `Sale #${sale.saleID}`}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-400 font-mono">ID: {sale.saleID}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sale.status)}`}>
                        {sale.status || 'inactive'}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Discount */}
                      <div className="flex items-center gap-2">
                        <RiPriceTag3Line className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Discount</p>
                          <p className="text-sm font-medium text-gray-900">
                            {sale.discountType && sale.discountValue !== null && sale.discountValue !== undefined
                              ? (sale.discountType === 'percentage' ? `${sale.discountValue}%` : `₹${sale.discountValue}`)
                              : 'Not set'}
                          </p>
                        </div>
                      </div>

                      {/* Items Count */}
                      <div className="flex items-center gap-2">
                        <RiShoppingBag3Line className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Items</p>
                          <p className="text-sm font-medium text-gray-900">{sale.itemCount || 0}</p>
                        </div>
                      </div>

                      {/* Start Time */}
                      {sale.startTime && (
                        <div className="flex items-center gap-2">
                          <RiCalendarLine className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Starts</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(sale.startTime)}
                            </p>
                            <p className="text-xs text-gray-400">{formatTime(sale.startTime)}</p>
                          </div>
                        </div>
                      )}

                      {/* End Time */}
                      {sale.endTime && (
                        <div className="flex items-center gap-2">
                          <RiTimeLine className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Ends</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(sale.endTime)}
                            </p>
                            <p className="text-xs text-gray-400">{formatTime(sale.endTime)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-gray-100">
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/flash-sale/edit/${sale.saleID}`)}
                        className="w-full flex items-center justify-center gap-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                      >
                        <RiEditLine className="w-4 h-4" />
                        Edit Sale
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          )}
      </Container>
      </div>
    </Layout>
  );
}


