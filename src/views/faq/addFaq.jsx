import React, { useState } from "react";
import Layout from "src/layout";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import InputUi from "@/components/ui/inputui";
import { createFaq } from "../../lib/api/faqApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RiArrowLeftLine } from "react-icons/ri";

const AddFaq = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        question: "",
        answer_html: "<p></p>",
        is_active: true,
    });

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
            const res = await createFaq(form);
            if (res.success) {
                toast.success("FAQ created");
                navigate("/faq/list");
            } else {
                toast.error(res.message || "Failed to create FAQ");
            }
        } catch {
            toast.error("Failed to create FAQ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout active="admin-faq-add">
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
                        <h1 className="text-3xl font-bold text-foreground">Add FAQ</h1>
                        <p className="text-secondary-text mt-1">Create a new frequently asked question</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
                        <div>
                            <label className="block text-sm font-medium text-secondary-text mb-2">Question *</label>
                            <InputUi
                                value={form.question}
                                datafunction={(e) => handleChange("question", e.target.value)}
                                placeholder="e.g. Is there a free trial available?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-text mb-2">Answer (HTML allowed)</label>
                            <textarea
                                value={form.answer_html}
                                onChange={(e) => handleChange("answer_html", e.target.value)}
                                placeholder="<p>Your answer here. You can use &lt;p&gt;, &lt;strong&gt;, &lt;a href=&quot;...&quot;&gt;, &lt;ul&gt;&lt;li&gt;, etc.</p>"
                                rows={8}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Allowed tags: p, strong, em, b, i, u, a, ul, ol, li, br, span. Scripts and unsafe attributes are stripped.
                            </p>
                        </div>

                        {/* Instant preview */}
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
                                {loading ? "Creating…" : "Create FAQ"}
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

export default AddFaq;
