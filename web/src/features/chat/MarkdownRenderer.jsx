import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import CodeBlock from './CodeBlock';

// Helper to recursively extract text content from react children node tree (e.g. highlighted spans)
const extractText = (node) => {
  if (typeof node === 'string') {
    return node;
  }
  if (typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('');
  }
  if (node && node.props && node.props.children !== undefined) {
    return extractText(node.props.children);
  }
  return '';
};

export default function MarkdownRenderer({ content }) {
  return (
    <div className="markdown-content space-y-3 select-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 className="text-base font-extrabold text-white mt-4 mb-2 first:mt-0 font-sans tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold text-white mt-3.5 mb-1.5 first:mt-0 font-sans tracking-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-bold text-[#EEEAF8] mt-3 mb-1 first:mt-0 font-sans">{children}</h3>,
          p: ({ children }) => <p className="text-[#EEEAF8] leading-relaxed mb-3 last:mb-0 font-sans">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-[#22D3EE]">{children}</strong>,
          em: ({ children }) => <em className="italic text-[#A78BFA]">{children}</em>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 mb-3 font-sans text-[#EEEAF8]">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 mb-3 font-sans text-[#EEEAF8]">{children}</ol>,
          li: ({ children }) => <li className="pl-0.5 leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#22D3EE] hover:text-[#A78BFA] underline transition-colors font-semibold"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 border border-white/5 rounded-xl">
              <table className="w-full text-xs text-left border-collapse bg-white/[0.01]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/5 border-b border-white/10 text-white font-bold">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-white/5">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-2 font-semibold font-sans">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2 font-sans text-[#EEEAF8]/80">{children}</td>,
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            if (isInline) {
              return (
                <code className="bg-white/5 border border-white/5 rounded px-1.5 py-0.5 font-mono text-[11px] text-[#A78BFA]" {...props}>
                  {children}
                </code>
              );
            }
            
            const codeVal = extractText(children).replace(/\n$/, '');
            return <CodeBlock language={match[1]} value={codeVal} children={children} />;
          },
          pre: ({ children }) => <>{children}</>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
