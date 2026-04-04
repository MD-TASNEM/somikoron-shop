import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  X,
  Save,
  Upload,
  Image as ImageIcon,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Clock,
} from "lucide-react";

const AdminCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
    isActive: true,
    order: 0,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch("/api/admin/carousel", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        console.error("Authentication failed - redirecting to login");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSlides(
        Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : [],
      );
    } catch (error) {
      console.error("Error fetching carousel slides:", error);
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSlide
        ? `/api/admin/carousel/${editingSlide._id}`
        : "/api/admin/carousel";

      const method = editingSlide ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchSlides();
        setShowModal(false);
        setEditingSlide(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving slide:", error);
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      description: slide.description,
      image: slide.image,
      link: slide.link,
      isActive: slide.isActive,
      order: slide.order,
    });
    setImagePreview(slide.image);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this carousel slide?")) {
      try {
        await fetch(`/api/admin/carousel/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchSlides();
      } catch (error) {
        console.error("Error deleting slide:", error);
      }
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await fetch(`/api/admin/carousel/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSlides();
    } catch (error) {
      console.error("Error toggling slide:", error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (e, slide) => {
    setDraggedItem(slide);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, slide) => {
    e.preventDefault();
    setDragOverItem(slide);
  };

  const handleDrop = (e, targetSlide) => {
    e.preventDefault();
    if (draggedItem && draggedItem._id !== targetSlide._id) {
      const updatedSlides = slides.map((slide) => {
        if (slide._id === draggedItem._id) {
          return { ...slide, order: targetSlide.order };
        } else if (slide._id === targetSlide._id) {
          return { ...slide, order: draggedItem.order };
        }
        return slide;
      });

      // Reorder slides based on new order values
      const reorderedSlides = updatedSlides.sort((a, b) => a.order - b.order);
      updateSlideOrder(reorderedSlides);
    }
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const moveSlide = async (slideId, direction) => {
    const currentIndex = slides.findIndex((s) => s._id === slideId);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < slides.length) {
      const updatedSlides = [...slides];
      [updatedSlides[currentIndex], updatedSlides[newIndex]] = [
        updatedSlides[newIndex],
        updatedSlides[currentIndex],
      ];

      // Update order values
      updatedSlides.forEach((slide, index) => {
        slide.order = index;
      });

      updateSlideOrder(updatedSlides);
    }
  };

  const updateSlideOrder = async (updatedSlides) => {
    try {
      await fetch("/api/admin/carousel/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slides: updatedSlides.map((s) => ({ _id: s._id, order: s.order })),
        }),
      });
      setSlides(updatedSlides);
    } catch (error) {
      console.error("Error updating slide order:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
      link: "",
      isActive: true,
      order: 0,
    });
    setImagePreview("");
  };

  const filteredSlides = slides.filter(
    (slide) =>
      slide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slide.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">
            Carousel Management
          </h1>
          <p className="text-secondary/60 mt-1">
            Manage homepage carousel slides and content
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingSlide(null);
            setShowModal(true);
          }}
          className="mt-4 sm:mt-0 bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Slide
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary/10 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search slides by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary/5 rounded-lg">
            <Filter className="w-4 h-4 text-secondary/60" />
            <span className="text-sm font-medium text-secondary">
              {filteredSlides.length} of {slides.length} slides
            </span>
          </div>
        </div>
      </div>

      {/* Carousel Slides Grid */}
      <div className="space-y-4">
        {filteredSlides.map((slide, index) => (
          <div
            key={slide._id}
            draggable
            onDragStart={(e) => handleDragStart(e, slide)}
            onDragOver={(e) => handleDragOver(e, slide)}
            onDrop={(e) => handleDrop(e, slide)}
            onDragEnd={handleDragEnd}
            className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all cursor-move ${
              dragOverItem?._id === slide._id
                ? "border-primary border-2"
                : "border-secondary/10"
            } ${draggedItem?._id === slide._id ? "opacity-50" : ""}`}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Slide Preview */}
              <div className="w-full lg:w-80 h-48 lg:h-32 relative overflow-hidden rounded-lg">
                <img
                  src={
                    slide.image || "https://picsum.photos/seed/carousel/400/300"
                  }
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      slide.isActive
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {slide.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                {/* Order Controls */}
                <div className="absolute left-3 top-3 flex flex-col gap-1">
                  <button
                    onClick={() => moveSlide(slide._id, "up")}
                    disabled={index === 0}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveSlide(slide._id, "down")}
                    disabled={index === slides.length - 1}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Drag Handle */}
                <div className="absolute right-3 top-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all">
                  <GripVertical className="w-4 h-4 text-secondary/60" />
                </div>
              </div>

              {/* Slide Content */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary mb-2">
                    {slide.title}
                  </h3>
                  <p className="text-sm text-secondary/60 line-clamp-3 leading-relaxed">
                    {slide.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-secondary/60">
                    <ExternalLink className="w-4 h-4" />
                    <a
                      href={slide.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate max-w-xs"
                    >
                      {slide.link}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-secondary/60">
                    <Clock className="w-4 h-4" />
                    <span>Order: {slide.order + 1}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-secondary/10">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-dark transition-all text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(slide._id)}
                    className={`p-2.5 rounded-lg transition-all ${
                      slide.isActive
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {slide.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(slide._id)}
                    className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-secondary">
                  {editingSlide ? "Edit Carousel Slide" : "Add New Slide"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-secondary/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Slide Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Link URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="/category/all"
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Slide Image
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative border-2 border-dashed border-secondary/30 rounded-lg p-4 hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-secondary/40 mx-auto mb-2" />
                          <p className="text-sm text-secondary/60">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-secondary/40">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                    {(imagePreview || formData.image) && (
                      <div className="w-32 h-20 rounded-lg overflow-hidden border-2 border-secondary/20">
                        <img
                          src={imagePreview || formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    placeholder="Or enter image URL..."
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-primary border-secondary/20 rounded focus:ring-primary"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-secondary"
                >
                  Active (show on homepage)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all"
                >
                  {editingSlide ? "Update Slide" : "Create Slide"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-secondary/10 text-secondary py-3 rounded-xl font-bold hover:bg-secondary/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCarousel;
