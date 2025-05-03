'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
import Navbar from '@/components/Navbar';
import PostForm from '@/components/PostForm';
import Post from '@/components/Post';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch user's posts
    const fetchPosts = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Get auth token from cookie
        const token = Cookies.get('auth_token');

        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch('/api/posts/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load your posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  // Show loading state while checking authentication
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
              <p className="text-gray-600 mt-2">Create and manage your posts</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center bg-indigo-50 px-4 py-2 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                  {user.email?.charAt(0).toUpperCase() || user.user_metadata?.full_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {user.email || user.user_metadata?.full_name || 'User'}
                  </div>
                  <div className="text-xs text-indigo-600">
                    Active Account
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-1">
              <PostForm onPostCreated={handlePostCreated} />
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Posts</h2>
                <div className="text-sm text-gray-500">
                  {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white shadow-md rounded-xl p-8 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-4">Create your first post using the form above!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <Post key={post._id || post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Enhanced User Profile Card */}
            <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
              {/* Profile Header with Cover Image */}
              <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-2xl shadow-md">
                    {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="pt-12 p-6">
                <h2 className="text-xl font-bold text-gray-900">{user.fullName || user.user_metadata?.full_name || 'Your Profile'}</h2>
                <p className="text-sm text-gray-500 mb-4">@{user.email?.split('@')[0] || 'user'}</p>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                    </div>
                    <p className="mt-1 font-medium">{user.email}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-xs font-medium text-gray-500 uppercase">Name</p>
                    </div>
                    <p className="mt-1 font-medium">{user.fullName || user.user_metadata?.full_name || 'Not provided'}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs font-medium text-gray-500 uppercase">Member since</p>
                    </div>
                    <p className="mt-1 font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Activity Stats</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-xl font-bold text-indigo-600">{posts.length}</p>
                      <p className="text-xs text-gray-500">Posts</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xl font-bold text-purple-600">
                        {posts.reduce((total, post) => total + (post.likes?.length || 0), 0)}
                      </p>
                      <p className="text-xs text-gray-500">Likes</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xl font-bold text-blue-600">
                        {Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))}
                      </p>
                      <p className="text-xs text-gray-500">Days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Tips Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-semibold">Tips & Tricks</h2>
              </div>

              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-200 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Use <strong>**bold**</strong> and <em>*italic*</em> formatting in your posts</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-200 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Start lines with <strong># </strong> for headings and <strong>- </strong> for lists</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-200 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Use <strong>&gt; </strong> at the start of a line for blockquotes</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-200 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Add images to make your posts more engaging</span>
                </li>
              </ul>

              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <p className="text-xs text-indigo-100">
                  Your posts will appear on the homepage for everyone to see and engage with. Be respectful and follow community guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
