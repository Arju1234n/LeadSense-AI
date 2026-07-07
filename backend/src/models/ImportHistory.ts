import mongoose, { Schema, Document } from 'mongoose';

export interface IImportHistory extends Document {
  userId: mongoose.Types.ObjectId;
  filename: string;
  originalFilename: string;
  filepath: string;
  filesize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  skippedRecords: Array<{
    row: number;
    reason: string;
    data: Record<string, any>;
  }>;
  aiProvider: string;
  aiModel: string;
  processingTime: number;
  batchCount: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const importHistorySchema = new Schema<IImportHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    filepath: {
      type: String,
      required: true,
    },
    filesize: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      required: true,
      index: true,
    },
    totalRows: {
      type: Number,
      default: 0,
    },
    successfulRows: {
      type: Number,
      default: 0,
    },
    skippedRows: {
      type: Number,
      default: 0,
    },
    skippedRecords: {
      type: [
        {
          row: Number,
          reason: String,
          data: Schema.Types.Mixed,
        },
      ],
      default: [],
    },
    aiProvider: {
      type: String,
      required: true,
    },
    aiModel: {
      type: String,
      required: true,
    },
    processingTime: {
      type: Number,
      default: 0,
    },
    batchCount: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
importHistorySchema.index({ userId: 1, createdAt: -1 });
importHistorySchema.index({ status: 1, createdAt: -1 });
importHistorySchema.index({ createdAt: -1 });

export const ImportHistory = mongoose.model<IImportHistory>(
  'ImportHistory',
  importHistorySchema
);
