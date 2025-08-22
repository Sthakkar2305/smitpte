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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Upload, FileText, Download, Edit, Trash2 } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Unified file interface that works for both uploads and downloads
interface FileData {
  originalName?: string;
  originalname?: string; // For database compatibility
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
  files: FileData[];
  uploadedBy: {
    name: string;
    _id?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface MaterialUploadProps {
  token: string;
}

export default function MaterialUpload({ token }: MaterialUploadProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "grammar",
    language: "english",
    description: "",
    content: "",
  });

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
      } else {
        console.error("Failed to fetch materials");
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/api/upload-material", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          // Return a consistent FileData object
          return {
            originalName:
              result.originalName || result.originalname || file.name,
            originalname:
              result.originalName || result.originalname || file.name,
            filename: result.filename || result.publicId || file.name,
            url: result.url,
            publicId: result.publicId,
            size: result.size,
            mimetype: result.mimetype,
          };
        } else {
          console.error("Upload failed:", await response.text());
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
      return null;
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(
      (result) => result !== null
    ) as FileData[];

    setUploadedFiles((prev) => [...prev, ...successfulUploads] as FileData[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingMaterial
        ? `/api/materials?id=${editingMaterial._id}`
        : "/api/materials";
      const method = editingMaterial ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          files: uploadedFiles,
        }),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        resetForm();
        fetchMaterials();
      } else {
        console.error("Failed to save material");
      }
    } catch (error) {
      console.error("Error creating/updating material:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      type: material.type,
      language: material.language,
      description: material.description || "",
      content: material.content || "",
    });
    setUploadedFiles(material.files || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/materials?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchMaterials();
      } else {
        console.error("Failed to delete material");
      }
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadFile = async (file: FileData) => {
    try {
      console.log("File object received:", file);

      const originalName =
        file.originalName || file.originalname || file.filename || "download";
      const fileUrl = file.url || file.path;

      // Always try to use the URL first (for Cloudinary files)
      if (fileUrl) {
        console.log("Opening URL:", fileUrl);

        // For Cloudinary files, add download flag
        let downloadUrl = fileUrl;
        if (
          fileUrl.includes("cloudinary.com") &&
          !fileUrl.includes("fl_attachment")
        ) {
          downloadUrl = fileUrl.includes("?")
            ? `${fileUrl}&fl_attachment`
            : `${fileUrl}?fl_attachment`;
        }

        window.open(downloadUrl, "_blank");
        return;
      }

      // Fallback to local file download only if no URL exists
      if (file.filename) {
        console.log("No URL found, trying local file download");
        const apiUrl = `/api/download/${encodeURIComponent(
          file.filename
        )}?originalName=${encodeURIComponent(originalName)}`;
        window.open(apiUrl, "_blank");
        return;
      }

      throw new Error("No valid file information available");
    } catch (err) {
      console.error("Download failed", err, "File object was:", file);
      alert("Download failed. Please try again.");
    }
  };
  const resetForm = () => {
    setFormData({
      title: "",
      type: "grammar",
      language: "english",
      description: "",
      content: "",
    });
    setUploadedFiles([]);
    setEditingMaterial(null);
  };

  useEffect(() => {
    fetchMaterials();
  }, [token]);

  // Debug: log materials structure
  useEffect(() => {
    if (materials.length > 0) {
      console.log("All materials:", materials);
      materials.forEach((material, index) => {
        console.log(`Material ${index}: ${material.title}`);
        if (material.files && material.files.length > 0) {
          console.log("Files in this material:", material.files);
          material.files.forEach((file, fileIndex) => {
            console.log(`File ${fileIndex} properties:`, Object.keys(file));
            console.log(`File ${fileIndex} values:`, file);
          });
        }
      });
    }
  }, [materials]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Learning Materials</CardTitle>
              <CardDescription>
                Upload and manage grammar notes, templates, and PTE tips
              </CardDescription>
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Material
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingMaterial
                      ? "Edit Learning Material"
                      : "Upload Learning Material"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingMaterial
                      ? "Update the learning material"
                      : "Add new learning materials for students"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Material Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select material type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grammar">Grammar Notes</SelectItem>
                        <SelectItem value="template">Templates</SelectItem>
                        <SelectItem value="tips">PTE Tips</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="gujarati">Gujarati</SelectItem>
                        <SelectItem value="both">Both Languages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Text Content (Optional)</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      className="mt-1"
                      rows={4}
                      placeholder="Add text content here..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="files">Upload Files</Label>
                    <div className="mt-2">
                      <Input
                        id="files"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.wav"
                        onChange={handleFileUpload}
                        className="mb-2"
                      />
                      <p className="text-xs text-gray-500">
                        Supported formats: PDF, DOC, DOCX, JPG, PNG, MP3, WAV
                      </p>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2 max-h-40 overflow-auto">
                        <Label className="text-sm font-medium">
                          Uploaded Files:
                        </Label>
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded"
                          >
                            <div className="flex items-center min-w-0">
                              <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="text-sm truncate">
                                {file.originalName ||
                                  file.filename ||
                                  "Unknown file"}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => downloadFile(file)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : editingMaterial ? (
                      "Update Material"
                    ) : (
                      "Upload Material"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead className="text-right">Files</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material._id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {material.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{material.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{material.language}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {material.files?.length || 0} files
                    </TableCell>
                    <TableCell>
                      {new Date(material.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(material)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the material.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(material._id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
