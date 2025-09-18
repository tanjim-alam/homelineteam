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
        type === 'desktop-background' ? 'desktop' : 'mobile';

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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hero Section Management</h1>
        <button
          onClick={saveChanges}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('mobile-background')}
          className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'mobile-background'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          Mobile Background Images
        </button>
        <button
          onClick={() => setActiveTab('desktop-background')}
          className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'desktop-background'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          Desktop Background Images
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'categories'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'settings'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          Slider Settings
        </button>
      </div>

      {/* Mobile Background Images Tab */}
      {activeTab === 'mobile-background' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Mobile Background Images</h2>
              <p className="text-sm text-gray-600 mt-1">These images are used for the mobile hero section and desktop right side slider</p>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Mobile:</strong> Images slide automatically with configurable timing in Slider Settings<br />
                  <strong>Desktop Right Side:</strong> Same images displayed in the right side slider
                </p>
              </div>
            </div>
            <label className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {heroData.mobileBackgroundImages.map((image, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.altText}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={image.altText}
                      onChange={(e) => updateMobileBackgroundImage(index, 'altText', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Alt text"
                    />
                    {savingItems.has(`mobile-bg-${index}`) && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={image.isActive}
                          onChange={(e) => updateMobileBackgroundImage(index, 'isActive', e.target.checked)}
                        />
                        Active
                      </label>
                      {image.isActive && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Used on Mobile & Desktop Right Side</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => reorderImages('mobile-background', index, index - 1)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      )}
                      {index < heroData.mobileBackgroundImages.length - 1 && (
                        <button
                          onClick={() => reorderImages('mobile-background', index, index + 1)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteImage('mobile-background', index)}
                        className="p-1 text-red-600 hover:text-red-800"
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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Desktop Background Images</h2>
              <p className="text-sm text-gray-600 mt-1">These images are used for the main desktop hero background</p>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Desktop Main Background:</strong> Images slide automatically every 5 seconds with navigation dots<br />
                  <strong>Full Screen:</strong> Covers the entire desktop hero section with dark overlay
                </p>
              </div>
            </div>
            <label className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {heroData.desktopBackgroundImages.map((image, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.altText}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={image.altText}
                      onChange={(e) => updateDesktopBackgroundImage(index, 'altText', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Alt text"
                    />
                    {savingItems.has(`desktop-bg-${index}`) && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={image.isActive}
                          onChange={(e) => updateDesktopBackgroundImage(index, 'isActive', e.target.checked)}
                        />
                        Active
                      </label>
                      {image.isActive && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Used on Desktop Main Background</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => reorderImages('desktop-background', index, index - 1)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      )}
                      {index < heroData.desktopBackgroundImages.length - 1 && (
                        <button
                          onClick={() => reorderImages('desktop-background', index, index + 1)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteImage('desktop-background', index)}
                        className="p-1 text-red-600 hover:text-red-800"
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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Category Images</h2>
            <div className="flex gap-3">
              {/* New Category Form */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-700 mb-3">New Category Details</h3>
                <p className="text-xs text-gray-500 mb-3">Fill in the details before uploading the image</p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category Title</label>
                    <input
                      type="text"
                      value={newCategoryData.title}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="e.g., Kitchen Cleaning"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category Link</label>
                    <input
                      type="text"
                      value={newCategoryData.link}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, link: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="/collections/kitchen-cleaning"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={newCategoryData.altText}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, altText: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="e.g., Kitchen Cleaning Service"
                    />
                  </div>
                </div>

                {/* Preview */}
                {(newCategoryData.title || newCategoryData.link) && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <div className="font-medium text-blue-800">Preview:</div>
                    <div className="text-blue-600">
                      <div><strong>Title:</strong> {newCategoryData.title || 'Not set'}</div>
                      <div><strong>Link:</strong> {newCategoryData.link || 'Not set'}</div>
                      <div><strong>Alt Text:</strong> {newCategoryData.altText || 'Not set'}</div>
                    </div>
                  </div>
                )}
              </div>

              <label className={`px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 ${!newCategoryData.title || !newCategoryData.link
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
                } text-white`}>
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Category'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files[0] && newCategoryData.title && newCategoryData.link) {
                      handleImageUpload('category', e.target.files[0]);
                    } else if (e.target.files[0]) {
                      alert('Please fill in Category Title and Link before uploading');
                    }
                  }}
                  disabled={uploading || !newCategoryData.title || !newCategoryData.link}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {heroData.categories.map((category, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img
                    src={category.imageUrl}
                    alt={category.altText}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={category.title}
                      onChange={(e) => updateCategory(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Category title"
                    />
                    {savingItems.has(`cat-${index}`) && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={category.link}
                      onChange={(e) => updateCategory(index, 'link', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Link URL"
                    />
                    {savingItems.has(`cat-${index}`) && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={category.altText}
                      onChange={(e) => updateCategory(index, 'altText', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Alt text"
                    />
                    {savingItems.has(`cat-${index}`) && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={category.isActive}
                        onChange={(e) => updateCategory(index, 'isActive', e.target.checked)}
                      />
                      Active
                    </label>

                    <div className="flex gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => reorderImages('categories', index, index - 1)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      )}
                      {index < heroData.categories.length - 1 && (
                        <button
                          onClick={() => reorderImages('categories', index, index + 1)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteImage('categories', index)}
                        className="p-1 text-red-600 hover:text-red-800"
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
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Slider Settings</h2>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={heroData.sliderSettings.autoSlide}
                  onChange={(e) => setHeroData(prev => ({
                    ...prev,
                    sliderSettings: { ...prev.sliderSettings, autoSlide: e.target.checked }
                  }))}
                />
                <span className="text-lg">Enable Auto Slide</span>
              </label>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Slide Interval (milliseconds)
                </label>
                <input
                  type="number"
                  value={heroData.sliderSettings.slideInterval}
                  onChange={(e) => setHeroData(prev => ({
                    ...prev,
                    sliderSettings: { ...prev.sliderSettings, slideInterval: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border rounded-md"
                  min="1000"
                  step="500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Transition Duration (milliseconds)
                </label>
                <input
                  type="number"
                  value={heroData.sliderSettings.transitionDuration}
                  onChange={(e) => setHeroData(prev => ({
                    ...prev,
                    sliderSettings: { ...prev.sliderSettings, transitionDuration: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border rounded-md"
                  min="100"
                  step="100"
                />
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
  );
};

export default HeroSectionPage;
