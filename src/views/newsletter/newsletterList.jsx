import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAdminNewsletters, sendNewsletter } from "@/lib/api/newsletterApi";

const NewsletterList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  const limit = 20;

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminNewsletters({ page, limit });
      const data = Array.isArray(res.data) ? res.data : [];
      const total = res.total || data.length;
      setItems(data);
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
    } catch (error) {
      console.error("Error loading newsletters", error);
      const status = error.response?.status;
      if (status === 401) return;
      if (status === 403) {
        toast.error("You do not have permission to view newsletters.");
      } else if (status === 500) {
        toast.error("Failed to load newsletters. Please try again.");
      } else {
        toast.error("Unable to load newsletters.");
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSend = async (newsletter) => {
    if (newsletter.status !== "draft") return;
    if (!window.confirm("Send this newsletter to all active subscribers? This cannot be undone.")) {
      return;
    }
    try {
      setSendingId(newsletter.id);
      const res = await sendNewsletter({ id: newsletter.id });
      toast.success("Newsletter send has been queued.");
      await load();
    } catch (error) {
      console.error("Error sending newsletter", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || "Failed to send newsletter.";
      if (status === 403) {
        toast.error("You do not have permission to send newsletters.");
      } else if (status === 500) {
        toast.error("Server error while sending newsletter.");
      } else {
        toast.error(message);
      }
    } finally {
      setSendingId(null);
    }
  };

  return (
    <Layout title="Newsletters" active="admin-newsletters-list">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Newsletters</h1>
              <p className="text-secondary-text mt-1">
                Manage newsletter drafts and sent campaigns.
              </p>
            </div>
            <Button
              onClick={() => navigate("/admin/newsletters/create")}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            >
              Create Newsletter
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">All newsletters</h2>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-emerald-50 border-b border-gray-200">
                    <TableHead className="px-6 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Title
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Created At
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Sent At
                    </TableHead>
                    <TableHead className="px-6 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        Loading newsletters…
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No newsletters found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((n) => (
                      <TableRow key={n.id} className="hover:bg-emerald-50/40">
                        <TableCell className="px-6 py-3 text-sm font-medium text-foreground">
                          {n.title}
                        </TableCell>
                        <TableCell className="px-6 py-3 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${n.status === "sent"
                              ? "bg-emerald-100 text-emerald-800"
                              : n.status === "scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-secondary-text"
                              }`}
                          >
                            {n.status || "draft"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-3 text-sm text-secondary-text">
                          {n.created_at ? new Date(n.created_at).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="px-6 py-3 text-sm text-secondary-text">
                          {n.sent_at ? new Date(n.sent_at).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="px-6 py-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/newsletters/${n.id}/stats`)}
                            >
                              View
                            </Button>
                            {n.status === "draft" && (
                              <Button
                                size="sm"
                                onClick={() => handleSend(n)}
                                disabled={sendingId === n.id}
                                className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                              >
                                {sendingId === n.id ? "Sending…" : "Send"}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-sm text-secondary-text">
                <div>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>
    </Layout>
  );
};

export default NewsletterList;

