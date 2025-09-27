import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Edit, Save, Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
import apiClient from '../api/client';
import Toast from '../components/Toast';

const HeroSectionPage = () => {
  const [heroData, setHeroData] = useState({
    mobileBackgroundImages: [],
    desktopBackgroundImages: [],
    categories: [],
    sliderSettings: {
      autoSlide: true,
      slideInterval: 3000,
      transitionDuration: 1000
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('mobile-background');
  const [newCategoryData, setNewCategoryData] = useState({
    title: '',
    link: '',
    altText: ''
  });
  const [savingItems, setSavingItems] = useState(new Set());
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  // Show toast notification
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  // Fetch hero section data
  const fetchHeroData = async () => {
    try {
      const response = await apiClient.get('/api/hero-section');
      if (response.data.success) {
        setHeroData(response.data.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroData();
  }, []);

  // Upload image
  const handleImageUpload = async (type, file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Determine upload type for API
      const uploadType = type === 'mobile-background' ? 'mobile' :
        type === 'desktop-background' ? 'desktop' :
          type === 'categories' ? 'category' : 'mobile';

      const response = await apiClient.post(`/api/hero-section/upload-image?type=${uploadType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const newImage = {
          imageUrl: response.data.data.imageUrl,
          altText: type === 'categories' ? newCategoryData.altText || file.name.split('.')[0] : file.name.split('.')[0],
          isActive: true,
          order: type === 'categories' ? heroData.categories.length :
            type === 'mobile-background' ? heroData.mobileBackgroundImages.length :
              heroData.desktopBackgroundImages.length
        };

        if (type === 'mobile-background') {
          const updatedData = {
            ...heroData,
            mobileBackgroundImages: [...heroData.mobileBackgroundImages, newImage]
          };
          setHeroData(updatedData);
          await saveChanges(updatedData);
        } else if (type === 'desktop-background') {
          const updatedData = {
            ...heroData,
            desktopBackgroundImages: [...heroData.desktopBackgroundImages, newImage]
          };
          setHeroData(updatedData);
          await saveChanges(updatedData);
        } else if (type === 'categories') {
          const updatedData = {
            ...heroData,
            categories: [...heroData.categories, {
              ...newImage,
              title: newCategoryData.title || 'New Category',
              link: newCategoryData.link || '/collections/new-category'
            }]
          };
          setHeroData(updatedData);
          await saveChanges(updatedData);

          // Reset form data after successful upload
          setNewCategoryData({
            title: '',
            link: '',
            altText: ''
          });
        }
      }
    } catch (error) {

      // More detailed error message
      let errorMessage = 'Error uploading image';
      if (error.response) {
        // Server responded with error status
        errorMessage = `Server Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network Error: No response from server. Please check if backend is running.';
      } else {
        // Something else happened
        errorMessage = `Error: ${error.message}`;
      }


      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Update mobile background image
  const updateMobileBackgroundImage = async (index, field, value) => {
    const itemKey = `mobile-bg-${index}`;
    setSavingItems(prev => new Set(prev).add(itemKey));

    const updatedData = {
      ...heroData,
      mobileBackgroundImages: heroData.mobileBackgroundImages.map((img, i) =>
        i === index ? { ...img, [field]: value } : img
      )
    };
    setHeroData(updatedData);

    // Auto-save to backend
    try {
      await saveChanges(updatedData);
    } catch (error) {
    } finally {
      setSavingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Update desktop background image
  const updateDesktopBackgroundImage = async (index, field, value) => {
    const itemKey = `desktop-bg-${index}`;
    setSavingItems(prev => new Set(prev).add(itemKey));

    const updatedData = {
      ...heroData,
      desktopBackgroundImages: heroData.desktopBackgroundImages.map((img, i) =>
        i === index ? { ...img, [field]: value } : img
      )
    };
    setHeroData(updatedData);

    // Auto-save to backend
    try {
      await saveChanges(updatedData);
    } catch (error) {
    } finally {
      setSavingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Update category
  const updateCategory = async (index, field, value) => {
    const itemKey = `cat-${index}`;
    setSavingItems(prev => new Set(prev).add(itemKey));

    const updatedData = {
      ...heroData,
      categories: heroData.categories.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat
      )
    };
    setHeroData(updatedData);

    // Auto-save to backend
    try {
      await saveChanges(updatedData);
    } catch (error) {
    } finally {
      setSavingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Delete image
  const deleteImage = async (type, index) => {
    let itemName = '';
    let updatedData = {};

    if (type === 'mobile-background') {
      itemName = `mobile background image ${index + 1}`;
      updatedData = {
        ...heroData,
        mobileBackgroundImages: heroData.mobileBackgroundImages.filter((_, i) => i !== index)
      };
    } else if (type === 'desktop-background') {
      itemName = `desktop background image ${index + 1}`;
      updatedData = {
        ...heroData,
        desktopBackgroundImages: heroData.desktopBackgroundImages.filter((_, i) => i !== index)
      };
    } else if (type === 'categories') {
      itemName = heroData.categories[index]?.title || `category ${index + 1}`;
      updatedData = {
        ...heroData,
        categories: heroData.categories.filter((_, i) => i !== index)
      };
    }

    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return;
    }

    setHeroData(updatedData);

    // Auto-save to backend
    try {
      await saveChanges(updatedData);
      showToast('success', `${itemName} deleted successfully!`);
    } catch (error) {
      showToast('error', `Error deleting ${itemName}. Please try again.`);
    }
  };

  // Reorder images
  const reorderImages = async (type, fromIndex, toIndex) => {
    let updatedData = {};

    if (type === 'mobile-background') {
      const newImages = [...heroData.mobileBackgroundImages];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);

      updatedData = {
        ...heroData,
        mobileBackgroundImages: newImages.map((img, index) => ({ ...img, order: index }))
      };
    } else if (type === 'desktop-background') {
      const newImages = [...heroData.desktopBackgroundImages];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);

      updatedData = {
        ...heroData,
        desktopBackgroundImages: newImages.map((img, index) => ({ ...img, order: index }))
      };
    } else if (type === 'categories') {
      const newCategories = [...heroData.categories];
      const [movedCategory] = newCategories.splice(fromIndex, 1);
      newCategories.splice(toIndex, 0, movedCategory);

      updatedData = {
        ...heroData,
        categories: newCategories.map((cat, index) => ({ ...cat, order: index }))
      };
    }

    setHeroData(updatedData);

    // Auto-save to backend
    try {
      await saveChanges(updatedData);
    } catch (error) {
    }
  };

  // Save changes
  const saveChanges = async (dataToSave = null) => {
    setSaving(true);
    try {
      const data = dataToSave || heroData;
      const response = await apiClient.put('/api/hero-section', data);
      if (response.data.success) {
        // Don't show alert for auto-saves during upload
        if (!dataToSave) {
          alert('Hero section updated successfully!');
        }
      }
    } catch (error) {
      if (!dataToSave) {
        alert('Error saving changes');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg text-gray-600 font-medium">Loading hero section...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Modern Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                Hero Section Management
              </h1>
              <p className="text-lg text-gray-600">Manage hero section images, categories, and slider settings</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={saveChanges}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Save className={`w-5 h-5 ${saving ? 'animate-pulse' : ''}`} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('mobile-background')}
              className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'mobile-background'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/25'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
            >
              📱 Mobile Background
            </button>
            <button
              onClick={() => setActiveTab('desktop-background')}
              className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'desktop-background'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/25'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
            >
              🖥️ Desktop Background
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'categories'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/25'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
            >
              🏷️ Categories
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/25'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
            >
              ⚙️ Slider Settings
            </button>
          </div>
        </div>

        {/* Mobile Background Images Tab */}
        {activeTab === 'mobile-background' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                  Mobile Background Images
                </h2>
                <p className="text-lg text-gray-600 mb-4">These images are used for the mobile hero section and desktop right side slider</p>
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/50">
                  <p className="text-sm text-blue-800 font-medium">
                    <strong>Mobile:</strong> Images slide automatically with configurable timing in Slider Settings<br />
                    <strong>Desktop Right Side:</strong> Same images displayed in the right side slider
                  </p>
                </div>
              </div>
              <label className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                <Upload className="w-5 h-5" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && handleImageUpload('mobile-background', e.target.files[0])}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroData.mobileBackgroundImages.map((image, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:bg-white/70 transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6 overflow-hidden shadow-lg">
                    <img
                      src={image.imageUrl}
                      alt={image.altText}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={image.altText}
                        onChange={(e) => updateMobileBackgroundImage(index, 'altText', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                        placeholder="Alt text"
                      />
                      {savingItems.has(`mobile-bg-${index}`) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl border border-green-100/50">
                          <input
                            type="checkbox"
                            checked={image.isActive}
                            onChange={(e) => updateMobileBackgroundImage(index, 'isActive', e.target.checked)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="font-bold text-gray-700">Active</span>
                        </label>
                        {/* {image.isActive && (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl px-3 py-2 border border-green-100/50">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium">Used on Mobile & Desktop Right Side</span>
                          </div>
                        )} */}
                      </div>

                      <div className="flex gap-2">
                        {index > 0 && (
                          <button
                            onClick={() => reorderImages('mobile-background', index, index - 1)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        )}
                        {index < heroData.mobileBackgroundImages.length - 1 && (
                          <button
                            onClick={() => reorderImages('mobile-background', index, index + 1)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteImage('mobile-background', index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Background Images Tab */}
        {activeTab === 'desktop-background' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                  Desktop Background Images
                </h2>
                <p className="text-lg text-gray-600 mb-4">These images are used for the main desktop hero background</p>
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/50">
                  <p className="text-sm text-blue-800 font-medium">
                    <strong>Desktop Main Background:</strong> Images slide automatically every 5 seconds with navigation dots<br />
                    <strong>Full Screen:</strong> Covers the entire desktop hero section with dark overlay
                  </p>
                </div>
              </div>
              <label className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                <Upload className="w-5 h-5" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && handleImageUpload('desktop-background', e.target.files[0])}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroData.desktopBackgroundImages.map((image, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:bg-white/70 transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6 overflow-hidden shadow-lg">
                    <img
                      src={image.imageUrl}
                      alt={image.altText}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={image.altText}
                        onChange={(e) => updateDesktopBackgroundImage(index, 'altText', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                        placeholder="Alt text"
                      />
                      {savingItems.has(`desktop-bg-${index}`) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl border border-green-100/50">
                          <input
                            type="checkbox"
                            checked={image.isActive}
                            onChange={(e) => updateDesktopBackgroundImage(index, 'isActive', e.target.checked)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="font-bold text-gray-700">Active</span>
                        </label>
                        {/* {image.isActive && (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl px-3 py-2 border border-green-100/50">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium">Used on Desktop Main Background</span>
                          </div>
                        )} */}
                      </div>

                      <div className="flex gap-2">
                        {index > 0 && (
                          <button
                            onClick={() => reorderImages('desktop-background', index, index - 1)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        )}
                        {index < heroData.desktopBackgroundImages.length - 1 && (
                          <button
                            onClick={() => reorderImages('desktop-background', index, index + 1)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteImage('desktop-background', index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Category Images
              </h2>
              <div className="flex gap-6">
                {/* Modern New Category Form */}
                <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">New Category Details</h3>
                  <p className="text-sm text-gray-500 mb-4">Fill in the details before uploading the image</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Category Title</label>
                      <input
                        type="text"
                        value={newCategoryData.title}
                        onChange={(e) => setNewCategoryData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                        placeholder="e.g., Kitchen Cleaning"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Category Link</label>
                      <input
                        type="text"
                        value={newCategoryData.link}
                        onChange={(e) => setNewCategoryData(prev => ({ ...prev, link: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                        placeholder="/wall-solution/upholstery"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Alt Text</label>
                      <input
                        type="text"
                        value={newCategoryData.altText}
                        onChange={(e) => setNewCategoryData(prev => ({ ...prev, altText: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                        placeholder="e.g., Kitchen Cleaning Service"
                      />
                    </div>
                  </div>

                  {/* Modern Preview */}
                  {(newCategoryData.title || newCategoryData.link) && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl">
                      <div className="font-bold text-blue-800 mb-2">Preview:</div>
                      <div className="text-blue-600 space-y-1">
                        <div><strong>Title:</strong> {newCategoryData.title || 'Not set'}</div>
                        <div><strong>Link:</strong> {newCategoryData.link || 'Not set'}</div>
                        <div><strong>Alt Text:</strong> {newCategoryData.altText || 'Not set'}</div>
                      </div>
                    </div>
                  )}
                </div>

                {(!newCategoryData.title || !newCategoryData.link) ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="px-6 py-3 rounded-2xl bg-gray-400 cursor-not-allowed flex items-center gap-3 font-bold shadow-xl text-white">
                      <Upload className="w-5 h-5" />
                      {uploading ? 'Uploading...' : 'Upload Category'}
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Fill in Category Title and Link above to enable upload
                    </p>
                  </div>
                ) : (
                  <label className="px-6 py-3 rounded-2xl cursor-pointer flex items-center gap-3 font-bold shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-2xl text-white">
                    <Upload className="w-5 h-5" />
                    {uploading ? 'Uploading...' : 'Upload Category'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0] && newCategoryData.title && newCategoryData.link) {
                          handleImageUpload('categories', e.target.files[0]);
                        } else if (e.target.files[0]) {
                          alert('Please fill in Category Title and Link before uploading');
                        }
                      }}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {heroData.categories.map((category, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:bg-white/70 transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6 overflow-hidden shadow-lg">
                    <img
                      src={category.imageUrl}
                      alt={category.altText}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={category.title}
                        onChange={(e) => updateCategory(index, 'title', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                        placeholder="Category title"
                      />
                      {savingItems.has(`cat-${index}`) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={category.link}
                        onChange={(e) => updateCategory(index, 'link', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                        placeholder="Link URL"
                      />
                      {savingItems.has(`cat-${index}`) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={category.altText}
                        onChange={(e) => updateCategory(index, 'altText', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                        placeholder="Alt text"
                      />
                      {savingItems.has(`cat-${index}`) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl border border-green-100/50">
                        <input
                          type="checkbox"
                          checked={category.isActive}
                          onChange={(e) => updateCategory(index, 'isActive', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="font-bold text-gray-700">Active</span>
                      </label>

                      <div className="flex gap-2">
                        {index > 0 && (
                          <button
                            onClick={() => reorderImages('categories', index, index - 1)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        )}
                        {index < heroData.categories.length - 1 && (
                          <button
                            onClick={() => reorderImages('categories', index, index + 1)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteImage('categories', index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-8">
              Slider Settings
            </h2>

            <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-lg">
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-2xl border border-green-100/50">
                  <input
                    type="checkbox"
                    checked={heroData.sliderSettings.autoSlide}
                    onChange={(e) => setHeroData(prev => ({
                      ...prev,
                      sliderSettings: { ...prev.sliderSettings, autoSlide: e.target.checked }
                    }))}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-xl font-bold text-gray-700">Enable Auto Slide</span>
                </div>

                <div className="space-y-4">
                  <label className="block text-lg font-bold text-gray-700">
                    Slide Interval (milliseconds)
                  </label>
                  <input
                    type="number"
                    value={heroData.sliderSettings.slideInterval}
                    onChange={(e) => setHeroData(prev => ({
                      ...prev,
                      sliderSettings: { ...prev.sliderSettings, slideInterval: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                    min="1000"
                    step="500"
                  />
                  <p className="text-sm text-gray-500">Time between automatic slide transitions</p>
                </div>

                <div className="space-y-4">
                  <label className="block text-lg font-bold text-gray-700">
                    Transition Duration (milliseconds)
                  </label>
                  <input
                    type="number"
                    value={heroData.sliderSettings.transitionDuration}
                    onChange={(e) => setHeroData(prev => ({
                      ...prev,
                      sliderSettings: { ...prev.sliderSettings, transitionDuration: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                    min="100"
                    step="100"
                  />
                  <p className="text-sm text-gray-500">Duration of the slide transition animation</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        <Toast
          show={toast.show}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
          type={toast.type}
          message={toast.message}
        />
      </div>
    </div>
  );
};

export default HeroSectionPage;
