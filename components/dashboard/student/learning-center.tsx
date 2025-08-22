"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Download, FileText, Search } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Update your FileObject interface to match your database structure
interface FileObject {
  originalname?: string; // Note: lowercase 'n' in your database
  filename?: string;
  url?: string;
  path?: string; // This might be present in your files
  size?: number;
  mimetype?: string;
  // Add any other properties that might be in your files
  [key: string]: any;
}
interface FileData {
  originalName?: string;
  originalname?: string;
  filename?: string;
  url?: string;
  path?: string;
  publicId?: string;
  size?: number;
  mimetype?: string;
  [key: string]: any;
}
interface Material {
  _id: string;
  title: string;
  type: string;
  language: string;
  description: string;
  content: string;
  files: FileObject[]; // This should match your actual file structure
  uploadedBy: {
    name: string;
    _id?: string; // Add this if needed
  };
  createdAt: string;
  updatedAt: string;
  // Add any other properties from your database
  [key: string]: any;
}
interface LearningCenterProps {
  token: string;
}

export default function LearningCenter({ token }: LearningCenterProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<string, boolean>
  >({});

  const fetchMaterials = async () => {
    try {
      const response = await fetch("/api/materials", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
        setFilteredMaterials(data);
      } else {
        console.error("Failed to fetch materials");
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    if (searchTerm) {
      filtered = filtered.filter(
        (material) =>
          material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((material) => material.type === typeFilter);
    }

    if (languageFilter !== "all") {
      filtered = filtered.filter(
        (material) =>
          material.language === languageFilter || material.language === "both"
      );
    }

    setFilteredMaterials(filtered);
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "grammar":
        return <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />;
      case "template":
        return <FileText className="h-4 w-4 sm:h-5 sm:w-5" />;
      case "tips":
        return <Search className="h-4 w-4 sm:h-5 sm:w-5" />;
      default:
        return <FileText className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "grammar":
        return "bg-blue-100 text-blue-800";
      case "template":
        return "bg-green-100 text-green-800";
      case "tips":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case "english":
        return "bg-orange-100 text-orange-800";
      case "gujarati":
        return "bg-pink-100 text-pink-800";
      case "both":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // In learning-center.tsx
const downloadFile = async (file: FileData) => {
  try {
    const originalName =
      file.originalName || file.originalname || file.filename || "download";

    if (file.url) {
      // ✅ Cloudinary direct URL
      const isCloudinary = file.url.includes("cloudinary.com");

      if (isCloudinary) {
        // Handle Cloudinary download directly
        const downloadUrl = file.url.includes("?")
          ? `${file.url}&fl_attachment=${encodeURIComponent(originalName)}`
          : `${file.url}?fl_attachment=${encodeURIComponent(originalName)}`;
        
        window.open(downloadUrl, "_blank");
        return;
      } else {
        // For non-Cloudinary URLs
        window.open(file.url, "_blank");
        return;
      }
    }

    // ❌ Fallback to download API for local files (if any)
    if (file.filename) {
      const apiUrl = `/api/download/${encodeURIComponent(file.filename)}?originalName=${encodeURIComponent(originalName)}`;
      window.open(apiUrl, "_blank");
      return;
    }

    alert("This file has no download link. Please re-upload it.");
  } catch (err) {
    console.error("Download failed", err, "File object was:", file);
    alert("Download failed. Please try again.");
  }
};



  useEffect(() => {
    if (token) {
      fetchMaterials();
    }
  }, [token]);

  useEffect(() => {
    filterMaterials();
  }, [searchTerm, typeFilter, languageFilter, materials]);

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Learning Center</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-2 sm:px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Learning Center</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Access grammar notes, templates, and PTE preparation tips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40 text-xs sm:text-sm">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs sm:text-sm">
                    All Types
                  </SelectItem>
                  <SelectItem value="grammar" className="text-xs sm:text-sm">
                    Grammar Notes
                  </SelectItem>
                  <SelectItem value="template" className="text-xs sm:text-sm">
                    Templates
                  </SelectItem>
                  <SelectItem value="tips" className="text-xs sm:text-sm">
                    PTE Tips
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-full sm:w-40 text-xs sm:text-sm">
                  <SelectValue placeholder="Filter by language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs sm:text-sm">
                    All Languages
                  </SelectItem>
                  <SelectItem value="english" className="text-xs sm:text-sm">
                    English
                  </SelectItem>
                  <SelectItem value="gujarati" className="text-xs sm:text-sm">
                    Gujarati
                  </SelectItem>
                  <SelectItem value="both" className="text-xs sm:text-sm">
                    Both Languages
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <Card
                key={material._id}
                className="hover:shadow-md transition-shadow overflow-hidden"
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2 min-w-0">
                      {getTypeIcon(material.type)}
                      <h3 className="font-semibold text-base sm:text-lg truncate">
                        {material.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={`${getTypeColor(material.type)} text-xs`}>
                      {material.type}
                    </Badge>
                    <Badge
                      className={`${getLanguageColor(
                        material.language
                      )} text-xs`}
                    >
                      {material.language}
                    </Badge>
                  </div>

                  {material.description && (
                    <div className="text-xs sm:text-sm text-gray-600 mb-3">
                      <p
                        className={
                          expandedDescriptions[material._id]
                            ? ""
                            : "line-clamp-2"
                        }
                      >
                        {material.description}
                      </p>
                      {material.description.length > 100 && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => toggleDescription(material._id)}
                          className="mt-1 p-0 text-blue-600 hover:underline"
                        >
                          {expandedDescriptions[material._id]
                            ? "Read Less"
                            : "Read More"}
                        </Button>
                      )}
                    </div>
                  )}

                  {material.content && (
                    <div className="mb-3">
                      <h4 className="font-medium text-xs sm:text-sm mb-1">
                        Content Preview:
                      </h4>
                      <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded line-clamp-3">
                        {material.content}
                      </p>
                    </div>
                  )}

                  {material.files && material.files.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-xs sm:text-sm mb-2">
                        Files ({material.files.length}):
                      </h4>
                      <div className="space-y-1">
                        {material.files
                          .slice(0, 2)
                          .map((file: FileObject, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-xs"
                            >
                              <span
                                className="truncate max-w-[120px] sm:max-w-[150px]"
                                title={file.originalName}
                              >
                                {file.originalName}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-auto px-2"
                                onClick={() => downloadFile(file)}
                              >
                                <Download className="h-3 w-3 inline-block mr-1" />
                                Download
                              </Button>
                            </div>
                          ))}
                        {material.files.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{material.files.length - 2} more files
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate max-w-[100px] sm:max-w-none">
                      By {material.uploadedBy?.name || "Unknown"}
                    </span>
                    <span>
                      {new Date(material.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4" />
              <p className="text-sm sm:text-base">
                No learning materials found
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
