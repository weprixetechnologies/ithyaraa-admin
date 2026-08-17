import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getNewsletterStats, sendNewsletter } from "@/lib/api/newsletterApi";

const NewsletterStats = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [newsletter, setNewsletter] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getNewsletterStats(id);
      const payload = res.data || res;
      setNewsletter(payload.newsletter || payload.newsletterRecord || null);
      setStats(payload.stats || payload.deliveryStats || null);
    } catch (error) {
      console.error("Error loading newsletter stats", error);
      const status = error.response?.status;
      if (status === 401) return;
      if (status === 403) {
        toast.error("You do not have permission to view this newsletter.");
      } else if (status === 404) {
        toast.error("Newsletter not found.");
      } else if (status === 500) {
        toast.error("Failed to load newsletter stats.");
      } else {
        toast.error(error.response?.data?.message || "Unable to load stats.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRetryFailed = async () => {
    if (!window.confirm("Retry sending this newsletter to failed recipients?")) {
      return;
    }
    try {
      setRetrying(true);
      await sendNewsletter({ id, retryFailed: true });
      toast.success("Retry for failed deliveries has been queued.");
      await load();
    } catch (error) {
      console.error("Error retrying failed deliveries", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || "Failed to retry failed deliveries.";
      if (status === 403) {
        toast.error("You do not have permission to retry sends.");
      } else {
        toast.error(message);
      }
    } finally {
      setRetrying(false);
    }
  };

  const total = stats?.total || 0;
  const sent = stats?.sent || 0;
  const failed = stats?.failed || 0;
  const pending = stats?.pending || 0;

  return (
    <Layout title="Newsletter Delivery Stats" active="admin-newsletters-stats">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Delivery Status</h1>
            <p className="text-secondary-text mt-1">
              Track how this newsletter performed across all recipients.
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center text-gray-500">
              Loading newsletter stats…
            </div>
          ) : !newsletter ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center text-gray-500">
              Newsletter not found.
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  {newsletter.title}
                </h2>
                <p className="text-sm text-secondary-text mb-3">
                  Status:{" "}
                  <span className="font-medium">
                    {newsletter.status || "sent"}
                  </span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <p className="text-xs text-emerald-700 uppercase">Total</p>
                    <p className="text-2xl font-bold text-emerald-900">{total}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-green-700 uppercase">Sent</p>
                    <p className="text-2xl font-bold text-green-900">{sent}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-xs text-yellow-700 uppercase">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{pending}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-xs text-red-700 uppercase">Failed</p>
                    <p className="text-2xl font-bold text-red-900">{failed}</p>
                  </div>
                </div>

                {failed > 0 && (
                  <div className="mt-6">
                    <Button
                      onClick={handleRetryFailed}
                      disabled={retrying}
                      className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {retrying ? "Retrying…" : "Retry Failed Deliveries"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Container>
      </div>
    </Layout>
  );
};

export default NewsletterStats;

