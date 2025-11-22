import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service using NodeMailer
 * Supports Gmail, SendGrid, or any SMTP service
 */

// Create transporter
let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    console.log('✅ Email service initialized');
    return transporter;
  } catch (error) {
    console.warn('⚠️  Email service not configured:', error.message);
    return null;
  }
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} - Send result
 */
export const sendEmail = async (options) => {
  const emailTransporter = createTransporter();

  if (!emailTransporter) {
    console.warn('Email service not configured. Skipping email send.');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `Campus Connect <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    console.log('✅ Email sent:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Campus Connect! 🎓';
  const text = `Hi ${user.fullName},\n\nWelcome to Campus Connect! We're excited to have you join our community.\n\nYour account has been created successfully. You can now:\n- Browse local internship opportunities\n- Find project collaborators\n- Attend campus events\n- Connect with fellow students\n\nGet started: ${process.env.FRONTEND_URL}\n\nBest regards,\nCampus Connect Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome to Campus Connect! 🎓</h2>
      <p>Hi <strong>${user.fullName}</strong>,</p>
      <p>Welcome to Campus Connect! We're excited to have you join our community.</p>
      <p>Your account has been created successfully. You can now:</p>
      <ul>
        <li>Browse local internship opportunities</li>
        <li>Find project collaborators</li>
        <li>Attend campus events</li>
        <li>Connect with fellow students</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Get Started</a>
      <p style="color: #666; font-size: 14px;">Best regards,<br>Campus Connect Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send email verification
 */
export const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  
  const subject = 'Verify Your Email - Campus Connect';
  const text = `Hi ${user.fullName},\n\nPlease verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create this account, please ignore this email.\n\nBest regards,\nCampus Connect Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Verify Your Email</h2>
      <p>Hi <strong>${user.fullName}</strong>,</p>
      <p>Please verify your email by clicking the button below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
      <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
      <p style="color: #666; font-size: 14px;">If you didn't create this account, please ignore this email.</p>
      <p style="color: #666; font-size: 14px;">Best regards,<br>Campus Connect Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const subject = 'Password Reset Request - Campus Connect';
  const text = `Hi ${user.fullName},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 30 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nCampus Connect Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Password Reset Request</h2>
      <p>Hi <strong>${user.fullName}</strong>,</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #EF4444; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
      <p style="color: #666; font-size: 14px;">This link will expire in 30 minutes.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      <p style="color: #666; font-size: 14px;">Best regards,<br>Campus Connect Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send opportunity application notification
 */
export const sendOpportunityApplicationEmail = async (opportunity, applicant) => {
  const subject = `New Application: ${opportunity.title}`;
  const text = `Hi,\n\n${applicant.fullName} has applied to your opportunity: ${opportunity.title}\n\nView application: ${process.env.FRONTEND_URL}/opportunities/${opportunity._id}\n\nBest regards,\nCampus Connect Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">New Application Received! 🎉</h2>
      <p><strong>${applicant.fullName}</strong> has applied to your opportunity:</p>
      <h3 style="color: #333;">${opportunity.title}</h3>
      <p><strong>Applicant Details:</strong></p>
      <ul>
        <li>Name: ${applicant.fullName}</li>
        <li>College: ${applicant.college}</li>
        <li>Year: ${applicant.year}</li>
        <li>Skills: ${applicant.skills.join(', ')}</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}/opportunities/${opportunity._id}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Application</a>
      <p style="color: #666; font-size: 14px;">Best regards,<br>Campus Connect Team</p>
    </div>
  `;

  return sendEmail({ to: opportunity.postedBy.email, subject, text, html });
};

/**
 * Send collaboration interest notification
 */
export const sendCollaborationInterestEmail = async (collaboration, interestedUser) => {
  const subject = `New Interest: ${collaboration.title}`;
  const text = `Hi,\n\n${interestedUser.fullName} is interested in joining your project: ${collaboration.title}\n\nView details: ${process.env.FRONTEND_URL}/collaborations/${collaboration._id}\n\nBest regards,\nCampus Connect Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Someone Wants to Collaborate! 🤝</h2>
      <p><strong>${interestedUser.fullName}</strong> is interested in joining your project:</p>
      <h3 style="color: #333;">${collaboration.title}</h3>
      <p><strong>User Details:</strong></p>
      <ul>
        <li>Name: ${interestedUser.fullName}</li>
        <li>College: ${interestedUser.college}</li>
        <li>Skills: ${interestedUser.skills.join(', ')}</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}/collaborations/${collaboration._id}" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Details</a>
      <p style="color: #666; font-size: 14px;">Best regards,<br>Campus Connect Team</p>
    </div>
  `;

  return sendEmail({ to: collaboration.createdBy.email, subject, text, html });
};

/**
 * Send event registration confirmation
 */
export const sendEventRegistrationEmail = async (event, user) => {
  const subject = `Registration Confirmed: ${event.title}`;
  const text = `Hi ${user.fullName},\n\nYour registration for "${event.title}" has been confirmed!\n\nEvent Details:\nDate: ${new Date(event.startDate).toLocaleDateString()}\nTime: ${event.startTime}\nMode: ${event.mode}\n\nView event: ${process.env.FRONTEND_URL}/events/${event._id}\n\nBest regards,\nCampus Connect Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Registration Confirmed! ✅</h2>
      <p>Hi <strong>${user.fullName}</strong>,</p>
      <p>Your registration for the following event has been confirmed:</p>
      <h3 style="color: #333;">${event.title}</h3>
      <div style="background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${event.startTime}</p>
        <p style="margin: 5px 0;"><strong>Mode:</strong> ${event.mode}</p>
        ${event.venue ? `<p style="margin: 5px 0;"><strong>Venue:</strong> ${event.venue.name}</p>` : ''}
        ${event.onlineLink ? `<p style="margin: 5px 0;"><strong>Link:</strong> ${event.onlineLink}</p>` : ''}
      </div>
      <a href="${process.env.FRONTEND_URL}/events/${event._id}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Event Details</a>
      <p style="color: #666; font-size: 14px;">Best regards,<br>Campus Connect Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send event reminder (1 day before)
 */
export const sendEventReminderEmail = async (event, user) => {
  const subject = `Reminder: ${event.title} Tomorrow!`;
  const text = `Hi ${user.fullName},\n\nReminder: "${event.title}" is happening tomorrow!\n\nDate: ${new Date(event.startDate).toLocaleDateString()}\nTime: ${event.startTime}\n\nDon't forget to join!\n\nBest regards,\nCampus Connect Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B;">Event Reminder! ⏰</h2>
      <p>Hi <strong>${user.fullName}</strong>,</p>
      <p>This is a reminder that the following event is happening <strong>tomorrow</strong>:</p>
      <h3 style="color: #333;">${event.title}</h3>
      <div style="background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${event.startTime}</p>
        ${event.onlineLink ? `<p style="margin: 5px 0;"><strong>Join Link:</strong> <a href="${event.onlineLink}">${event.onlineLink}</a></p>` : ''}
      </div>
      <p style="color: #666; font-size: 14px;">Don't forget to join!</p>
      <p style="color: #666; font-size: 14px;">Best regards,<br>Campus Connect Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send new message notification
 */
export const sendNewMessageEmail = async (sender, receiver, messagePreview) => {
  const subject = `New Message from ${sender.fullName}`;
  const text = `Hi ${receiver.fullName},\n\nYou have a new message from ${sender.fullName}:\n\n"${messagePreview}"\n\nReply: ${process.env.FRONTEND_URL}/messages\n\nBest regards,\nCampus Connect Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">New Message 💬</h2>
      <p>Hi <strong>${receiver.fullName}</strong>,</p>
      <p>You have a new message from <strong>${sender.fullName}</strong>:</p>
      <div style="background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0; font-style: italic;">
        "${messagePreview}"
      </div>
      <a href="${process.env.FRONTEND_URL}/messages" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reply Now</a>
      <p style="color: #666; font-size: 14px;">Best regards,<br>Campus Connect Team</p>
    </div>
  `;

  return sendEmail({ to: receiver.email, subject, text, html });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOpportunityApplicationEmail,
  sendCollaborationInterestEmail,
  sendEventRegistrationEmail,
  sendEventReminderEmail,
  sendNewMessageEmail,
};
