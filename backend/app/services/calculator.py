"""
Solar Calculator Service — Al Rehman Solar
Pure Python calculation engine. All results are estimates only.
Assumptions are transparent and configurable.
"""
from app.schemas.schemas import CalculatorInput, CalculatorResult

# ─── Configurable Assumptions ─────────────────────────────────────────────────
# These can later be pulled from site_settings table for admin configurability.

ASSUMPTIONS = {
    # Pakistan electricity tariff (PKR per kWh) — approximate LESCO residential
    "electricity_tariff_pkr_per_kwh": 50.0,

    # Average peak sun hours per day in Lahore
    "peak_sun_hours_per_day": 5.0,

    # System efficiency (accounting for inverter losses, wiring, temperature)
    "system_efficiency": 0.80,

    # kW per 100 sqft of roof (rough rule of thumb for Pakistan)
    "kw_per_100_sqft": 1.0,

    # CO2 emission factor for Pakistan grid (kg CO2 per kWh)
    "co2_kg_per_kwh": 0.47,

    # Rough cost per kW installed (PKR) for payback estimate
    "cost_per_kw_pkr": 120_000,

    # Battery overhead for off-grid / hybrid systems (cost multiplier)
    "battery_cost_multiplier": {
        "on_grid": 1.0,
        "hybrid": 1.35,
        "off_grid": 1.55,
    },

    # Percentage of generation that self-consumption saves (vs export)
    "self_consumption_ratio": 0.85,
}

DISCLAIMER = (
    "All values are estimates based on general assumptions for Lahore, Pakistan. "
    "Actual savings, generation, and payback periods depend on your specific location, "
    "roof orientation, shading, load profile, and current electricity tariffs. "
    "Contact Al Rehman Solar for a professional on-site assessment."
)


def calculate_solar(
    data: CalculatorInput,
    custom_assumptions: dict = None,
    custom_disclaimer: str = None,
) -> CalculatorResult:
    """
    Core calculation engine.
    Input: monthly bill OR monthly units (at least one required).
    Returns: CalculatorResult with all estimated values.
    """
    a = dict(ASSUMPTIONS)
    if custom_assumptions:
        a.update(custom_assumptions)
    
    disclaimer_text = custom_disclaimer or DISCLAIMER
    tariff = a["electricity_tariff_pkr_per_kwh"]
    sun_hours = a["peak_sun_hours_per_day"]
    efficiency = a["system_efficiency"]

    # ── Step 1: Determine monthly consumption (kWh) ──────────────────────────
    if data.monthly_units_kwh and data.monthly_units_kwh > 0:
        monthly_kwh = data.monthly_units_kwh
    elif data.monthly_bill_pkr and data.monthly_bill_pkr > 0:
        monthly_kwh = data.monthly_bill_pkr / tariff
    else:
        # Default to a small residential system if no input
        monthly_kwh = 300.0

    # ── Step 2: Daily consumption ─────────────────────────────────────────────
    daily_kwh = monthly_kwh / 30

    # ── Step 3: Recommended system size (kW) ─────────────────────────────────
    # kW needed = daily_kwh / (peak_sun_hours * efficiency)
    raw_capacity_kw = daily_kwh / (sun_hours * efficiency)

    # Round up to nearest 0.5 kW
    recommended_kw = round(round(raw_capacity_kw * 2) / 2, 1)
    recommended_kw = max(recommended_kw, 1.0)  # minimum 1 kW system

    # Cap recommendation to roof size if provided
    if data.roof_size_sqft and data.roof_size_sqft > 0:
        max_kw_from_roof = (data.roof_size_sqft / 100) * a["kw_per_100_sqft"]
        recommended_kw = min(recommended_kw, max_kw_from_roof)
        recommended_kw = max(recommended_kw, 1.0)

    # ── Step 4: Estimated monthly generation ─────────────────────────────────
    monthly_generation_kwh = recommended_kw * sun_hours * efficiency * 30

    # ── Step 5: Monthly savings ───────────────────────────────────────────────
    # Savings = generation × tariff × self_consumption_ratio
    monthly_savings_pkr = (
        monthly_generation_kwh * tariff * a["self_consumption_ratio"]
    )

    # Cap savings at bill amount (can't save more than you spend)
    if data.monthly_bill_pkr and data.monthly_bill_pkr > 0:
        monthly_savings_pkr = min(monthly_savings_pkr, data.monthly_bill_pkr)

    annual_savings_pkr = monthly_savings_pkr * 12

    # ── Step 6: Payback period ────────────────────────────────────────────────
    battery_mult = a["battery_cost_multiplier"].get(data.system_type, 1.0)
    estimated_system_cost = recommended_kw * a["cost_per_kw_pkr"] * battery_mult

    if annual_savings_pkr > 0:
        payback_years = estimated_system_cost / annual_savings_pkr
    else:
        payback_years = 0.0

    payback_years = round(payback_years, 1)

    # ── Step 7: CO2 reduction ─────────────────────────────────────────────────
    co2_reduction_kg_year = monthly_generation_kwh * 12 * a["co2_kg_per_kwh"]

    return CalculatorResult(
        recommended_capacity_kw=round(recommended_kw, 2),
        estimated_monthly_generation_kwh=round(monthly_generation_kwh, 1),
        estimated_monthly_savings_pkr=round(monthly_savings_pkr, 0),
        estimated_annual_savings_pkr=round(annual_savings_pkr, 0),
        estimated_payback_years=payback_years,
        estimated_co2_reduction_kg_year=round(co2_reduction_kg_year, 1),
        system_type=data.system_type,
        disclaimer=disclaimer_text,
        assumptions={
            "electricity_tariff_pkr_per_kwh": tariff,
            "peak_sun_hours_per_day": sun_hours,
            "system_efficiency_percent": efficiency * 100,
            "city": data.city,
            "property_type": data.property_type,
        },
    )
