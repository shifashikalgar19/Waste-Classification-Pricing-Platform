import requests
import uuid
from typing import Dict, Any, Optional
from app.core import config

class PayPalService:
    @staticmethod
    def get_access_token() -> Optional[str]:
        """
        Fetches OAuth2 access token from PayPal.
        """
        if not config.PAYPAL_CLIENT_ID or not config.PAYPAL_CLIENT_SECRET:
            print("PayPal credentials not configured")
            return None

        url = f"{config.PAYPAL_API_BASE}/v1/oauth2/token"
        headers = {
            "Accept": "application/json",
            "Accept-Language": "en_US",
        }
        data = {"grant_type": "client_credentials"}
        
        try:
            response = requests.post(
                url,
                auth=(config.PAYPAL_CLIENT_ID, config.PAYPAL_CLIENT_SECRET),
                headers=headers,
                data=data
            )
            response.raise_for_status()
            return response.json().get("access_token")
        except Exception as e:
            print(f"PayPal Auth Error: {e}")
            return None

    @staticmethod
    def execute_payout(receiver_email: str, amount_in_inr: float, order_id: str) -> Dict[str, Any]:
        """
        Executes a payout to the specified receiver.
        Converts INR to USD for Sandbox compatibility in restricted regions.
        """
        amount_usd = amount_in_inr / config.INR_TO_USD_RATE
        
        if config.PAYPAL_SIMULATE:
            print(f"SIMULATING PAYPAL PAYOUT: ₹{amount_in_inr} (${amount_usd:.2f}) to {receiver_email}")
            return {
                "success": True, 
                "batch_id": f"SIM-{uuid.uuid4().hex[:12].upper()}", 
                "status": "SUCCESS (SIMULATED)",
                "amount_usd": amount_usd
            }

        token = PayPalService.get_access_token()
        if not token:
            return {"success": False, "error": "Authentication failed"}

        url = f"{config.PAYPAL_API_BASE}/v1/payments/payouts"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        }

        # Unique sender batch ID to prevent double payments
        batch_id = f"PAYOUT-{order_id}-{uuid.uuid4().hex[:8]}"

        payload = {
            "sender_batch_header": {
                "sender_batch_id": batch_id,
                "email_subject": f"ScrapX Payment for Order {order_id}",
                "email_message": f"You have received a payment for your scrap order {order_id}. Thank you for using ScrapX!"
            },
            "items": [
                {
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": f"{amount_usd:.2f}",
                        "currency": "USD"
                    },
                    "note": f"Payment for Order {order_id}",
                    "sender_item_id": order_id,
                    "receiver": receiver_email
                }
            ]
        }

        try:
            response = requests.post(url, headers=headers, json=payload)
            data = response.json()
            
            if response.status_code in [200, 201, 202]:
                return {
                    "success": True,
                    "batch_id": data.get("batch_header", {}).get("payout_batch_id"),
                    "status": data.get("batch_header", {}).get("batch_status")
                }
            else:
                return {
                    "success": False,
                    "error": data.get("message", "Payout failed"),
                    "details": data
                }
        except Exception as e:
            return {"success": False, "error": str(e)}
