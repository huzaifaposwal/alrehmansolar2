"""Calculator API — Al Rehman Solar
Supports both public calculation (using DB assumptions) and admin settings configuration
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import SiteSetting
from app.schemas.schemas import CalculatorInput, CalculatorResult, BulkSettingsUpdate
from app.services.calculator import calculate_solar, ASSUMPTIONS, DISCLAIMER

router = APIRouter(prefix="/calculator", tags=["calculator"])


async def get_db_calculator_assumptions(db: AsyncSession) -> tuple[dict, Optional[str]]:
    """Helper to load calculator assumptions and disclaimer from SiteSetting table."""
    result = await db.execute(
        select(SiteSetting).where(SiteSetting.key.like("calc_%"))
    )
    settings_rows = result.scalars().all()
    settings_dict = {s.key: s.value for s in settings_rows if s.value is not None}

    custom_assumptions = {}
    custom_disclaimer = None

    if "calc_electricity_tariff_pkr_per_kwh" in settings_dict:
        try:
            custom_assumptions["electricity_tariff_pkr_per_kwh"] = float(settings_dict["calc_electricity_tariff_pkr_per_kwh"])
        except ValueError:
            pass

    if "calc_peak_sun_hours_per_day" in settings_dict:
        try:
            custom_assumptions["peak_sun_hours_per_day"] = float(settings_dict["calc_peak_sun_hours_per_day"])
        except ValueError:
            pass

    if "calc_system_efficiency" in settings_dict:
        try:
            eff = float(settings_dict["calc_system_efficiency"])
            if eff > 1.0:
                eff = eff / 100.0  # percentage to fraction
            custom_assumptions["system_efficiency"] = eff
        except ValueError:
            pass

    if "calc_kw_per_100_sqft" in settings_dict:
        try:
            custom_assumptions["kw_per_100_sqft"] = float(settings_dict["calc_kw_per_100_sqft"])
        except ValueError:
            pass

    if "calc_cost_per_kw_pkr" in settings_dict:
        try:
            custom_assumptions["cost_per_kw_pkr"] = float(settings_dict["calc_cost_per_kw_pkr"])
        except ValueError:
            pass

    if "calc_self_consumption_ratio" in settings_dict:
        try:
            ratio = float(settings_dict["calc_self_consumption_ratio"])
            if ratio > 1.0:
                ratio = ratio / 100.0
            custom_assumptions["self_consumption_ratio"] = ratio
        except ValueError:
            pass

    if "calc_co2_kg_per_kwh" in settings_dict:
        try:
            custom_assumptions["co2_kg_per_kwh"] = float(settings_dict["calc_co2_kg_per_kwh"])
        except ValueError:
            pass

    # Battery multipliers
    hybrid_mult = settings_dict.get("calc_battery_multiplier_hybrid")
    offgrid_mult = settings_dict.get("calc_battery_multiplier_offgrid")
    if hybrid_mult or offgrid_mult:
        battery_dict = dict(ASSUMPTIONS.get("battery_cost_multiplier", {}))
        if hybrid_mult:
            try:
                battery_dict["hybrid"] = float(hybrid_mult)
            except ValueError:
                pass
        if offgrid_mult:
            try:
                battery_dict["off_grid"] = float(offgrid_mult)
            except ValueError:
                pass
        custom_assumptions["battery_cost_multiplier"] = battery_dict

    if "calc_disclaimer" in settings_dict and settings_dict["calc_disclaimer"].strip():
        custom_disclaimer = settings_dict["calc_disclaimer"].strip()

    return custom_assumptions, custom_disclaimer


@router.post("/calculate", response_model=CalculatorResult)
async def calculate(payload: CalculatorInput, db: AsyncSession = Depends(get_db)):
    """
    Public endpoint. Returns estimated solar system parameters.
    Values dynamically reflect assumptions stored in the database.
    """
    custom_assumptions, custom_disclaimer = await get_db_calculator_assumptions(db)
    return calculate_solar(payload, custom_assumptions=custom_assumptions, custom_disclaimer=custom_disclaimer)


@router.get("/settings")
async def get_calculator_settings(
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Admin endpoint to retrieve all calculator settings.
    """
    result = await db.execute(
        select(SiteSetting).where(SiteSetting.key.like("calc_%"))
    )
    rows = result.scalars().all()
    return [{"key": r.key, "value": r.value, "label": r.label, "group": r.group} for r in rows]


@router.patch("/settings")
async def update_calculator_settings(
    payload: BulkSettingsUpdate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Admin endpoint to update calculator settings.
    """
    for key, value in payload.settings.items():
        if not key.startswith("calc_"):
            continue
        result = await db.execute(select(SiteSetting).where(SiteSetting.key == key))
        setting = result.scalar_one_or_none()
        if setting:
            setting.value = str(value)
        else:
            setting = SiteSetting(
                key=key,
                value=str(value),
                label=key.replace("calc_", "").replace("_", " ").title(),
                group="calculator"
            )
            db.add(setting)
    await db.commit()
    return {"message": "Calculator settings updated successfully"}
