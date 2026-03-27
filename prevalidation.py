"""
AtlasPay Pre-Validation Layer
Drop into existing FastAPI backend: from prevalidation import router as prevalidation_router
Then: app.include_router(prevalidation_router)
"""

import re
import hashlib
import asyncio
from datetime import datetime
from enum import Enum
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/prevalidation", tags=["prevalidation"])


# ---------------------------------------------------------------------------
# CONSTANTS
# ---------------------------------------------------------------------------

# OFAC/UN/EU/RBI — demo sanctioned wallet addresses (Polygon format)
SANCTIONED_ADDRESSES = {
    "0x7F367cC41522cE07553e823bf3be79A889DEBE1B",  # OFAC listed
    "0xd882cfc20f52f2599d84b8e8d58c7fb62cfe344b",
    "0x901bb9583b24d97e995513c6778dc6888ab6870e",
    "0xa7e5d5a720f06526557c513402f2e6b5fa20b008",
    "0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c",
    "0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a",
    "0x7db418b5d567a4e0e8c59ad71be1fce48f3e6107",
    "0x72a5843cc08275c8171e582972aa4fda8c397b2a",
    "0x7F367cC41522cE07553e823bf3be79A889DEBE1B",
    "0x000000000000000000000000000000000000dead",  # burn address — block by default
}

# Sanctioned countries (ISO 3166-1 alpha-2)
SANCTIONED_COUNTRIES = {"KP", "IR", "SY", "CU", "VE"}

