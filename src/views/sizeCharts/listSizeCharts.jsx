import React, { useEffect, useRef, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import UploadImagesNew from "@/components/ui/imageUploadNew";
import { listSizeCharts, createSizeChart, deleteSizeChart } from "@/lib/api/sizeChartApi";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

const SizeChartsPage = () => {
  const [charts, setCharts] = useState([]);
  const [chartName, setChartName] = useState("");
  const [loading, setLoading] = useState(false);
  const uploadRef = useRef(null);
  const [showInUseModal, setShowInUseModal] = useState(false);
  const [inUseProducts, setInUseProducts] = useState([]);
  const [selectedChart, setSelectedChart] = useState(null);

  const fetchCharts = async () => {
    try {
      setLoading(true);
      const res = await listSizeCharts();
      if (res.success) {
        setCharts(res.data || []);
      } else {
        toast.error(res.message || "Failed to load size charts");
      }
    } catch (err) {
      console.error("Error loading size charts:", err);
      toast.error("Failed to load size charts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  const handleCreate = async () => {
    if (!chartName.trim()) {
      toast.error("Please enter a chart name");
      return;
    }
    if (!uploadRef.current?.uploadImageFunction) {
      toast.error("Upload component not ready");
      return;
    }
    try {
      setLoading(true);
      const images = await uploadRef.current.uploadImageFunction();
      const first = images?.[0];
      if (!first?.imgUrl) {
        toast.error("Please upload at least one image");
        return;
      }
      const res = await createSizeChart({
        chartName: chartName.trim(),
        imgUrl: first.imgUrl,
      });
      if (res.success) {
        toast.success("Size chart created");
        setChartName("");
        await fetchCharts();
      } else {
        toast.error(res.message || "Failed to create size chart");
      }
    } catch (err) {
      console.error("Error creating size chart:", err);
      toast.error("Failed to create size chart");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chart, nullify = false) => {
    try {
      setLoading(true);
      const res = await deleteSizeChart(chart.id, nullify);
      if (res.success) {
        toast.success(res.message || "Size chart deleted successfully");
        setShowInUseModal(false);
        setInUseProducts([]);
        setSelectedChart(null);
        await fetchCharts();
      } else if (res.inUse) {
        setSelectedChart(chart);
        setInUseProducts(res.products || []);
        setShowInUseModal(true);
      } else {
        toast.error(res.message || "Failed to delete size chart");
      }
    } catch (err) {
      console.error("Error deleting size chart:", err);
      toast.error(err.response?.data?.message || "Failed to delete size chart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Size Charts" active="admin-size-charts-list">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Size Charts</h1>
            <p className="text-secondary-text mt-1">
              Upload reusable size chart images and manage them centrally.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Add Size Chart</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-text mb-1">
                  Chart Name
                </label>
                <input
                  type="text"
                  value={chartName}
                  onChange={(e) => setChartName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. Men’s T-Shirts"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-text mb-1">
                  Image (BunnyCDN)
                </label>
                <UploadImagesNew ref={uploadRef} maxImages={1} />
              </div>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Size Chart"}
              </Button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Existing Charts</h2>
                {loading && (
                  <span className="text-xs text-gray-500">Loading…</span>
                )}
              </div>
              {charts.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No size charts created yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {charts.map((chart) => (
                    <div
                      key={chart.id}
                      className="flex items-center gap-3 border border-gray-100 rounded-lg p-2"
                    >
                      <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {chart.imgUrl && (
                          <img
                            src={chart.imgUrl}
                            alt={chart.chartName}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {chart.chartName}
                          </p>
                          <p className="text-xs text-gray-500 break-all max-w-[200px] truncate">
                            {chart.imgUrl}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${chart.brandID ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {chart.brandID || 'Admin'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(chart)}
                            disabled={loading}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            title="Delete size chart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {showInUseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 text-amber-600 mb-4">
                <span className="p-2 bg-amber-100 rounded-full">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <h3 className="text-lg font-semibold text-gray-900">Size Chart in Use</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                The size chart <strong className="text-gray-900">"{selectedChart?.chartName}"</strong> is currently assigned to the following products:
              </p>
              <div className="max-h-40 overflow-y-auto mb-6 border border-gray-100 rounded-lg divide-y divide-gray-50 bg-gray-50/50 p-2">
                {inUseProducts.map((prod) => (
                  <div key={`${prod.productType}-${prod.productID}`} className="py-2 px-3 text-xs flex justify-between items-center">
                    <span className="font-medium text-gray-700 truncate max-w-[250px]">{prod.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase ${
                      prod.productType === 'presale' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {prod.productType}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mb-6">
                Choose to remove (NULL) this size chart link from these products and delete it, or cancel the deletion.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowInUseModal(false);
                    setSelectedChart(null);
                    setInUseProducts([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedChart, true)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
                >
                  {loading ? "Deleting..." : "Dissociate and Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SizeChartsPage;

