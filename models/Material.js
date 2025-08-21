import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["grammar", "template", "tips"],
    },
    language: {
      type: String,
      required: true,
      enum: ["english", "gujarati", "both"],
      default: "english",
    },
    description: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    // In Material.js, ensure files schema captures Cloudinary data
    files: [
      {
        originalName: String,
        filename: String, // For local files
        url: String, // For Cloudinary files
        publicId: String, // For Cloudinary files
        size: Number,
        mimetype: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
MaterialSchema.index({ type: 1, isActive: 1 });
MaterialSchema.index({ language: 1, isActive: 1 });
MaterialSchema.index({ uploadedBy: 1, isActive: 1 });

export default mongoose.models.Material ||
  mongoose.model("Material", MaterialSchema);
