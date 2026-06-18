# routes/facility.py
# Defines the HTTP endpoints for facility-related operations.
#
# A "route" in FastAPI is a function that handles requests to a specific URL.
# We keep routes thin — they handle HTTP concerns (status codes, responses)
# and delegate all business logic to the service layer.

from fastapi import APIRouter, HTTPException
from app.models.facility import FacilityResponse
from app.services.cms_service import fetch_facility_by_ccn

# APIRouter is like a mini FastAPI app — it groups related routes together.
# We'll register this router in main.py with a prefix of "/api"
router = APIRouter()


@router.get(
    "/facility/{ccn}",
    response_model=FacilityResponse,
    summary="Look up a nursing facility by CCN",
    description="Fetches facility data from the CMS Provider Data Catalog API",
)
async def get_facility(ccn: str):
    """
    GET /api/facility/{ccn}
    
    Looks up a nursing home facility using its CMS Certification Number (CCN).
    
    - **ccn**: A 6-character CMS Certification Number (e.g. "686123")
    
    Returns facility name, location, bed count, star ratings, and Medicare URL.
    """
    try:
        # Delegate to the service layer — routes don't contain business logic
        facility = await fetch_facility_by_ccn(ccn)
        return facility

    except ValueError as e:
        # ValueError means CCN not found — return 404 Not Found
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        # Catch-all for unexpected errors (CMS API down, network issues, etc.)
        # Return 503 Service Unavailable so the frontend knows it's not a user error
        raise HTTPException(
            status_code=503,
            detail=f"Unable to reach CMS API. Please try again. ({str(e)})",
        )