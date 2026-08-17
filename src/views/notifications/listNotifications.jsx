import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAdminNotifications, getNotificationDeliveries, resendNotificationEmail } from "@/lib/api/notificationApi";

const ListNotifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedResendBrandIds, setSelectedResendBrandIds] = useState(new Set());
  const [resending, setResending] = useState(false);
  const limit = 20;

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminNotifications({ page, limit });
      const data = Array.isArray(res.data) ? res.data : [];
      const total = res.total || data.length;
      setItems(data);
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
    } catch (error) {
      console.error("Error loading notifications", error);
      const status = error.response?.status;
      if (status === 401) return;
      if (status === 403) {
        toast.error("You do not have permission to view notifications.");
      } else if (status === 500) {
        toast.error("Failed to load notifications. Please try again.");
      } else {
        toast.error("Unable to load notifications.");
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

  const openDeliveries = async (notification) => {
    const id = notification?.id != null ? Number(notification.id) : NaN;
    if (!Number.isInteger(id) || id < 1) {
      toast.error("Invalid notification.");
      return;
    }
    try {
      setDetailLoadingId(id);
      const res = await getNotificationDeliveries(id);
      const payload = res?.data;
      setSelectedDelivery(payload?.data !== undefined ? payload.data : payload || null);
    } catch (error) {
      console.error("Error loading delivery details", error);
      const msg = error.response?.data?.message || "Failed to load delivery details.";
      toast.error(msg);
    } finally {
      setDetailLoadingId(null);
    }
  };

  const closeDeliveries = () => {
    setSelectedDelivery(null);
    setSelectedResendBrandIds(new Set());
  };

  const toggleResendBrand = (brandId) => {
    setSelectedResendBrandIds((prev) => {
      const next = new Set(prev);
      if (next.has(brandId)) next.delete(brandId);
      else next.add(brandId);
      return next;
    });
  };

  const selectAllForResend = () => {
    if (!selectedDelivery?.deliveries?.length) return;
    setSelectedResendBrandIds(new Set(selectedDelivery.deliveries.map((d) => d.brand_id)));
  };

  const deselectAllForResend = () => {
    setSelectedResendBrandIds(new Set());
  };

  const handleResendEmail = async (toAll = false) => {
    if (!selectedDelivery?.notification?.id) return;
    const notificationId = selectedDelivery.notification.id;
    const brandIds = toAll ? undefined : Array.from(selectedResendBrandIds);
    if (!toAll && (!brandIds || brandIds.length === 0)) {
      toast.error("Select at least one brand to resend.");
      return;
    }
    try {
      setResending(true);
      const res = await resendNotificationEmail(notificationId, { brandIds });
      const count = res?.data?.resent ?? res?.resent ?? (toAll ? selectedDelivery.deliveries.length : brandIds.length);
      toast.success(`Resend queued for ${count} brand(s).`);
      const refreshed = await getNotificationDeliveries(notificationId);
      const payload = refreshed?.data;
      setSelectedDelivery(payload?.data !== undefined ? payload.data : payload || null);
      setSelectedResendBrandIds(new Set());
    } catch (error) {
      console.error("Error resending email", error);
      toast.error(error.response?.data?.message || "Failed to resend email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Layout title="Brand Notifications" active="admin-notifications-list">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Brand Notifications</h1>
              <p className="text-secondary-text mt-1">
                Dashboard-first notifications sent from admin to brands. Email is only a nudge.
              </p>
            </div>
            <Button
              onClick={() => navigate("/admin/notifications/create")}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            >
              Create Notification
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">All notifications</h2>
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
                      Type
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Created At
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Brands
                    </TableHead>
                    <TableHead className="px-6 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Read
                    </TableHead>
                    <TableHead className="px-6 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        Loading notifications…
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        No notifications found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((n) => {
                      const totalBrands = n.total_brands || 0;
                      const readCount = n.read_count || 0;
                      const unread = totalBrands - readCount;
                      return (
                        <TableRow key={n.id} className="hover:bg-emerald-50/40">
                          <TableCell className="px-6 py-3 text-sm font-medium text-foreground">
                            {n.title}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm">
                            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-secondary-text capitalize">
                              {n.type || "general"}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm text-secondary-text">
                            {n.created_at ? new Date(n.created_at).toLocaleString() : "-"}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm text-secondary-text">
                            {totalBrands}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm text-center text-secondary-text">
                            {readCount} / {totalBrands}{" "}
                            {unread > 0 && (
                              <span className="ml-1 text-xs text-amber-600">
                                ({unread} unread)
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeliveries(n)}
                              disabled={detailLoadingId === n.id}
                            >
                              {detailLoadingId === n.id ? "Loading…" : "Delivery status"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
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

          {selectedDelivery && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Delivery status
                    </h2>
                    <p className="text-sm text-secondary-text">
                      {selectedDelivery.notification?.title}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={closeDeliveries}>
                    Close
                  </Button>
                </div>
                <div className="px-6 py-4">
                  {(!selectedDelivery.deliveries || selectedDelivery.deliveries.length === 0) ? (
                    <p className="text-sm text-gray-500">
                      No brand deliveries found for this notification.
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendEmail(false)}
                          disabled={resending || selectedResendBrandIds.size === 0}
                        >
                          {resending ? "Sending…" : "Resend to selected"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendEmail(true)}
                          disabled={resending}
                        >
                          Resend to all
                        </Button>
                        <Button variant="ghost" size="sm" onClick={selectAllForResend}>
                          Select all
                        </Button>
                        <Button variant="ghost" size="sm" onClick={deselectAllForResend}>
                          Deselect all
                        </Button>
                        <span className="text-xs text-gray-500">
                          {selectedResendBrandIds.size} selected
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <Table className="w-full">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="px-4 py-2 w-10 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                Resend
                              </TableHead>
                              <TableHead className="px-4 py-2 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                Brand
                              </TableHead>
                              <TableHead className="px-4 py-2 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                Email
                              </TableHead>
                              <TableHead className="px-4 py-2 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                Email status
                              </TableHead>
                              <TableHead className="px-4 py-2 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">
                                Read
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedDelivery.deliveries.map((d) => (
                              <TableRow key={d.brand_notification_id}>
                                <TableCell className="px-4 py-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedResendBrandIds.has(d.brand_id)}
                                    onChange={() => toggleResendBrand(d.brand_id)}
                                    className="rounded border-gray-300"
                                  />
                                </TableCell>
                                <TableCell className="px-4 py-2 text-sm text-foreground">
                                  {d.name || d.username || d.brand_id}
                                </TableCell>
                                <TableCell className="px-4 py-2 text-sm text-secondary-text">
                                  {d.emailID || "-"}
                                </TableCell>
                                <TableCell className="px-4 py-2 text-sm">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.email_status === "sent"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : d.email_status === "failed"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-secondary-text"
                                      }`}
                                  >
                                    {d.email_status || "pending"}
                                  </span>
                                </TableCell>
                                <TableCell className="px-4 py-2 text-sm text-secondary-text">
                                  {d.is_read
                                    ? `Read at ${d.read_at ? new Date(d.read_at).toLocaleString() : ""}`
                                    : "Unread"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>
    </Layout>
  );
};

export default ListNotifications;

