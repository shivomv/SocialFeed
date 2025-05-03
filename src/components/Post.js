'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Post({ post }) {
  const [isImageError, setIsImageError] = useState(false);

  // Validate post object
  if (!post || typeof post !== 'object') {
    console.error('Invalid post object:', post);
    return <div className="bg-red-50 p-4 rounded-lg text-red-500">Invalid post data</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      // Use a fixed format to avoid hydration errors
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}, ${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {post.author?.fullName?.charAt(0) || post.profiles?.full_name?.charAt(0) || '?'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {post.author?.fullName || post.profiles?.full_name || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(post.createdAt || post.created_at)}
            </p>
          </div>
        </div>

        <div className="text-gray-800 mb-4 prose prose-sm max-w-none">
          {post.content && typeof post.content === 'string' ?
            post.content.split('\n').map((line, i) => {
              // Handle headings
              if (line.startsWith('# ')) {
                return <h1 key={i} className="text-xl font-bold mt-2 mb-1">{line.substring(2)}</h1>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-lg font-bold mt-2 mb-1">{line.substring(3)}</h2>;
              }

              // Handle lists
              if (line.startsWith('- ')) {
                return <li key={i} className="ml-4">{line.substring(2)}</li>;
              }

              // Handle quotes
              if (line.startsWith('> ')) {
                return <blockquote key={i} className="border-l-4 border-gray-300 pl-4 italic">{line.substring(2)}</blockquote>;
              }

              // For safety, just return the line without markdown processing
              return line ? <p key={i} className="my-1">{line}</p> : <br key={i} />;
            })
          : <p>No content available</p>
          }
        </div>

        {(post.imageUrl || post.image_url) && !isImageError && (
          <div className="mt-4 rounded-lg overflow-hidden">
            <Image
              src={post.imageUrl || post.image_url || '/placeholder-image.jpg'}
              alt="Post image"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              onError={() => setIsImageError(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
