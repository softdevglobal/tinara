import { useState, useRef } from "react";
import { Camera, Upload, Trash2, Eye, EyeOff, FileText, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentAttachment } from "@/types/document";
import { cn } from "@/lib/utils";

interface DocumentAttachmentsProps {
  attachments: DocumentAttachment[];
  onAttachmentsChange: (attachments: DocumentAttachment[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function DocumentAttachments({
  attachments,
  onAttachmentsChange,
  maxFiles = 10,
  maxSizeMB = 10,
}: DocumentAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    const newAttachments: DocumentAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      if (attachments.length + newAttachments.length >= maxFiles) break;

      const file = files[i];
      if (file.size > maxBytes) {
        console.warn(`File ${file.name} exceeds ${maxSizeMB}MB limit`);
        continue;
      }

      const attachment: DocumentAttachment = {
        id: `att_${Date.now()}_${i}`,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        uploadedBy: "current_user",
        uploadedAt: new Date().toISOString(),
        isVisibleToClient: true,
        clientVisible: true,
        url: URL.createObjectURL(file),
      };

      newAttachments.push(attachment);
    }

    onAttachmentsChange([...attachments, ...newAttachments]);
  };

  const handleRemove = (id: string) => {
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  };

  const toggleVisibility = (id: string) => {
    onAttachmentsChange(
      attachments.map((a) =>
        a.id === id
          ? { ...a, isVisibleToClient: !a.isVisibleToClient, clientVisible: !a.clientVisible }
          : a
      )
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary hover:underline font-medium"
            >
              Click to upload
            </button>
            <span className="text-muted-foreground"> or drag and drop</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Images, PDFs, Documents up to {maxSizeMB}MB
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload Files
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            // In a real app, this would open camera
            fileInputRef.current?.click();
          }}
          className="flex-1"
        >
          <Camera className="h-4 w-4 mr-1" />
          Take Photo
        </Button>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            {attachments.length} file{attachments.length !== 1 ? "s" : ""} attached
          </div>
          
          <div className="space-y-1">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg group"
              >
                {getFileIcon(attachment.contentType)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {attachment.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleVisibility(attachment.id)}
                    className="h-7 w-7"
                    title={attachment.isVisibleToClient ? "Visible to client" : "Hidden from client"}
                  >
                    {attachment.isVisibleToClient ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(attachment.id)}
                    className="h-7 w-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {!attachment.isVisibleToClient && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Internal
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Include in send toggle */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <Checkbox id="includeAttachments" defaultChecked />
          <label htmlFor="includeAttachments" className="text-sm cursor-pointer">
            Include attachments when sending
          </label>
        </div>
      )}
    </div>
  );
}
