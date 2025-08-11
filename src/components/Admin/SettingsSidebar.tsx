"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUpdatePortfolio, IIntro } from "@/hooks/usePortfolio";

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioData?: {
    intro: IIntro;
  };
}

export default function SettingsSidebar({
  isOpen,
  onClose,
  portfolioData,
}: SettingsSidebarProps) {
  const { isAuthenticated } = useAuth();
  const updatePortfolio = useUpdatePortfolio();
  const [editData, setEditData] = useState<IIntro>(
    portfolioData?.intro || {
      name: "",
      email: "",
      phone: "",
      location: "",
      github: "",
      linkedin: "",
      instagram: "",
      twitter: "",
      website: "",
      avatar: "",
      title: "",
      description: "",
    }
  );

  const [activeSection, setActiveSection] = useState<
    "contact" | "social" | "personal"
  >("contact");

  if (!isAuthenticated || !isOpen) return null;

  const handleSave = async () => {
    try {
      await updatePortfolio.mutateAsync({ intro: editData });
      onClose();
    } catch (error) {
      console.error("Failed to update contact information:", error);
      alert("Failed to update contact information. Please try again.");
    }
  };

  const handleReset = () => {
    setEditData(
      portfolioData?.intro || {
        name: "",
        email: "",
        phone: "",
        location: "",
        github: "",
        linkedin: "",
        instagram: "",
        twitter: "",
        website: "",
        avatar: "",
        title: "",
        description: "",
      }
    );
  };

  const updateField = (field: keyof IIntro, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const sections = [
    { id: "contact", label: "Contact Info", icon: "fa-address-card" },
    { id: "social", label: "Social Media", icon: "fa-share-alt" },
    { id: "personal", label: "Personal Info", icon: "fa-user" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Settings Sidebar */}
      <div className="fixed top-0 right-0 h-full w-96 bg-gray-900 shadow-2xl border-l border-gray-700 z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <i className="fas fa-cog mr-3 text-blue-400"></i>
              Settings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Section Tabs */}
          <div className="flex space-x-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as "contact" | "social" | "personal")}
                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <i className={`fas ${section.icon} mr-2`}></i>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === "contact" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Contact Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editData.phone || ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={editData.location || ""}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="City, Country"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          )}

          {activeSection === "social" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Social Media Links
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <i className="fab fa-github mr-2"></i>
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={editData.github || ""}
                  onChange={(e) => updateField("github", e.target.value)}
                  placeholder="username"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <i className="fab fa-linkedin mr-2"></i>
                  LinkedIn Profile
                </label>
                <input
                  type="text"
                  value={editData.linkedin || ""}
                  onChange={(e) => updateField("linkedin", e.target.value)}
                  placeholder="username or full URL"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <i className="fab fa-instagram mr-2"></i>
                  Instagram Username
                </label>
                <input
                  type="text"
                  value={editData.instagram || ""}
                  onChange={(e) => updateField("instagram", e.target.value)}
                  placeholder="username"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <i className="fab fa-twitter mr-2"></i>
                  Twitter/X Username
                </label>
                <input
                  type="text"
                  value={editData.twitter || ""}
                  onChange={(e) => updateField("twitter", e.target.value)}
                  placeholder="username"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <i className="fas fa-globe mr-2"></i>
                  Website URL
                </label>
                <input
                  type="url"
                  value={editData.website || ""}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          )}

          {activeSection === "personal" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Personal Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nickname/Display Name
                </label>
                <input
                  type="text"
                  value={editData.nickname || ""}
                  onChange={(e) => updateField("nickname", e.target.value)}
                  placeholder="Optional nickname"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Professional Title
                </label>
                <input
                  type="text"
                  value={editData.title || ""}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g., Full Stack Developer"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Short Description
                </label>
                <textarea
                  value={editData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Brief description about yourself"
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={editData.avatar || ""}
                  onChange={(e) => updateField("avatar", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
                {editData.avatar && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">Preview:</p>
                    <img
                      src={editData.avatar}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={updatePortfolio.isPending}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {updatePortfolio.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Save Changes
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              title="Reset to original values"
            >
              <i className="fas fa-undo"></i>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              title="Cancel"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
