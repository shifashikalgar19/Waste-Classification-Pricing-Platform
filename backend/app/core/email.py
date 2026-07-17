import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core import config

def send_otp_email(to_email: str, otp: str, user_name: str = "User"):
    """
    Sends an OTP email to the user using SMTP.
    """
    if not config.SMTP_USER or not config.SMTP_PASSWORD:
        print("SMTP credentials not configured. Skipping email.")
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = f"Your ScrapX Collection OTP: {otp}"
    message["From"] = f"ScrapX Team <{config.SMTP_USER}>"
    message["To"] = to_email

    text = f"Hello {user_name},\n\nYour OTP for order collection is: {otp}\n\nPlease share this with the delivery personnel to complete your order.\n\nBest regards,\nScrapX Team"
    
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; rounded: 10px;">
            <h2 style="color: #2563eb;">ScrapX Order Collection</h2>
            <p>Hello <strong>{user_name}</strong>,</p>
            <p>Your OTP for marking your scrap order as <strong>COLLECTED</strong> is:</p>
            <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937; margin: 20px 0; border-radius: 8px;">
                {otp}
            </div>
            <p>Please share this 4-digit code with the delivery personnel standing at your location.</p>
            <p style="font-size: 13px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                Safe collections with ScrapX. If you didn't request this, please ignore this email.
            </p>
        </div>
    </body>
    </html>
    """

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
            server.starttls()
            server.login(config.SMTP_USER, config.SMTP_PASSWORD)
            server.sendmail(config.SMTP_USER, to_email, message.as_string())
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_order_approved_email(to_email: str, user_name: str, has_payout_details: bool):
    """
    Sends an order approved email to the user.
    """
    if not config.SMTP_USER or not config.SMTP_PASSWORD:
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = "Your ScrapX Order has been Approved!"
    message["From"] = f"ScrapX Team <{config.SMTP_USER}>"
    message["To"] = to_email

    payout_message = ""
    if not has_payout_details:
        payout_message = """
        <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 20px 0; color: #92400e;">
            <p style="margin: 0; font-weight: bold;">Action Required: Submit Payout Details</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Please log in to the app and submit your payout details to ensure a smooth payment process after collection.</p>
        </div>
        """

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #2563eb;">Great News! Order Approved</h2>
            <p>Hello <strong>{user_name}</strong>,</p>
            <p>Your scrap pickup request has been <strong>APPROVED</strong> by the admin. A delivery partner will be assigned to your location soon.</p>
            {payout_message}
            <p>You can track the status of your order in the ScrapX app.</p>
            <p style="font-size: 13px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                Thank you for choosing ScrapX for a cleaner planet.
            </p>
        </div>
    </body>
    </html>
    """

    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
            server.starttls()
            server.login(config.SMTP_USER, config.SMTP_PASSWORD)
            server.sendmail(config.SMTP_USER, to_email, message.as_string())
        return True
    except Exception as e:
        print(f"Failed to send approval email: {e}")
        return False

def send_delivery_started_email(to_email: str, user_name: str, delivery_name: str, delivery_phone: str):
    """
    Sends an email to the user when the delivery person starts the pickup journey.
    """
    if not config.SMTP_USER or not config.SMTP_PASSWORD:
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = "ScrapX Partner is on the way!"
    message["From"] = f"ScrapX Team <{config.SMTP_USER}>"
    message["To"] = to_email

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #059669;">Partner On The Way</h2>
            <p>Hello <strong>{user_name}</strong>,</p>
            <p>Our delivery partner is now on the way to your location for the scrap collection.</p>
            
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #166534; font-weight: bold;">Delivery Partner Details:</p>
                <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Name:</strong> {delivery_name}</p>
                <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Phone:</strong> {delivery_phone}</p>
            </div>

            <p>Please be available at the pickup address. Our partner will request a 4-digit OTP during collection.</p>
            <p style="font-size: 13px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                Happy Scrapping! <br> ScrapX Team
            </p>
        </div>
    </body>
    </html>
    """

    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
            server.starttls()
            server.login(config.SMTP_USER, config.SMTP_PASSWORD)
            server.sendmail(config.SMTP_USER, to_email, message.as_string())
        return True
    except Exception as e:
        print(f"Failed to send delivery started email: {e}")
        return False

def send_payment_success_email(to_email: str, user_name: str, order_details: dict, payout_details: dict):
    """
    Sends a professional invoice/bill email after successful payment payout.
    """
    if not config.SMTP_USER or not config.SMTP_PASSWORD:
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = f"Payment Successful: Invoice for Order #{str(order_details['_id'])[-6:].upper()}"
    message["From"] = f"ScrapX Payments <{config.SMTP_USER}>"
    message["To"] = to_email

    # Format dates
    executed_at = payout_details.get("executed_at")
    date_str = executed_at.strftime("%d %b %Y, %H:%M") if hasattr(executed_at, "strftime") else "Now"

    html = f"""
    <html>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
            <!-- Header -->
            <div style="background: #2563eb; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">PAYMENT RECEIPT</h1>
                <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px;">Thank you for your scrap contribution!</p>
            </div>

            <div style="padding: 40px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px;">
                    <div>
                        <p style="margin: 0; font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase;">Customer</p>
                        <p style="margin: 2px 0 0 0; font-size: 16px; font-weight: 600; color: #111827;">{user_name}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase;">Date</p>
                        <p style="margin: 2px 0 0 0; font-size: 14px; color: #374151;">{date_str}</p>
                    </div>
                </div>

                <!-- Invoice Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <th style="text-align: left; padding: 12px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Description</th>
                            <th style="text-align: right; padding: 12px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 20px 0; border-bottom: 1px solid #f3f4f6;">
                                <p style="margin: 0; font-weight: 600; color: #111827; text-transform: capitalize;">{order_details['material'].replace('_', ' ')} Scrap</p>
                                <p style="margin: 2px 0 0 0; font-size: 13px; color: #6b7280;">Net weight: {order_details['weight']} kg</p>
                            </td>
                            <td style="padding: 20px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; color: #111827;">
                                ₹ {payout_details['amount_inr']:.2f}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style="padding-top: 20px; text-align: right; font-size: 14px; color: #6b7280; font-weight: 600;">Converted Amount (USD):</td>
                            <td style="padding-top: 20px; text-align: right; font-size: 18px; color: #059669; font-weight: 800;">$ {payout_details['amount_usd']:.2f}</td>
                        </tr>
                    </tfoot>
                </table>

                <!-- Payout Details -->
                <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #f1f5f9;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase;">Transaction Info</p>
                    <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Gateway:</strong> PayPal</p>
                    <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Batch ID:</strong> <span style="font-family: monospace;">{payout_details['batch_id']}</span></p>
                    <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Destination:</strong> {payout_details['receiver']}</p>
                </div>

                <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #374151; font-weight: 600;">Processed by ScrapX Core Engine</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #9ca3af;">This is an automated receipt for your digital records.</p>
                </div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 12px; color: #9ca3af;">&copy; 2026 ScrapX Technologies. All rights reserved.</p>
        </div>
    </body>
    </html>
    """

    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
            server.starttls()
            server.login(config.SMTP_USER, config.SMTP_PASSWORD)
            server.sendmail(config.SMTP_USER, to_email, message.as_string())
        return True
    except Exception as e:
        print(f"Failed to send payment success email: {e}")
        return False
