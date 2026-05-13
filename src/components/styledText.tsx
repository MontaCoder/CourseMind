import React from 'react';

const StyledText = ({ text }) => {

    return <div className="prose max-w-none dark:prose-invert prose-headings:font-display prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-7 prose-li:my-1" dangerouslySetInnerHTML={{ __html: text }} />;
};

export default StyledText;
