import React from 'react';

function sanitizeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*\/?>/gi, '')
    .replace(/javascript:/gi, 'blocked:')
    .replace(/on\w+\s*=/gi, 'data-blocked=');
}

const StyledText = ({ text }: { text: string }) => {
  return <div className="prose max-w-none dark:prose-invert prose-headings:font-display prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-7 prose-li:my-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(text)) }} />;
};

export default StyledText;
