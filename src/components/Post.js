'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Post({ post }) {
  const [isImageError, setIsImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

      // Add time information
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      return `${month} ${day}, ${year} at ${formattedHours}:${formattedMinutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Calculate time elapsed since post creation
  const getTimeElapsed = (dateString) => {
    if (!dateString) return '';

    try {
      const postDate = new Date(dateString);
      const now = new Date();
      const diffMs = now - postDate;

      // Convert to seconds, minutes, hours, days
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
      } else if (diffHours > 0) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      } else if (diffMins > 0) {
        return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
      } else {
        return 'Just now';
      }
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100">
      <div className="p-6">
        {/* Author information with enhanced details */}
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {post.author?.fullName?.charAt(0) || post.profiles?.full_name?.charAt(0) || '?'}
          </div>
          <div className="ml-3 flex-grow">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {post.author?.fullName || post.profiles?.full_name || 'Anonymous'}
              </p>
              <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-full">
                {post.author?.email ? post.author.email.split('@')[0] : ''}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span title={formatDate(post.createdAt || post.created_at)}>
                  {getTimeElapsed(post.createdAt || post.created_at)}
                </span>
              </p>
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <p className="text-xs text-gray-400 italic">
                  Edited
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Post content with improved markdown rendering */}
        <div className={`text-gray-800 mb-4 prose prose-sm max-w-none ${isExpanded ? '' : 'max-h-[300px] overflow-hidden relative'}`}>
          {post.content && typeof post.content === 'string' ? (
            <>
              {post.content.split('\n').map((line, i) => {
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

                // Handle bold and italic
                let processedLine = line;
                // Bold
                processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Italic
                processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');

                // For safety, just return the line with basic markdown processing
                return line ? (
                  <p key={i} className="my-1" dangerouslySetInnerHTML={{ __html: processedLine }} />
                ) : <br key={i} />;
              })}

              {/* Show gradient overlay for long content */}
              {!isExpanded && post.content.length > 300 && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
              )}
            </>
          ) : (
            <p>No content available</p>
          )}
        </div>

        {/* Show more/less button for long content */}
        {post.content && post.content.length > 300 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-4"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}

        {/* Post image with improved error handling */}
        {(post.imageUrl || post.image_url) && !isImageError && (
          <div className="mt-4 rounded-lg overflow-hidden border border-gray-100">
            <Image
              src={post.imageUrl || post.image_url || '/placeholder-image.jpg'}
              alt={`Post by ${post.author?.fullName || 'user'}`}
              width={600}
              height={400}
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
              onError={() => setIsImageError(true)}
            />
          </div>
        )}

        {/* Post metadata footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{post.likes?.length || 0} likes</span>
          </div>
          <div>
            <span title={formatDate(post.createdAt || post.created_at)}>
              Posted: {formatDate(post.createdAt || post.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
