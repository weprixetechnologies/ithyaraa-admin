import React, { useRef, useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import InputUi from "@/components/ui/inputui";
import { toast } from "react-toastify";
import { createNewsletter, sendNewsletter } from "@/lib/api/newsletterApi";
import { sanitizeHtml } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import UploadImagesNew from "@/components/ui/imageUploadNew";

const CreateNewsletter = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const uploadRef = useRef(null);
  const [insertedImages, setInsertedImages] = useState([]);

  // Helper: build final HTML with all uploaded images appended at the bottom
  const buildHtmlWithImages = async () => {
    let finalHtml = contentHtml;
    if (uploadRef.current?.uploadImageFunction) {
      try {
        const uploaded = await uploadRef.current.uploadImageFunction();
        if (uploaded && uploaded.length) {
          const already = new Set(insertedImages);
          const newOnes = uploaded.filter(img => img.imgUrl && !already.has(img.imgUrl));
          if (newOnes.length) {
            const htmlBlock = newOnes
              .map(img => `<p><img src="${img.imgUrl}" alt="${img.imgAlt || ""}" /></p>`)
              .join("\n");
            finalHtml = finalHtml ? `${finalHtml}\n${htmlBlock}` : htmlBlock;
          }
        }
      } catch (err) {
        console.error("Error including uploaded images in newsletter HTML:", err);
      }
    }
    return finalHtml;
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || !contentHtml.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    try {
      setSaving(true);
      const finalHtml = await buildHtmlWithImages();
      const res = await createNewsletter({
        title: title.trim(),
        content_html: finalHtml,
        content_text: "",
        status: "draft",
      });
      toast.success("Draft saved.");
      navigate("/admin/newsletters");
    } catch (error) {
      console.error("Error saving newsletter", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || "Failed to save newsletter.";
      if (status === 403) {
        toast.error("You do not have permission to create newsletters.");
      } else {
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSendNow = async () => {
    if (!title.trim() || !contentHtml.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    if (
      !window.confirm(
        "This will send the newsletter to all active subscribers. This cannot be undone. Continue?"
      )
    ) {
      return;
    }

    try {
      setSending(true);
      const finalHtml = await buildHtmlWithImages();
      const created = await createNewsletter({
        title: title.trim(),
        content_html: finalHtml,
        content_text: "",
        status: "draft",
      });
      const createdId = created.data?.id || created.data?.newsletter?.id || created.id;
      if (!createdId) {
        toast.error("Newsletter created but could not determine its ID.");
        return;
      }

      // Mandatory confirmation modal already done via window.confirm above
      await sendNewsletter({ id: createdId });
      toast.success("Newsletter send has been queued.");
      navigate("/admin/newsletters");
    } catch (error) {
      console.error("Error sending newsletter", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || "Failed to send newsletter.";
      if (status === 403) {
        toast.error("You do not have permission to send newsletters.");
      } else {
        toast.error(message);
      }
    } finally {
      setSending(false);
    }
  };

  const safePreview = sanitizeHtml(contentHtml);

  return (
    <Layout title="Create Newsletter" active="admin-newsletters-create">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create Newsletter</h1>
              <p className="text-secondary-text mt-1">
                Compose and preview a rich HTML newsletter before sending.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-text mb-1">
                  Title
                </label>
                <InputUi
                  placeholder="Newsletter title"
                  datafunction={(e) => setTitle(e.target.value)}
                  value={title}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-text mb-1">
                  Images (BunnyCDN)
                </label>
                <UploadImagesNew ref={uploadRef} maxImages={5} />
                <p className="mt-1 text-xs text-gray-500">
                  Images are uploaded to BunnyCDN and you can insert them into the HTML content below.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 text-sm"
                  onClick={async () => {
                    if (!uploadRef.current?.uploadImageFunction) return;
                    try {
                      const uploaded = await uploadRef.current.uploadImageFunction();
                      if (!uploaded || !uploaded.length) {
                        toast.warn("No images to insert.");
                        return;
                      }
                      const already = new Set(insertedImages);
                      const newOnes = uploaded.filter(img => img.imgUrl && !already.has(img.imgUrl));
                      if (!newOnes.length) {
                        toast.info("All uploaded images are already in the content.");
                        return;
                      }
                      const htmlToAppend = newOnes
                        .map(img => `<p><img src="${img.imgUrl}" alt="${img.imgAlt || ""}" /></p>`)
                        .join("\n");
                      setContentHtml(prev => (prev ? `${prev}\n${htmlToAppend}` : htmlToAppend));
                      setInsertedImages(prev => [...prev, ...newOnes.map(i => i.imgUrl)]);
                      toast.success("Image(s) inserted into content.");
                    } catch (err) {
                      console.error("Error inserting newsletter images:", err);
                      toast.error("Failed to insert images. Please try again.");
                    }
                  }}
                >
                  Insert uploaded images into content
                </Button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-text mb-1">
                  Content (HTML)
                </label>
                <textarea
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  className="w-full min-h-[260px] rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="<p>Write your newsletter content here...</p>"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This field accepts HTML. Scripts and inline event handlers will be stripped in the preview and on the user side.
                </p>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <Button
                  onClick={handleSaveDraft}
                  disabled={saving || sending}
                  className="bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Draft"}
                </Button>
                <Button
                  onClick={handleSendNow}
                  disabled={sending || saving}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send Now"}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 min-h-[260px] bg-background overflow-y-auto">
                <h3 className="font-semibold text-foreground mb-2">
                  {title || "Newsletter title"}
                </h3>
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

export default CreateNewsletter;

