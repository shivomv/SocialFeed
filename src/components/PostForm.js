'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { getAuthToken } from '@/utils/storage';

export default function PostForm({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [formattingTip, setFormattingTip] = useState('');
  const fileInputRef = useRef(null);

  // Random formatting tips to show users
  const formattingTips = [
    "Use **text** for bold or *text* for italic formatting",
    "Start a line with # for heading or ## for subheading",
    "Use - at the start of a line to create a list item",
    "Start a line with > to create a blockquote",
    "Add an image to make your post more engaging",
    "Keep your post concise and to the point for better engagement",
    "Ask questions to encourage responses from others"
  ];

  // Show a random formatting tip when component mounts
  useEffect(() => {
    const randomTip = formattingTips[Math.floor(Math.random() * formattingTips.length)];
    setFormattingTip(randomTip);
  }, []);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setCharCount(newContent.length);

    // Show a new formatting tip when content length reaches certain thresholds
    if (newContent.length === 50 || newContent.length === 100 || newContent.length === 200) {
      const randomTip = formattingTips[Math.floor(Math.random() * formattingTips.length)];
      setFormattingTip(randomTip);
    }

    // Clear error when user starts typing
    if (error && newContent.trim().length > 0) {
      setError('');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please enter some content for your post');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let imageUrl = null;
      // Get token from localStorage using our utility function
      const token = getAuthToken();

      if (!token) {
        throw new Error('You must be logged in to create a post');
      }

      // Upload image if one is selected
      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || 'Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      // Create post in database
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: content,
          imageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      // Reset form
      setContent('');
      setImage(null);
      setImagePreview(null);
      setCharCount(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Set success message
      setSuccess('Your post was published successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);

      // Notify parent component
      const newPost = await response.json();
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Create a New Post</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <div className="rounded-md border border-gray-300 relative">
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="What's on your mind? Share your thoughts, ideas, or questions..."
              className="w-full h-40 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={6}
              maxLength={1000}
            />
            <div className="absolute bottom-2 right-3 text-xs text-gray-400">
              {charCount}/1000
            </div>
          </div>

          {/* Formatting tip */}
          {formattingTip && (
            <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded-md text-xs flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formattingTip}</span>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-md text-xs">
              {success}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setContent(prev => prev + '**Bold Text**')}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 flex items-center"
            >
              <span className="font-bold mr-1">B</span> Bold
            </button>
            <button
              type="button"
              onClick={() => setContent(prev => prev + '*Italic Text*')}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 flex items-center"
            >
              <span className="italic mr-1">I</span> Italic
            </button>
            <button
              type="button"
              onClick={() => setContent(prev => prev + '\n# Heading')}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 flex items-center"
            >
              <span className="font-bold mr-1">H</span> Heading
            </button>
            <button
              type="button"
              onClick={() => setContent(prev => prev + '\n- List item')}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 flex items-center"
            >
              <span className="mr-1">•</span> List
            </button>
            <button
              type="button"
              onClick={() => setContent(prev => prev + '\n> Quote')}
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 flex items-center"
            >
              <span className="mr-1">❝</span> Quote
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            You can use Markdown formatting: **bold**, *italic*, # heading, - list, {'>'}quote
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
        </div>

        {imagePreview && (
          <div className="mb-4">
            <div className="relative">
              <Image
                src={imagePreview}
                alt="Preview"
                width={400}
                height={300}
                className="mt-2 rounded-md max-h-60 object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
