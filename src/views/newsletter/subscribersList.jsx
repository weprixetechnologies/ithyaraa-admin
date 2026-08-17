import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import InputUi from "@/components/ui/inputui";
import { toast } from "react-toastify";
import { getNewsletterSubscribers, exportSubscribersCsv } from "@/lib/api/newsletterApi";
import { RiSearchLine, RiDownload2Line, RiFilter3Line } from "react-icons/ri";

const SubscribersList = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const limit = 20;

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await getNewsletterSubscribers({
        page,
        limit,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      const rows = Array.isArray(res.data) ? res.data : [];
      const total = res.total || rows.length;
      setSubscribers(rows);
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
    } catch (error) {
      console.error("Error loading subscribers", error);
      const status = error.response?.status;
      if (status === 401) {
        // handled globally by axiosInstance
        return;
      }
      if (status === 403) {
        toast.error("You do not have permission to view subscribers.");
      } else if (status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else if (status === 500) {
        toast.error("Server error loading subscribers.");
      } else {
        toast.error("Unable to load subscribers.");
      }
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = async () => {
    setPage(1);
    await fetchSubscribers();
  };

  const handleExportCsv = () => {
    exportSubscribersCsv({
      status: statusFilter || undefined,
      search: search || undefined,
    });
  };

  return (
    <Layout title="Newsletter Subscribers" active="admin-newsletter-subscribers">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Newsletter Subscribers</h1>
            <p className="text-secondary-text mt-1">
              View and export users who have opted into your newsletters.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <InputUi
                  placeholder="Search by email"
                  datafunction={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <RiFilter3Line className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="unsubscribed">Unsubscribed</option>
                  <option value="bounced">Bounced</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Search"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportCsv}
                  className="flex items-center gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <RiDownload2Line className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Subscribers</h2>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-emerald-50 border-b border-gray-200">
                    <TableHead className="px-6 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Name
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Email
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Subscribed At
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Last Email Sent
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        Loading subscribers…
                      </TableCell>
                    </TableRow>
                  ) : subscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No subscribers found for the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscribers.map((s) => (
                      <TableRow key={s.id} className="hover:bg-emerald-50/40">
                        <TableCell className="px-6 py-3 text-sm text-foreground">
                          {s.name || "-"}
                        </TableCell>
                        <TableCell className="px-6 py-3 text-sm text-foreground">
                          {s.email}
                        </TableCell>
                        <TableCell className="px-6 py-3 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${s.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : s.status === "unsubscribed"
                                ? "bg-gray-100 text-secondary-text"
                                : "bg-red-100 text-red-700"
                              }`}
                          >
                            {s.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-3 text-sm text-secondary-text">
                          {s.subscribed_at
                            ? new Date(s.subscribed_at).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell className="px-6 py-3 text-sm text-secondary-text">
                          {s.last_email_sent_at
                            ? new Date(s.last_email_sent_at).toLocaleString()
                            : "-"}
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

export default SubscribersList;

