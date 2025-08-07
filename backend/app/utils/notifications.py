import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os

def send_email(
    to_email: str,
    subject: str,
    body: str,
    from_email: Optional[str] = None
) -> bool:
    """Send email notification"""
    try:
        # Get email configuration from environment
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        
        if not all([smtp_username, smtp_password]):
            print("Email configuration not found")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = from_email or smtp_username
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add body
        msg.attach(MIMEText(body, 'html'))
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_project_share_notification(
    to_email: str,
    project_name: str,
    shared_by: str,
    share_url: str
) -> bool:
    """Send project share notification email"""
    subject = f"Project '{project_name}' shared with you"
    body = f"""
    <html>
        <body>
            <h2>Project Shared</h2>
            <p><strong>{shared_by}</strong> has shared the project <strong>{project_name}</strong> with you.</p>
            <p>Click the link below to view the project:</p>
            <p><a href="{share_url}">{share_url}</a></p>
            <p>You can accept or decline this share request from your dashboard.</p>
        </body>
    </html>
    """
    return send_email(to_email, subject, body)

def send_welcome_email(to_email: str, user_name: str) -> bool:
    """Send welcome email to new user"""
    subject = "Welcome to AmpFlux!"
    body = f"""
    <html>
        <body>
            <h2>Welcome to AmpFlux!</h2>
            <p>Hi {user_name},</p>
            <p>Welcome to AmpFlux! Your account has been successfully created.</p>
            <p>You can now start creating and managing your electrical circuit projects.</p>
            <p>Best regards,<br>The AmpFlux Team</p>
        </body>
    </html>
    """
    return send_email(to_email, subject, body)

def send_password_reset_email(to_email: str, reset_token: str, reset_url: str) -> bool:
    """Send password reset email"""
    subject = "Password Reset Request"
    body = f"""
    <html>
        <body>
            <h2>Password Reset</h2>
            <p>You have requested a password reset for your AmpFlux account.</p>
            <p>Click the link below to reset your password:</p>
            <p><a href="{reset_url}">{reset_url}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
        </body>
    </html>
    """
    return send_email(to_email, subject, body)

def send_project_update_notification(
    to_email: str,
    project_name: str,
    updated_by: str,
    update_type: str
) -> bool:
    """Send project update notification"""
    subject = f"Project '{project_name}' updated"
    body = f"""
    <html>
        <body>
            <h2>Project Updated</h2>
            <p>The project <strong>{project_name}</strong> has been {update_type} by <strong>{updated_by}</strong>.</p>
            <p>Log in to your dashboard to view the changes.</p>
        </body>
    </html>
    """
    return send_email(to_email, subject, body)

def send_simulation_complete_notification(
    to_email: str,
    project_name: str,
    simulation_result: dict
) -> bool:
    """Send simulation completion notification"""
    subject = f"Simulation completed for '{project_name}'"
    body = f"""
    <html>
        <body>
            <h2>Simulation Complete</h2>
            <p>The simulation for project <strong>{project_name}</strong> has been completed.</p>
            <p>Results:</p>
            <ul>
                <li>Status: {simulation_result.get('status', 'Unknown')}</li>
                <li>Duration: {simulation_result.get('duration', 'Unknown')}</li>
            </ul>
            <p>Log in to your dashboard to view the detailed results.</p>
        </body>
    </html>
    """
    return send_email(to_email, subject, body) 