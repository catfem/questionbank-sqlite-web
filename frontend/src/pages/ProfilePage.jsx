import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar_url: '',
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [userStats] = await Promise.all([
        userService.getUserStats(),
      ]);

      setProfileData({
        name: user.name || '',
        email: user.email || '',
        avatar_url: user.avatar_url || '',
      });
      setStats(userStats);
      setError(null);
    } catch (err) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.updateCurrentUser({
        name: profileData.name,
        avatar_url: profileData.avatar_url,
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and view your statistics</p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessMessage message={success} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="shrink-0">
                    <img
                      src={profileData.avatar_url || `https://ui-avatars.com/api/?name=${profileData.name}&background=3b82f6&color=fff&size=128`}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      name="avatar_url"
                      value={profileData.avatar_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/avatar.jpg"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="input bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Updating...</span>
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Account Statistics</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(user.created_at)}
                </p>
              </div>
              
              {stats && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Total Quizzes Taken</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats.quiz_stats.total_quizzes}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats.quiz_stats.average_score}%
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Best Score</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats.quiz_stats.best_score}%
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Questions Answered</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats.quiz_stats.total_questions_answered}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Account Actions</h3>
            </div>
            <div className="card-body space-y-3">
              <button
                onClick={logout}
                className="w-full btn btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;