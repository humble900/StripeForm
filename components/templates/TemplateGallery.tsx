"use client";

import React, { useState, useEffect } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import InlineLoading from "@/components/ui/inline-loading";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EyeIcon,
  DocumentDuplicateIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  DocumentTextIcon,
  CalendarIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { FormTemplate } from "@/lib/templates";

interface TemplateGalleryProps {
  onClose?: () => void;
  onTemplateSelect?: (templateId: string) => void;
}

export function TemplateGallery({
  onClose,
  onTemplateSelect,
}: TemplateGalleryProps) {
  const router = useRouter();
  const { user, isAuthenticated, isAnonymous, getUserTrackingData } = useAuth();
  const { addNotification } = useNotifications();

  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(
    null,
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copyingTemplate, setCopyingTemplate] = useState<string | null>(null);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory !== "all")
          params.append("category", selectedCategory);
        if (searchQuery) params.append("search", searchQuery);

        const response = await fetch(`/api/templates?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setTemplates(data.data);
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        addNotification({
          type: "error",
          title: "Error",
          message: "Failed to load templates",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [selectedCategory, searchQuery, addNotification]);

  const handleUseTemplate = async (template: FormTemplate) => {
    // Prevent multiple simultaneous template copies
    if (copyingTemplate) {
      console.log("⚠️ Template copy already in progress, ignoring request");
      return;
    }

    try {
      setCopyingTemplate(template.id);

      let userId = "anonymous";
      if (isAuthenticated && user) {
        userId = user.id;
      } else if (isAnonymous) {
        const trackingData = await getUserTrackingData();
        userId = trackingData.fingerprint;
      }

      // Silent background copy - no notifications during process
      const response = await fetch(`/api/templates/${template.id}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        // Only show success notification
        addNotification({
          type: "success",
          title: "Template Ready!",
          message: `"${template.name}" has been copied and is ready to edit`,
          duration: 3000,
        });

        // Close gallery and redirect to form builder
        if (onClose) onClose();
        if (onTemplateSelect) {
          onTemplateSelect(template.id);
        } else {
          // Navigate directly to the created form
          const createdFormId: string | undefined = data?.data?.formId;
          if (createdFormId) {
            router.push(`/builder?form=${createdFormId}`);
          } else {
            router.push(`/builder?template=${template.id}`);
          }
        }
      } else {
        throw new Error(data.error || "Failed to copy template");
      }
    } catch (error) {
      console.error("Error copying template:", error);
      addNotification({
        type: "error",
        title: "Copy Failed",
        message: "Failed to copy template. Please try again.",
        duration: 5000,
      });
    } finally {
      setCopyingTemplate(null);
    }
  };

  const handlePreviewTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Business":
        return <BriefcaseIcon className="w-4 h-4" />;
      case "Events":
        return <CalendarIcon className="w-4 h-4" />;
      case "HR":
        return <UserGroupIcon className="w-4 h-4" />;
      case "Product":
        return <CubeIcon className="w-4 h-4" />;
      case "Marketing":
        return <MegaphoneIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case "Business":
        return "from-blue-50 to-indigo-100";
      case "Events":
        return "from-purple-50 to-pink-100";
      case "HR":
        return "from-emerald-50 to-teal-100";
      case "Product":
        return "from-amber-50 to-orange-100";
      case "Marketing":
        return "from-rose-50 to-red-100";
      default:
        return "from-gray-50 to-slate-100";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 template-scroll overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Form Templates
                </h1>
                <p className="text-gray-600 mt-1">
                  Choose from our professionally designed templates to get
                  started quickly
                </p>
              </div>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content with inline loading */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <InlineLoading
              size="lg"
              text="Loading templates..."
              variant="dots"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 template-scroll overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Form Templates
              </h1>
              <p className="text-gray-600 mt-1">
                Choose from our professionally designed templates to get started
                quickly
              </p>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category.id)}
                      {category.name} ({category.count})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 template-scroll">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md"
            >
              <CardContent className="p-0">
                {/* Template Image */}
                <div
                  className={`relative h-48 bg-gradient-to-br ${getCategoryGradient(template.category)} rounded-t-lg overflow-hidden`}
                >
                  {/* Background image if provided */}
                  {template.previewImage || template.thumbnail ? (
                    <div
                      className="absolute inset-0 bg-center bg-cover"
                      style={{
                        backgroundImage: `url(${template.previewImage || template.thumbnail})`,
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {template.isFeatured && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <StarIcon className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-4 text-white text-sm">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {template.estimatedTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        {template.usageCount.toLocaleString()} uses
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <span className="text-sm text-gray-500">
                        {template.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewTemplate(template)}
                      className="flex-1"
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      disabled={copyingTemplate === template.id}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {copyingTemplate === template.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                      )}
                      Use Form
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No templates found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? `No templates match "${searchQuery}". Try a different search term.`
                : "No templates available in this category."}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeIcon className="w-5 h-5" />
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6">
              {/* Template Info */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  {getCategoryIcon(selectedTemplate.category)}
                  {selectedTemplate.category}
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {selectedTemplate.estimatedTime}
                </div>
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="w-4 h-4" />
                  {selectedTemplate.usageCount.toLocaleString()} uses
                </div>
                <Badge
                  className={getDifficultyColor(selectedTemplate.difficulty)}
                >
                  {selectedTemplate.difficulty}
                </Badge>
              </div>

              {/* Form Preview */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Form Preview
                </h4>
                <div className="space-y-4">
                  {selectedTemplate.templateData.fields
                    .slice(0, 5)
                    .map((field, index) => (
                      <div
                        key={field.id}
                        className="bg-white p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {index + 1}. {field.label}
                          </span>
                          {field.required && (
                            <span className="text-red-500 text-sm">*</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {field.type.replace("_", " ").toUpperCase()}
                        </div>
                        {field.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {field.description}
                          </div>
                        )}
                      </div>
                    ))}
                  {selectedTemplate.templateData.fields.length > 5 && (
                    <div className="text-center text-gray-500 text-sm">
                      ... and {selectedTemplate.templateData.fields.length - 5}{" "}
                      more questions
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setPreviewOpen(false);
                    handleUseTemplate(selectedTemplate);
                  }}
                  disabled={copyingTemplate === selectedTemplate.id}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {copyingTemplate === selectedTemplate.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  )}
                  Use This Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
