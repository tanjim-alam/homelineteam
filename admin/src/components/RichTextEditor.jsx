import { useState, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code, 
  Quote, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit3,
  Undo,
  Redo,
  Save,
  Code2
} from 'lucide-react'

export default function RichTextEditor({ value, onChange, placeholder }) {
    const [isPreview, setIsPreview] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [history, setHistory] = useState([value || ''])
    const [historyIndex, setHistoryIndex] = useState(0)
    const editorRef = useRef(null)
    const contentEditableRef = useRef(null)

    // Initialize content
    useEffect(() => {
        if (contentEditableRef.current && value !== contentEditableRef.current.innerHTML) {
            contentEditableRef.current.innerHTML = value || ''
        }
    }, [value])

    const handleContentChange = () => {
        if (contentEditableRef.current) {
            const newValue = contentEditableRef.current.innerHTML
            onChange(newValue)
            
            // Add to history
            const newHistory = history.slice(0, historyIndex + 1)
            newHistory.push(newValue)
            setHistory(newHistory)
            setHistoryIndex(newHistory.length - 1)
        }
    }

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1
            setHistoryIndex(newIndex)
            const content = history[newIndex]
            onChange(content)
            if (contentEditableRef.current) {
                contentEditableRef.current.innerHTML = content
            }
        }
    }

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1
            setHistoryIndex(newIndex)
            const content = history[newIndex]
            onChange(content)
            if (contentEditableRef.current) {
                contentEditableRef.current.innerHTML = content
            }
        }
    }

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value)
        handleContentChange()
    }

    const insertHTML = (html) => {
        document.execCommand('insertHTML', false, html)
        handleContentChange()
    }

    const insertHeading = (level) => {
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const selectedText = range.toString()
            
            if (selectedText) {
                insertHTML(`<h${level}>${selectedText}</h${level}>`)
            } else {
                insertHTML(`<h${level}>Heading ${level}</h${level}>`)
            }
        } else {
            insertHTML(`<h${level}>Heading ${level}</h${level}>`)
        }
    }

    const insertLink = () => {
        const url = prompt('Enter URL:')
        if (url) {
            const selection = window.getSelection()
            const selectedText = selection.toString()
            const linkText = selectedText || 'Link Text'
            insertHTML(`<a href="${url}" target="_blank">${linkText}</a>`)
        }
    }

    const insertImage = () => {
        const imgUrl = prompt('Enter image URL:')
        if (imgUrl) {
            const altText = prompt('Enter alt text:')
            insertHTML(`<img src="${imgUrl}" alt="${altText || ''}" style="max-width: 100%; height: auto;" />`)
        }
    }

    const insertTable = () => {
        const tableHTML = `
            <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Header 1</th>
                        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Header 2</th>
                        <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Header 3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Cell 3</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">Cell 4</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Cell 5</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">Cell 6</td>
                    </tr>
                </tbody>
            </table>
        `
        insertHTML(tableHTML)
    }

    const insertSpecialChar = (char) => {
        insertHTML(char)
    }

    const formatText = (format) => {
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const selectedText = range.toString()
            
            if (selectedText) {
                let newText = selectedText
        switch (format) {
            case 'uppercase':
                        newText = selectedText.toUpperCase()
                break
            case 'lowercase':
                        newText = selectedText.toLowerCase()
                break
            case 'capitalize':
                        newText = selectedText.replace(/\b\w/g, l => l.toUpperCase())
                break
            default:
                return
        }

                range.deleteContents()
                range.insertNode(document.createTextNode(newText))
                handleContentChange()
            }
        }
    }

    const clearContent = () => {
        if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = ''
            handleContentChange()
        }
    }

    return (
        <div className={`space-y-3 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`} ref={editorRef}>
            <style jsx>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }
                [contenteditable]:focus:before {
                    content: none;
                }
            `}</style>
            {/* Main Toolbar */}
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
                {/* History Controls */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <button
                        type="button"
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </button>
                </div>

                {/* Headings */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <button
                        type="button"
                        onClick={() => insertHeading(1)}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHeading(2)}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHeading(3)}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Heading 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </button>
                </div>

                {/* Text Formatting */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <button
                        type="button"
                        onClick={() => execCommand('bold')}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand('italic')}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand('underline')}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Underline"
                    >
                        <Underline className="w-4 h-4" />
                    </button>
                </div>

                {/* Lists */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <button
                        type="button"
                        onClick={() => execCommand('insertUnorderedList')}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Unordered List"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand('insertOrderedList')}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Ordered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                </div>

                {/* Links and Media */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <button
                        type="button"
                        onClick={insertLink}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Insert Link"
                    >
                        <Link className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={insertImage}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Insert Image"
                    >
                        <Image className="w-4 h-4" />
                    </button>
                </div>

                {/* Code and Quote */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <button
                        type="button"
                        onClick={() => insertHTML('<code>Code</code>')}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Inline Code"
                    >
                        <Code className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHTML('<pre><code>Code Block</code></pre>')}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Code Block"
                    >
                        <Code2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand('formatBlock', 'blockquote')}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Quote"
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                </div>

                                {/* Special Elements */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <button
                        type="button"
                        onClick={insertTable}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        title="Insert Table"
                    >
                        Table
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHTML('<hr style="border: none; border-top: 1px solid #ccc; margin: 10px 0;" />')}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title="Horizontal Rule"
                    >
                        <div className="w-4 h-0.5 bg-gray-600"></div>
                    </button>
                </div>

                {/* Special Characters */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <button
                        type="button"
                        onClick={() => insertSpecialChar('&nbsp;')}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
                        title="Non-breaking Space"
                    >
                        &nbsp;
                    </button>
                    <button
                        type="button"
                        onClick={() => insertSpecialChar('&copy;')}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
                        title="Copyright"
                    >
                        &copy;
                    </button>
                    <button
                        type="button"
                        onClick={() => insertSpecialChar('&reg;')}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
                        title="Registered"
                    >
                        &reg;
                    </button>
                </div>

                {/* Text Transform */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <button
                        type="button"
                        onClick={() => formatText('uppercase')}
                        className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                        title="Uppercase"
                    >
                        Aa
                    </button>
                    <button
                        type="button"
                        onClick={() => formatText('lowercase')}
                        className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                        title="Lowercase"
                    >
                        aa
                    </button>
                    <button
                        type="button"
                        onClick={() => formatText('capitalize')}
                        className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                        title="Capitalize"
                    >
                        Aa
                    </button>
                </div>

                {/* Clear Content */}
                <div className="flex items-center space-x-1 border-r pr-2">
                    <button
                        type="button"
                        onClick={clearContent}
                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                        title="Clear All Content"
                    >
                        Clear
                    </button>
            </div>

                {/* View Controls */}
                <div className="flex items-center space-x-1">
                <button
                    type="button"
                    onClick={() => setIsPreview(!isPreview)}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title={isPreview ? 'Edit Mode' : 'Preview Mode'}
                    >
                        {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        <Save className="w-4 h-4" />
                </button>
                </div>
            </div>

            {/* Editor/Preview */}
            {isPreview ? (
                <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[300px] max-h-[600px] overflow-y-auto">
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400">No content to preview</p>' }}
                    />
                </div>
            ) : (
                <div
                    ref={contentEditableRef}
                    contentEditable
                    onInput={handleContentChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none prose prose-sm max-w-none"
                    style={{ 
                        minHeight: isFullscreen ? 'calc(100vh - 200px)' : '300px',
                        lineHeight: '1.6'
                    }}
                    data-placeholder={placeholder}
                    suppressContentEditableWarning={true}
                />
            )}

            {/* Status Bar */}
            <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex space-x-4">
                    <span>{value?.length || 0} characters</span>
                    <span>{value?.split('\n').length || 0} lines</span>
                    <span>{value?.split(' ').filter(word => word.length > 0).length || 0} words</span>
                </div>
                <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                        {isPreview ? 'Preview Mode' : 'Edit Mode'}
                    </span>
                    {isFullscreen && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            Fullscreen
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

