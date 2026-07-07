import mongoose, { Schema, Document } from 'mongoose';
import { CRM_STATUS_VALUES, DEFAULT_CRM_STATUS } from '../constants/crmStatus';
import { DATA_SOURCE_VALUES, DEFAULT_DATA_SOURCE } from '../constants/dataSource';

export interface ILead extends Document {
  created_at: Date;
  name: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status: string;
  crm_note?: string;
  data_source: string;
  possession_time?: Date;
  description?: string;
  importHistoryId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    created_at: {
      type: Date,
      required: [true, 'Created date is required'],
      default: Date.now,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true,
    },
    country_code: {
      type: String,
      trim: true,
    },
    mobile_without_country_code: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      index: true,
    },
    lead_owner: {
      type: String,
      trim: true,
    },
    crm_status: {
      type: String,
      enum: CRM_STATUS_VALUES,
      default: DEFAULT_CRM_STATUS,
      required: true,
      index: true,
    },
    crm_note: {
      type: String,
      trim: true,
    },
    data_source: {
      type: String,
      enum: DATA_SOURCE_VALUES,
      default: DEFAULT_DATA_SOURCE,
      required: true,
      index: true,
    },
    possession_time: {
      type: Date,
    },
    description: {
      type: String,
      trim: true,
    },
    importHistoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ImportHistory',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
leadSchema.index({ email: 1, mobile_without_country_code: 1 });
leadSchema.index({ crm_status: 1, created_at: -1 });
leadSchema.index({ data_source: 1, created_at: -1 });
leadSchema.index({ userId: 1, created_at: -1 });
leadSchema.index({ importHistoryId: 1 });

// Text index for search functionality
leadSchema.index({
  name: 'text',
  email: 'text',
  company: 'text',
  city: 'text',
  country: 'text',
});

// Validation: At least email or mobile must be present
leadSchema.pre('validate', function (next) {
  if (!this.email && !this.mobile_without_country_code) {
    next(new Error('Either email or mobile number is required'));
  } else {
    next();
  }
});

export const Lead = mongoose.model<ILead>('Lead', leadSchema);
