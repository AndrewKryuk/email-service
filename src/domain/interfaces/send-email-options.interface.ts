export interface ISendEmailOptions {
  /**
   * email addresses
   */
  to: string[];

  /**
   * email subject
   */
  subject: string;

  /**
   * html email contnet
   */
  html: string;
}
