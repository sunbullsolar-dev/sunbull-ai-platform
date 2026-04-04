export enum CommunicationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH_NOTIFICATION = 'push_notification',
  IN_APP = 'in_app',
  CALL = 'call',
}

export interface TCPAConsent {
  consented: boolean;
  consentDate: Date;
  consentMethod?: string;
  ipAddress?: string;
}

export interface SMSMessage {
  id: string;
  leadId: string;
  phoneNumber: string;
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sentAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
  externalId?: string;
}

export interface EmailMessage {
  id: string;
  leadId: string;
  toEmail: string;
  subject: string;
  body: string;
  htmlBody?: string;
  status: 'pending' | 'sent' | 'failed' | 'opened' | 'clicked';
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  failureReason?: string;
  externalId?: string;
  attachments?: Array<{
    filename: string;
    url: string;
  }>;
}

export interface CommunicationLog {
  id: string;
  leadId: string;
  tenantId: string;
  channel: CommunicationChannel;
  messageType: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  content: string;
  recipientEmail?: string;
  recipientPhone?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
