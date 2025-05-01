import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpSecure = this.configService.get<boolean>('SMTP_SECURE') === true;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      console.error(
        'Email service environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) not fully configured. Emails will not be sent.',
      );

      this.transporter = null as any; // set to null to indicate that the transporter is not configured
    } else {
      try {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
        console.log('Email service transporter created successfully.');
      } catch (error) {
        console.error('Failed to create email service transporter:', error);
        this.transporter.transporter = null as any; // set to null to indicate that the transporter is not configured
      }
    }
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetLink: string,
  ): Promise<void> {
    if (!this.transporter) {
      console.warn(
        `Email not sent to ${to}: Email transporter not configured.`,
      );

      return;
    }

    const emailFrom =
      this.configService.get<string>('EMAIL_FROM') || 'noreply@your-app.com'; // sender email address

    const mailOptions = {
      from: emailFrom,
      to: to,
      subject: 'Password Reset Request',
      text: `Hello ${name},\n\nYou requested a password reset. Click the link below to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nDatacom Team`,
      html: `<p>Hello ${name},</p><p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link will expire in 1 hour.</p><p>If you did not request a password reset, please ignore this email.</p><p>Best regards,<br>Datacom Team</p>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${to}: ${info.response}`);
    } catch (error) {
      console.error(
        `Failed to send password reset email to ${to}: ${error.message}`,
      );
    }
  }
}
