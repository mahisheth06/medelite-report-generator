# models/facility.py


from pydantic import BaseModel
from typing import Optional


class FacilityResponse(BaseModel):


    # --- Fields from CMS API ---
    ccn: str                              # The CCN the user searched for
    legal_name: str                       # Official facility name from CMS
    address: Optional[str] = None        # Street address
    city: Optional[str] = None           # City
    state: Optional[str] = None          # State abbreviation (e.g. "FL")
    zip_code: Optional[str] = None       # ZIP code
    
    # Convenience field: full address as one string for display
    full_address: Optional[str] = None

    # Number of certified beds (Census Capacity in the report)
    certified_beds: Optional[int] = None

    # Star ratings — all 1-5 scale, Optional because some facilities
    # may not have ratings yet
    overall_rating: Optional[int] = None
    health_inspection_rating: Optional[int] = None
    staffing_rating: Optional[int] = None
    quality_rating: Optional[int] = None

    # Medicare Care Compare URL — built dynamically from the CCN
    medicare_url: str = ""


class ErrorResponse(BaseModel):
    """
    Returned when something goes wrong (invalid CCN, API down, etc.)
    Having a consistent error shape makes frontend error handling simple.
    """
    detail: str      # Human-readable error message
    ccn: str         # The CCN that caused the error