import React, { useRef, useEffect } from 'react';
import { 
    FaBold, 
    FaItalic, 
    FaUnderline, 
    FaListUl, 
    FaListOl, 
    FaIndent, 
    FaOutdent, 
    FaLink, 
    FaEraser 
} from 'react-icons/fa';

const RichTextUi = ({ label, value, onChange, placeholder, labelClassp = 'text-dark-secondary-text ' }) => {
    const editorRef = useRef(null);

    // Synchronize parent value to the contentEditable innerHTML
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const executeCommand = (command, val = null) => {
        document.execCommand(command, false, val);
        handleInput();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');

        if (html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const cleanNode = (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    return node.cloneNode(true);
                }

                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.tagName.toLowerCase();

                    // Ignore unwanted wrapper styles or scripts
                    if (['script', 'style', 'meta', 'link', 'xml', 'object', 'embed'].includes(tagName)) {
                        return document.createDocumentFragment();
                    }

                    // Allowed tags for safe formatted content
                    const allowedTags = ['p', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'br', 'span', 'div', 'blockquote'];

                    if (allowedTags.includes(tagName)) {
                        const cleanEl = document.createElement(tagName);

                        // Safely preserve inline styles for indentation and margins
                        const style = node.getAttribute('style');
                        if (style) {
                            const marginLeftMatch = style.match(/margin-left:\s*([^;]+)/i);
                            const paddingLeftMatch = style.match(/padding-left:\s*([^;]+)/i);
                            const textIndentMatch = style.match(/text-indent:\s*([^;]+)/i);

                            let styleStr = '';
                            if (marginLeftMatch) styleStr += `margin-left: ${marginLeftMatch[1]}; `;
                            if (paddingLeftMatch) styleStr += `padding-left: ${paddingLeftMatch[1]}; `;
                            if (textIndentMatch) styleStr += `text-indent: ${textIndentMatch[1]}; `;

                            if (styleStr) {
                                cleanEl.setAttribute('style', styleStr.trim());
                            }
                        }

                        // Recursively clean children
                        node.childNodes.forEach(child => {
                            cleanEl.appendChild(cleanNode(child));
                        });

                        return cleanEl;
                    } else {
                        // Map headers to bold paragraphs to fit PDP layout better
                        if (/^h[1-6]$/.test(tagName)) {
                            const p = document.createElement('p');
                            const strong = document.createElement('strong');
                            node.childNodes.forEach(child => {
                                strong.appendChild(cleanNode(child));
                            });
                            p.appendChild(strong);
                            return p;
                        }

                        // Append transparent tags' children directly
                        const fragment = document.createDocumentFragment();
                        node.childNodes.forEach(child => {
                            fragment.appendChild(cleanNode(child));
                        });
                        return fragment;
                    }
                }
                return document.createDocumentFragment();
            };

            const cleanFragment = document.createDocumentFragment();
            doc.body.childNodes.forEach(child => {
                cleanFragment.appendChild(cleanNode(child));
            });

            const selection = window.getSelection();
            if (selection && selection.rangeCount) {
                selection.deleteFromDocument();
                selection.getRangeAt(0).insertNode(cleanFragment);
                handleInput();
            }
        } else if (text) {
            // Text only paste fallback
            document.execCommand('insertText', false, text);
        }
    };

    return (
        <div className="w-full flex flex-col my-1.5">
            {label && <p className={`${labelClassp} text-xs font-medium mb-1`}>{label}</p>}
            <div className="border border-grey rounded-[10px] overflow-hidden flex flex-col bg-white">
                {/* Editor Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-50 border-b border-gray-200">
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('bold')}
                        className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                        title="Bold"
                    >
                        <FaBold size={11} />
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('italic')}
                        className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                        title="Italic"
                    >
                        <FaItalic size={11} />
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('underline')}
                        className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                        title="Underline"
                    >
                        <FaUnderline size={11} />
                    </button>

                    <div className="w-px h-4 bg-gray-300 mx-1" />

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('insertUnorderedList')}
                        className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                        title="Bullet List"
                    >
                        <FaListUl size={11} />
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('insertOrderedList')}
                        className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                        title="Numbered List"
                    >
                        <FaListOl size={11} />
                    </button>

                    <div className="w-px h-4 bg-gray-300 mx-1" />

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('indent')}
                        className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                        title="Increase Indent"
                    >
                        <FaIndent size={11} />
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('outdent')}
                        className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                        title="Decrease Indent"
                    >
                        <FaOutdent size={11} />
                    </button>

                    <div className="w-px h-4 bg-gray-300 mx-1" />

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            const url = prompt('Enter link URL:');
                            if (url) executeCommand('createLink', url);
                        }}
                        className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                        title="Add Link"
                    >
                        <FaLink size={11} />
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeCommand('removeFormat')}
                        className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
                        title="Clear Formatting"
                    >
                        <FaEraser size={11} />
                    </button>
                </div>

                {/* Editable Div */}
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onPaste={handlePaste}
                    placeholder={placeholder || `Enter Your ${label}`}
                    style={{ fontFamily: 'var(--f2)', minHeight: '130px' }}
                    className="rich-editor p-2.5 outline-none overflow-y-auto text-xs tracking-wideset bg-white text-gray-800"
                />
            </div>

            <style>{`
                .rich-editor:empty::before {
                    content: attr(placeholder);
                    color: #94a3b8;
                    pointer-events: none;
                    display: block;
                }
                .rich-editor ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.25rem !important;
                    margin-bottom: 0.25rem !important;
                }
                .rich-editor ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.25rem !important;
                    margin-bottom: 0.25rem !important;
                }
                .rich-editor li {
                    margin-bottom: 0.125rem !important;
                }
                .rich-editor p {
                    margin-bottom: 0.25rem !important;
                }
            `}</style>
        </div>
    );
};

export default RichTextUi;
