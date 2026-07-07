'use client';

import { X, Trash2, Calendar, Mail, Phone, Building, MapPin, Tag, User as UserIcon, FileText } from 'lucide-react';
import { Lead } from '../types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  onDelete,
}: LeadDetailModalProps) {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary/80 bg-bg-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/25 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">{lead.name}</h3>
              <span className="badge badge-primary mt-1 text-[10px] uppercase font-bold">
                {lead.crm_status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-border-primary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-text-tertiary mt-1" />
              <div>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-semibold text-text-primary mt-1">{lead.email || 'Not Available'}</p>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-text-tertiary mt-1" />
              <div>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Phone Number</p>
                <p className="text-sm font-semibold text-text-primary mt-1">
                  {lead.mobile_without_country_code
                    ? `${lead.country_code ? '+' + lead.country_code : ''} ${lead.mobile_without_country_code}`
                    : 'Not Available'}
                </p>
              </div>
            </div>

            {/* Company */}
            <div className="flex items-start gap-3">
              <Building className="w-4 h-4 text-text-tertiary mt-1" />
              <div>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Company</p>
                <p className="text-sm font-semibold text-text-primary mt-1">{lead.company || 'Not Available'}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-text-tertiary mt-1" />
              <div>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Location</p>
                <p className="text-sm font-semibold text-text-primary mt-1">
                  {[lead.city, lead.state, lead.country].filter(Boolean).join(', ') || 'Not Available'}
                </p>
              </div>
            </div>

            {/* Owner */}
            <div className="flex items-start gap-3">
              <UserIcon className="w-4 h-4 text-text-tertiary mt-1" />
              <div>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Lead Owner</p>
                <p className="text-sm font-semibold text-text-primary mt-1">{lead.lead_owner || 'Not Available'}</p>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-text-tertiary mt-1" />
              <div>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Created Date</p>
                <p className="text-sm font-semibold text-text-primary mt-1">
                  {lead.created_at ? format(new Date(lead.created_at), 'MMM dd, yyyy HH:mm') : 'Not Available'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-border-primary/60 pt-6">
            <div className="flex gap-2 items-center text-text-secondary mb-3">
              <FileText className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">CRM Note</h4>
            </div>
            <div className="bg-bg-tertiary/50 border border-border-primary/80 rounded-xl p-4 text-sm text-text-primary font-medium leading-relaxed">
              {lead.crm_note || 'No notes added for this lead.'}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-border-primary/60 pt-6">
            <div className="flex gap-2 items-center text-text-secondary mb-3">
              <FileText className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Description</h4>
            </div>
            <div className="bg-bg-tertiary/50 border border-border-primary/80 rounded-xl p-4 text-sm text-text-primary font-medium leading-relaxed">
              {lead.description || 'No description available.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-primary/80 bg-bg-secondary flex justify-between items-center">
          <button
            onClick={() => onDelete(lead._id)}
            className="btn-danger flex items-center gap-2 py-2 text-xs"
          >
            <Trash2 className="w-4 h-4" />
            Delete Lead
          </button>
          <button
            onClick={onClose}
            className="btn-secondary py-2 text-xs"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