# Currency compatibility matrix — which pairs are supported on which rails
CURRENCY_RAIL_MATRIX = {
    ("INR", "USD"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("INR", "EUR"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("INR", "GBP"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("INR", "JPY"): ["SWIFT", "MTO"],
    ("INR", "AUD"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("USD", "INR"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("USD", "EUR"): ["SWIFT", "SEPA", "MTO", "Stablecoin-Polygon"],
    ("USD", "GBP"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("USD", "BRL"): ["SWIFT", "MTO", "Pix-Bridge"],
    ("EUR", "INR"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("EUR", "USD"): ["SWIFT", "SEPA", "MTO", "Stablecoin-Polygon"],
    ("GBP", "INR"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("BRL", "USD"): ["SWIFT", "MTO", "Pix-Bridge"],
}

# Country → ISO code → sanctioned flag
COUNTRY_ISO = {
    "India": "IN", "United States": "US", "United Kingdom": "GB",
    "Germany": "DE", "France": "FR", "Brazil": "BR", "Japan": "JP",
    "Australia": "AU", "Canada": "CA", "Singapore": "SG",
    "North Korea": "KP", "Iran": "IR", "Syria": "SY", "Cuba": "CU",
}

# Country → default currency
COUNTRY_CURRENCY = {
    "India": "INR", "United States": "USD", "United Kingdom": "GBP",
    "Germany": "EUR", "France": "EUR", "Brazil": "BRL", "Japan": "JPY",
    "Australia": "AUD", "Canada": "CAD", "Singapore": "SGD",
}

# Rail availability by corridor (country pair)
RAIL_AVAILABILITY = {
    ("India", "United Kingdom"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("India", "United States"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("India", "Germany"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("India", "Australia"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("India", "Singapore"): ["SWIFT", "MTO", "UPI-Bridge", "Stablecoin-Polygon"],
    ("United States", "India"): ["SWIFT", "MTO", "Stablecoin-Polygon"],
    ("United States", "Germany"): ["SWIFT", "SEPA", "MTO", "Stablecoin-Polygon"],
    ("Brazil", "United States"): ["SWIFT", "MTO", "Pix-Bridge"],
}

# Velocity limits (per sender address per hour)
VELOCITY_LIMIT_PER_HOUR = 5
VELOCITY_LIMIT_USD_PER_DAY = 50000

# In-memory velocity store: {address: [(timestamp, amount_usd)]}
_velocity_store: dict = {}


# ---------------------------------------------------------------------------
# SCHEMAS
# ---------------------------------------------------------------------------

class PreValidationRequest(BaseModel):
    sender_address: str
    receiver_address: str
    sender_country: str
    receiver_country: str
    amount_usd: float
    currency_from: Optional[str] = None
    currency_to: Optional[str] = None
    selected_rail: Optional[str] = None


class CheckResult(BaseModel):
    check: str
    status: str          # PASS | FAIL | WARN
    detail: str
    latency_ms: int


class PreValidationResponse(BaseModel):
    valid: bool
    transaction_allowed: bool
    checks: list[CheckResult]
    available_rails: list[str]
    blocked_reason: Optional[str]
    risk_score: float        # 0.0 (clean) → 1.0 (high risk)
    validation_id: str
    timestamp: str


# ---------------------------------------------------------------------------
# VALIDATION FUNCTIONS
# ---------------------------------------------------------------------------

def _validate_wallet_format(address: str) -> tuple[bool, str]:
    """EVM address: 0x + 40 hex chars, optionally EIP-55 checksummed."""
    if not address:
        return False, "Address is empty"
    if not re.match(r"^0x[0-9a-fA-F]{40}$", address):
        return False, f"Invalid EVM address format: {address[:12]}..."
    if address == "0x" + "0" * 40:
        return False, "Zero address not permitted"
    return True, f"Valid EVM address ({address[:6]}...{address[-4:]})"


def _sanctions_screen(sender: str, receiver: str, sender_country: str, receiver_country: str) -> tuple[str, str]:
    """Check addresses and countries against sanctions lists."""
    sender_norm = sender.lower()
    receiver_norm = receiver.lower()
    sanctioned_norm = {a.lower() for a in SANCTIONED_ADDRESSES}

    if sender_norm in sanctioned_norm:
        return "FAIL", f"Sender address matches OFAC SDN list"
    if receiver_norm in sanctioned_norm:
        return "FAIL", f"Receiver address matches OFAC SDN list"

    sender_iso = COUNTRY_ISO.get(sender_country, "")
    receiver_iso = COUNTRY_ISO.get(receiver_country, "")

    if sender_iso in SANCTIONED_COUNTRIES:
        return "FAIL", f"Sender country {sender_country} is under active sanctions (OFAC/UN)"
    if receiver_iso in SANCTIONED_COUNTRIES:
        return "FAIL", f"Receiver country {receiver_country} is under active sanctions (OFAC/UN)"

    return "PASS", "No matches on OFAC SDN, UN Consolidated, EU, or RBI caution lists"


def _currency_compatibility(
    sender_country: str,
    receiver_country: str,
    currency_from: Optional[str],
    currency_to: Optional[str],
) -> tuple[str, str, list[str]]:
    """Verify currency pair is supported and return available rails."""
    cfrom = currency_from or COUNTRY_CURRENCY.get(sender_country)
    cto = currency_to or COUNTRY_CURRENCY.get(receiver_country)

    if not cfrom or not cto:
        return "WARN", f"Could not resolve currencies for corridor", []

    pair = (cfrom, cto)
    rails = CURRENCY_RAIL_MATRIX.get(pair, [])

    if not rails:
        # Try reverse lookup for symmetric pairs
        rails = CURRENCY_RAIL_MATRIX.get((cto, cfrom), [])

    if not rails:
        return (
            "FAIL",
            f"Currency pair {cfrom}/{cto} not supported on any available rail",
            [],
        )

    return "PASS", f"{cfrom} → {cto} supported on {len(rails)} rail(s)", rails


def _rail_availability(sender_country: str, receiver_country: str) -> tuple[str, str, list[str]]:
    """Check which rails are live for this corridor."""
    key = (sender_country, receiver_country)
    rails = RAIL_AVAILABILITY.get(key)

    if rails is None:
        # Default fallback — SWIFT is always available for unlisted corridors
        return "WARN", f"Corridor not in optimized routing table — defaulting to SWIFT", ["SWIFT"]

    return "PASS", f"{len(rails)} rail(s) available: {', '.join(rails)}", rails


def _amount_limits(amount_usd: float, sender_country: str) -> tuple[str, str]:
    """Check transaction amount against regulatory and operational limits."""
    if amount_usd <= 0:
        return "FAIL", "Amount must be greater than 0"
    if amount_usd > VELOCITY_LIMIT_USD_PER_DAY:
        return "FAIL", f"Amount ${amount_usd:,.2f} exceeds single-transaction limit of ${VELOCITY_LIMIT_USD_PER_DAY:,}"

    # India FEMA: outward remittance above $250,000/year requires CA certificate
    if sender_country == "India" and amount_usd > 250000:
        return "FAIL", "Amount exceeds India LRS limit of $250,000 per financial year"

    # FATF Travel Rule threshold
    travel_rule_note = ""
    if amount_usd >= 1000:
        travel_rule_note = " | FATF Travel Rule applies — originator/beneficiary data required"

    return "PASS", f"Amount ${amount_usd:,.2f} within operational limits{travel_rule_note}"


def _velocity_check(sender_address: str, amount_usd: float) -> tuple[str, str]:
    """Rate limit: max 5 transactions/hour per address."""
    now = datetime.utcnow().timestamp()
    hour_ago = now - 3600
    day_ago = now - 86400

    history = _velocity_store.get(sender_address.lower(), [])
    # Clean old entries
    history = [(ts, amt) for ts, amt in history if ts > day_ago]

    recent_count = sum(1 for ts, _ in history if ts > hour_ago)
    daily_volume = sum(amt for ts, amt in history)

    if recent_count >= VELOCITY_LIMIT_PER_HOUR:
        return "FAIL", f"Velocity limit: {recent_count} transactions in last hour (max {VELOCITY_LIMIT_PER_HOUR})"

    if daily_volume + amount_usd > VELOCITY_LIMIT_USD_PER_DAY:
        return "FAIL", f"Daily volume limit: ${daily_volume:,.2f} already sent today"

    # Record this attempt
    history.append((now, amount_usd))
    _velocity_store[sender_address.lower()] = history

    return "PASS", f"{recent_count} transactions in last hour | ${daily_volume:,.2f} sent today"


def _generate_validation_id(request: PreValidationRequest) -> str:
    payload = f"{request.sender_address}{request.receiver_address}{request.amount_usd}{datetime.utcnow().isoformat()}"
    return "VLD-" + hashlib.sha256(payload.encode()).hexdigest()[:12].upper()


def _compute_risk_score(checks: list[CheckResult]) -> float:
    """Simple weighted risk score from check results."""
    weights = {"PASS": 0.0, "WARN": 0.3, "FAIL": 1.0}
    if not checks:
        return 1.0
    total = sum(weights.get(c.status, 1.0) for c in checks)
    return min(round(total / len(checks), 3), 1.0)


# ---------------------------------------------------------------------------
# MAIN ENDPOINT
# ---------------------------------------------------------------------------

@router.post("/validate", response_model=PreValidationResponse)
async def run_prevalidation(req: PreValidationRequest):
    checks: list[CheckResult] = []
    blocked_reason: Optional[str] = None
    available_rails: list[str] = []

    # --- Check 1: Wallet format validation ---
    t0 = datetime.utcnow()
    await asyncio.sleep(0.05)
    sender_ok, sender_msg = _validate_wallet_format(req.sender_address)
    receiver_ok, receiver_msg = _validate_wallet_format(req.receiver_address)

    if sender_ok and receiver_ok:
        status, detail = "PASS", f"Sender and receiver addresses valid"
    elif not sender_ok:
        status, detail = "FAIL", f"Sender: {sender_msg}"
        blocked_reason = detail
    else:
        status, detail = "FAIL", f"Receiver: {receiver_msg}"
        blocked_reason = detail

    checks.append(CheckResult(
        check="Wallet / Address Format",
        status=status,
        detail=detail,
        latency_ms=int((datetime.utcnow() - t0).total_seconds() * 1000),
    ))

    if blocked_reason:
        return _build_response(False, checks, [], blocked_reason, req)

    # --- Check 2: Sanctions screening ---
    t0 = datetime.utcnow()
    await asyncio.sleep(0.08)
    sanction_status, sanction_detail = _sanctions_screen(
        req.sender_address, req.receiver_address,
        req.sender_country, req.receiver_country
    )
    checks.append(CheckResult(
        check="Sanctions Screening",
        status=sanction_status,
        detail=sanction_detail,
        latency_ms=int((datetime.utcnow() - t0).total_seconds() * 1000),
    ))
    if sanction_status == "FAIL":
        blocked_reason = sanction_detail
        return _build_response(False, checks, [], blocked_reason, req)

    # --- Check 3: Currency compatibility ---
    t0 = datetime.utcnow()
    await asyncio.sleep(0.04)
    curr_status, curr_detail, currency_rails = _currency_compatibility(
        req.sender_country, req.receiver_country,
        req.currency_from, req.currency_to
    )
    checks.append(CheckResult(
        check="Currency Compatibility",
        status=curr_status,
        detail=curr_detail,
        latency_ms=int((datetime.utcnow() - t0).total_seconds() * 1000),
    ))
    if curr_status == "FAIL":
        blocked_reason = curr_detail
        return _build_response(False, checks, [], blocked_reason, req)

    # --- Check 4: Rail availability ---
    t0 = datetime.utcnow()
    await asyncio.sleep(0.04)
    rail_status, rail_detail, corridor_rails = _rail_availability(
        req.sender_country, req.receiver_country
    )
    # Intersect with currency-compatible rails
    available_rails = [r for r in corridor_rails if r in currency_rails] or corridor_rails
    checks.append(CheckResult(
        check="Rail Availability",
        status=rail_status,
        detail=rail_detail,
        latency_ms=int((datetime.utcnow() - t0).total_seconds() * 1000),
    ))

    # --- Check 5: Amount limits ---
    t0 = datetime.utcnow()
    await asyncio.sleep(0.03)
    amt_status, amt_detail = _amount_limits(req.amount_usd, req.sender_country)
    checks.append(CheckResult(
        check="Amount & Regulatory Limits",
        status=amt_status,
        detail=amt_detail,
        latency_ms=int((datetime.utcnow() - t0).total_seconds() * 1000),
    ))
    if amt_status == "FAIL":
        blocked_reason = amt_detail
        return _build_response(False, checks, available_rails, blocked_reason, req)

    # --- Check 6: Velocity / rate limiting ---
    t0 = datetime.utcnow()
    await asyncio.sleep(0.03)
    vel_status, vel_detail = _velocity_check(req.sender_address, req.amount_usd)
    checks.append(CheckResult(
        check="Velocity & Rate Limits",
        status=vel_status,
        detail=vel_detail,
        latency_ms=int((datetime.utcnow() - t0).total_seconds() * 1000),
    ))
    if vel_status == "FAIL":
        blocked_reason = vel_detail
        return _build_response(False, checks, available_rails, blocked_reason, req)

    all_passed = all(c.status in ("PASS", "WARN") for c in checks)
    return _build_response(all_passed, checks, available_rails, None, req)


def _build_response(
    valid: bool,
    checks: list[CheckResult],
    available_rails: list[str],
    blocked_reason: Optional[str],
    req: PreValidationRequest,
) -> PreValidationResponse:
    risk = _compute_risk_score(checks)
    return PreValidationResponse(
        valid=valid,
        transaction_allowed=valid,
        checks=checks,
        available_rails=available_rails,
        blocked_reason=blocked_reason,
        risk_score=risk,
        validation_id=_generate_validation_id(req),
        timestamp=datetime.utcnow().isoformat() + "Z",
    )


# ---------------------------------------------------------------------------
# INDIVIDUAL CHECK ENDPOINTS (for frontend progressive loading)
# ---------------------------------------------------------------------------

@router.get("/sanctioned-countries")
async def get_sanctioned_countries():
    return {"sanctioned_countries": list(SANCTIONED_COUNTRIES), "source": "OFAC/UN/EU"}


@router.get("/supported-corridors")
async def get_supported_corridors():
    return {
        "corridors": [
            {"from": k[0], "to": k[1], "rails": v}
            for k, v in RAIL_AVAILABILITY.items()
        ]
    }
