export enum EEmailOutboxStatus {
  processing = 'processing',
  sent = 'sent',
  failed = 'failed',
  maxRetriesExceeded = 'max_retries_exceeded',
}
