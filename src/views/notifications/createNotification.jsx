import React, { useEffect, useRef, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import InputUi from "@/components/ui/inputui";
import { toast } from "react-toastify";
import { createNotification } from "@/lib/api/notificationApi";
import { getAllBrands } from "@/lib/api/brandOrdersApi";
import { sanitizeHtml } from "@/lib/utils";
import UploadImagesNew from "@/components/ui/imageUploadNew";
import { useNavigate } from "react-router-dom";

const CreateNotification = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("general");
  const [contentHtml, setContentHtml] = useState("");
  const [saving, setSaving] = useState(false);

  const [allBrands, setAllBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandQuery, setBrandQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);

  const uploadRef = useRef(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  // Load all brands on mount (role = brand, list by profile name)
  useEffect(() => {
    (async () => {
      try {
        setBrandsLoading(true);
        const res = await getAllBrands();
        const list = Array.isArray(res?.data) ? res.data : [];
        setAllBrands(list);
      } catch (err) {
        console.error("Error loading brands", err);
        toast.error("Failed to load brands.");
      } finally {
        setBrandsLoading(false);
      }
    })();
  }, []);

  // Filter brands by name (profile.name / users.name where role = brand)
  const filteredBrands = brandQuery.trim()
    ? allBrands.filter(
      (b) =>
        (b.name && b.name.toLowerCase().includes(brandQuery.trim().toLowerCase())) ||
        (b.username && b.username.toLowerCase().includes(brandQuery.trim().toLowerCase()))
    )
    : allBrands;

  const toggleBrand = (brand) => {
    const exists = selectedBrands.find((b) => b.uid === brand.uid);
    if (exists) {
      setSelectedBrands((prev) => prev.filter((b) => b.uid !== brand.uid));
    } else {
      setSelectedBrands((prev) => [...prev, brand]);
    }
  };

  const selectAllBrands = () => {
    setSelectedBrands([...filteredBrands]);
    toast.success(`Selected ${filteredBrands.length} brand(s).`);
  };

  const deselectAllBrands = () => {
    setSelectedBrands([]);
    toast.info("Selection cleared.");
  };

  const handleUploadSingleImage = async () => {
    if (!uploadRef.current?.uploadImageFunction) return;
    try {
      const uploaded = await uploadRef.current.uploadImageFunction();
      if (uploaded && uploaded.length > 0) {
        const img = uploaded[0];
        if (img?.imgUrl) {
          setUploadedImageUrl(img.imgUrl);
          toast.success("Image uploaded.");
        }
      }
    } catch (err) {
      console.error("Error uploading image for notification:", err);
      toast.error("Failed to upload image.");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !contentHtml.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    if (selectedBrands.length === 0) {
      toast.error("Select at least one brand.");
      return;
    }
    try {
      setSaving(true);
      const safeHtml = sanitizeHtml(contentHtml);
      const brandIds = selectedBrands.map((b) => b.uid);
      await createNotification({
        title: title.trim(),
        content_html: safeHtml,
        image_url: uploadedImageUrl || null,
        type,
        brandIds,
      });
      toast.success("Notification created and queued for brands.");
      navigate("/admin/notifications");
    } catch (error) {
      console.error("Error creating notification", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || "Failed to create notification.";
      if (status === 403) {
        toast.error("You do not have permission to create notifications.");
      } else {
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const safePreview = sanitizeHtml(contentHtml);

  return (
    <Layout title="Create Notification" active="admin-notifications-create">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create Brand Notification</h1>
              <p className="text-secondary-text mt-1">
                Compose a rich notification and send it to one or more brands. Email is only used as a nudge; content lives here.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">
                  Title
                </label>
                <InputUi
                  placeholder="Notification title"
                  value={title}
                  datafunction={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">
                  Type
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="offer">Offer</option>
                  <option value="deal">Deal</option>
                  <option value="participation">Participation</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">
                  Optional image (single)
                </label>
                <UploadImagesNew ref={uploadRef} maxImages={1} />
                <div className="flex items-center gap-3 mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUploadSingleImage}
                  >
                    Upload & use image
                  </Button>
                  {uploadedImageUrl && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-secondary-text">Preview:</span>
                      <img
                        src={uploadedImageUrl}
                        alt="Notification"
                        className="h-12 w-12 rounded-md object-cover border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">
                  Target brands
                </label>
                <input
                  type="text"
                  value={brandQuery}
                  onChange={(e) => setBrandQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Filter by brand name (profile name)"
                />
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllBrands}
                    disabled={brandsLoading || filteredBrands.length === 0}
                  >
                    Select all
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={deselectAllBrands}
                    disabled={selectedBrands.length === 0}
                  >
                    Deselect all
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  All brands listed below (filter by name). Click to add/remove from selection.
                </p>
                {brandsLoading ? (
                  <p className="mt-2 text-xs text-gray-500">Loading brands…</p>
                ) : (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white">
                    {filteredBrands.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-500 text-center">
                        No brands match &quot;{brandQuery}&quot;.
                      </div>
                    ) : (
                      filteredBrands.map((b) => {
                        const selected = !!selectedBrands.find((sb) => sb.uid === b.uid);
                        return (
                          <button
                            key={b.uid}
                            type="button"
                            onClick={() => toggleBrand(b)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left ${selected ? "bg-emerald-50 text-emerald-800" : "hover:bg-background"
                              }`}
                          >
                            <span className="flex flex-col items-start">
                              <span className="font-medium">{b.name || b.username || "—"}</span>
                              <span className="text-xs text-gray-500">@{b.username || b.uid}</span>
                            </span>
                            <span className="text-xs text-gray-500 truncate max-w-[140px]">{b.emailID}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
                {selectedBrands.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-secondary-text mb-1">
                      Selected brands ({selectedBrands.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedBrands.map((b) => (
                        <span
                          key={b.uid}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-xs"
                        >
                          {b.name || b.username}
                          <button
                            type="button"
                            className="text-emerald-700 hover:text-emerald-900"
                            onClick={() => toggleBrand(b)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">
                  Content (paste from Word, basic HTML allowed)
                </label>
                <textarea
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  className="w-full min-h-[220px] rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="<p>Paste rich text from Word here…</p>"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Basic formatting like bold, italics, lists, and paragraphs will be preserved. Scripts and inline events are stripped for safety.
                </p>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
                >
                  {saving ? "Sending…" : "Create & Notify"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/notifications")}
                >
                  Cancel
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Dashboard Preview</h2>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 min-h-[260px] bg-background overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {type || "general"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date().toLocaleString()}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {title || "Notification title"}
                </h3>
                {uploadedImageUrl && (
                  <div className="mb-3">
                    <img
                      src={uploadedImageUrl}
                      alt="Notification"
                      className="w-full max-h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: safePreview || "<p>Preview will appear here…</p>" }}
                />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </Layout>
  );
};

export default CreateNotification;

