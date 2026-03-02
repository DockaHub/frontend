import { Email, MailFolder } from '../types';
import api from './api';

export const mailService = {

  // GET: Fetch mailboxes for organization (Deprecated or Admin use)
  async getMailboxes(organizationId: string) {
    const response = await api.get(`/mail/mailboxes/${organizationId}`);
    return response.data;
  },

  // GET: Fetch ALL mailboxes for the current user (Global)
  async getUserMailboxes() {
    const response = await api.get(`/mail/mailboxes`);
    return response.data;
  },

  async getMailboxesByDomain(domain: string) {
    const response = await api.get(`/mail/by-domain`, { params: { domain } });
    return response.data;
  },

  // GET: Fetch emails based on mailbox and folder
  async getEmails(mailboxId: string, folder?: MailFolder): Promise<Email[]> {
    const response = await api.get(`/mail/mailboxes/${mailboxId}/emails`, {
      params: folder ? { folder } : {}
    });

    // Map backend data to frontend Email interface
    return response.data.map((email: any) => ({
      id: email.id,
      mailboxId: email.mailboxId,
      from: {
        name: email.fromName || email.sender?.name || 'Desconhecido',
        email: email.fromEmail || email.sender?.email || 'no-reply@docka.io',
        avatar: email.sender?.avatar
      },
      to: email.recipients?.map((r: any) => r.recipientEmail) || [],
      subject: email.subject,
      preview: email.preview || email.body.substring(0, 100),
      body: email.body,
      timestamp: new Date(email.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      read: email.read,
      starred: email.starred,
      labels: email.labels,
      folder: email.folder.toLowerCase(),
      hasAttachments: email.hasAttachments
    }));
  },

  // POST: Send a new email
  async sendEmail(mailboxId: string, emailData: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    html?: string;
  }): Promise<Email> {
    const response = await api.post(`/mail/mailboxes/${mailboxId}/emails`, emailData);
    return response.data;
  },

  // PATCH: Update email (mark as read, star, move folder, etc)
  async updateEmail(emailId: string, updates: {
    read?: boolean;
    starred?: boolean;
    folder?: MailFolder;
    labels?: string[];
  }): Promise<Email> {
    const response = await api.patch(`/mail/emails/${emailId}`, updates);
    return response.data;
  },

  // PATCH: Move to Trash/Archive or Restore
  async moveEmail(emailId: string, targetFolder: MailFolder): Promise<void> {
    await api.patch(`/mail/emails/${emailId}`, { folder: targetFolder });
  },

  // PATCH: Toggle Read Status
  async toggleRead(emailId: string, currentReadStatus: boolean): Promise<void> {
    await api.patch(`/mail/emails/${emailId}`, { read: !currentReadStatus });
  },

  // PATCH: Toggle Star
  async toggleStar(emailId: string, currentStarStatus: boolean): Promise<void> {
    await api.patch(`/mail/emails/${emailId}`, { starred: !currentStarStatus });
  },

  // DELETE: Delete email permanently
  async deleteEmail(emailId: string): Promise<void> {
    await api.delete(`/mail/emails/${emailId}`);
  },

  // POST: Create a new mailbox
  async createMailbox(organizationId: string, mailbox: any) {
    const response = await api.post(`/mail/organizations/${organizationId}/mailboxes`, mailbox);
    return response.data;
  },

  async updateMailbox(id: string, data: any) {
    const response = await api.patch(`/mail/mailboxes/${id}`, data);
    return response.data;
  },

  // DELETE: Delete a mailbox
  async deleteMailbox(id: string) {
    await api.delete(`/mail/mailboxes/${id}`);
  },

  // POST: Add user to mailbox
  async addUser(mailboxId: string, userId: string): Promise<any> {
    const response = await api.post(`/mail/mailboxes/${mailboxId}/users`, { userId });
    return response.data;
  },

  // DELETE: Remove user from mailbox
  async removeUser(mailboxId: string, userId: string): Promise<any> {
    const response = await api.delete(`/mail/mailboxes/${mailboxId}/users/${userId}`);
    return response.data;
  },

  // GET: Get unread counts (Global if no orgId, else org specific)
  async getUnreadCounts(organizationId?: string): Promise<Record<string, number>> {
    const url = organizationId ? `/mail/unread-counts/${organizationId}` : '/mail/unread-counts';
    const response = await api.get(url);
    return response.data;
  },

  // GET: Fetch labels for a mailbox
  async getLabels(mailboxId: string) {
    const response = await api.get(`/mail/mailboxes/${mailboxId}/labels`);
    return response.data;
  },

  // POST: Create a label
  async createLabel(mailboxId: string, data: { name: string; color: string }) {
    const response = await api.post(`/mail/mailboxes/${mailboxId}/labels`, data);
    return response.data;
  },

  // DELETE: Delete a label
  async deleteLabel(labelId: string) {
    const response = await api.delete(`/mail/labels/${labelId}`);
    return response.data;
  }
};
