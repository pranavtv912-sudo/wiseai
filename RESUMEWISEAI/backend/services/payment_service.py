"""
L402 Payment Service
Handles mock Lightning network invoices, macaroons, and preimage verification
"""

import os
import hashlib
import secrets
import base64
import json
from datetime import datetime, timedelta

class PaymentService:
    """Service for managing mock L402 micropayments"""

    def __init__(self):
        self.price_sats = 100  # Default cost: 100 satoshis

    def generate_payment_request(self, resume_id: str) -> dict:
        """
        Generate a mock L402 challenge consisting of an invoice and a macaroon.
        
        The payment_hash is SHA256 of a randomly generated preimage.
        We store the relation so we can verify it, or we can just require the client to supply
        the correct preimage that hashes to the payment_hash.
        """
        # Generate random preimage (32 bytes) and its SHA256 hash
        preimage_bytes = secrets.token_bytes(32)
        preimage = preimage_bytes.hex()
        payment_hash = hashlib.sha256(preimage_bytes).hexdigest()

        # Generate a mock Lightning invoice (Bolt11-like string)
        # Format: lnbc{amount}{multiplier}1p{data}...
        invoice = f"lnbc1u1p{secrets.token_hex(20)}target{resume_id}hash{payment_hash[:10]}"

        # Create a simple macaroon metadata dictionary
        macaroon_data = {
            "resume_id": resume_id,
            "payment_hash": payment_hash,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(hours=2)).isoformat(),
            # For mockup validation convenience, we can encrypt/store the expected preimage
            # but cryptographically we can also verify the preimage hashes to payment_hash.
            # We'll keep the expected preimage inside the macaroon in a simplified base64 encrypted form,
            # or just match it against our database / check hash.
            "secret_checksum": base64.b64encode(preimage_bytes).decode('utf-8')
        }

        # Base64 encode the macaroon JSON
        macaroon_json = json.dumps(macaroon_data)
        macaroon = base64.b64encode(macaroon_json.encode('utf-8')).decode('utf-8')

        return {
            "invoice": invoice,
            "macaroon": macaroon,
            "payment_hash": payment_hash,
            "preimage": preimage, # Return preimage only for mockup simulation
            "amount_sats": self.price_sats
        }

    def verify_payment(self, macaroon_b64: str, preimage: str) -> bool:
        """
        Verify the proof of payment.
        Validates that the SHA256 of the preimage matches the payment_hash inside the macaroon.
        """
        try:
            if not macaroon_b64 or not preimage:
                return False

            # Decode macaroon
            macaroon_json = base64.b64decode(macaroon_b64.encode('utf-8')).decode('utf-8')
            macaroon_data = json.loads(macaroon_json)

            payment_hash = macaroon_data.get("payment_hash")
            expires_at_str = macaroon_data.get("expires_at")

            if not payment_hash:
                return False

            # Verify expiration
            if expires_at_str:
                expires_at = datetime.fromisoformat(expires_at_str)
                if datetime.utcnow() > expires_at:
                    return False

            # Verify cryptographic preimage matches the payment hash
            preimage_bytes = bytes.fromhex(preimage)
            calculated_hash = hashlib.sha256(preimage_bytes).hexdigest()

            return calculated_hash == payment_hash

        except Exception as e:
            print(f"[ERROR] Payment verification failed: {e}")
            return False

    def verify_algorand_payment(self, txid: str, expected_receiver: str = None, expected_amount_microalgos: int = 100000) -> bool:
        """
        Verify an Algorand payment transaction on-chain.
        expected_amount_microalgos defaults to 100000 (0.1 ALGO).
        """
        try:
            if not txid:
                return False
                
            import requests
            # Use public Algonode API for Testnet
            url = f"https://testnet-api.algonode.cloud/v2/transactions/{txid}"
            
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                print(f"[ERROR] Algorand node transaction fetch failed for {txid}: {response.text}")
                return False
                
            tx_data = response.json()
            txn = tx_data.get("transaction", {})
            payment = txn.get("payment-transaction", {})
            
            tx_type = txn.get("type")
            if tx_type != "pay":
                print(f"[ERROR] Algorand transaction {txid} type is not pay: {tx_type}")
                return False
                
            receiver = payment.get("receiver")
            if expected_receiver and receiver != expected_receiver:
                print(f"[ERROR] Algorand receiver mismatch: expected {expected_receiver}, got {receiver}")
                return False
                
            amount = payment.get("amount", 0)
            if amount < expected_amount_microalgos:
                print(f"[ERROR] Algorand amount too low: expected {expected_amount_microalgos}, got {amount}")
                return False
                
            print(f"[SUCCESS] Algorand transaction {txid} verified on-chain. Sent {amount} microalgos.")
            return True
        except Exception as e:
            print(f"[ERROR] Algorand verification exception: {e}")
            return False

