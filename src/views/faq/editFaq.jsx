import React, { useState, useEffect } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import InputUi from "@/components/ui/inputui";
import { getFaqById, updateFaq } from "../../lib/api/faqApi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { RiArrowLeftLine } from "react-icons/ri";

const EditFaq = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [form, setForm] = useState({
        question: "",
        answer_html: "<p></p>",
        is_active: true,
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await getFaqById(id);
                if (res.success && res.data && !cancelled) {
                    setForm({
                        question: res.data.question || "",
                        answer_html: res.data.answer_html || "<p></p>",
                        is_active: !!res.data.is_active,
                    });
                } else if (!cancelled) {
                    toast.error("FAQ not found");
                    navigate("/faq/list");
                }
            } catch {
                if (!cancelled) {
                    toast.error("Failed to load FAQ");
                    navigate("/faq/list");
                }
            } finally {
                if (!cancelled) setFetching(false);
            }
        })();
        return () => { cancelled = true; };
    }, [id, navigate]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.question?.trim()) {
            toast.error("Question is required");
            return;
        }
        setLoading(true);
        try {
            const res = await updateFaq(id, form);
            if (res.success) {
                toast.success("FAQ updated");
                navigate("/faq/list");
            } else {
                toast.error(res.message || "Failed to update FAQ");
            }
        } catch {
            toast.error("Failed to update FAQ");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Layout active="admin-faq-list">
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout active="admin-faq-list">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
                <Container>
                    <div className="mb-8">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/faq/list")}
                            className="flex items-center gap-2 mb-4"
                        >
                            <RiArrowLeftLine className="w-4 h-4" />
                            Back to list
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground">Edit FAQ</h1>
                        <p className="text-secondary-text mt-1">Update question and answer</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
                        <div>
                            <label className="block text-sm font-medium text-secondary-text mb-2">Question *</label>
                            <InputUi
                                value={form.question}
                                onChange={(e) => handleChange("question", e.target.value)}
                                placeholder="e.g. Is there a free trial available?"
                                required
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-text mb-2">Answer (HTML allowed)</label>
                            <textarea
                                value={form.answer_html}
                                onChange={(e) => handleChange("answer_html", e.target.value)}
                                placeholder="<p>Your answer here.</p>"
                                rows={8}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Allowed tags: p, strong, em, b, i, u, a, ul, ol, li, br, span.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-text mb-2">Preview</label>
                            <div className="rounded-lg border border-gray-200 bg-white p-4 min-h-[80px] text-secondary-text text-sm prose prose-sm max-w-none">
                                {form.answer_html ? (
                                    <div dangerouslySetInnerHTML={{ __html: form.answer_html }} />
                                ) : (
                                    <span className="text-gray-400">Preview will appear here</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) => handleChange("is_active", e.target.checked)}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-sm text-secondary-text">Active (visible on public FAQ page)</span>
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {loading ? "Saving…" : "Save changes"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate("/faq/list")}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Container>
            </div>
        </Layout>
    );
};

export default EditFaq;
