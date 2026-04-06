import json
import os

STARTER_HOME_RATIO = 0.82  # NAR entry-level coefficient, fixed ratio — see docs


def load_json(relative_path):
    path = os.path.join(os.path.dirname(__file__), relative_path)
    with open(path) as f:
        return json.load(f)


def mortgage_payment(home_price, rate_pct, down_pct=0.20, years=30):
    loan = home_price * (1 - down_pct)
    r = (rate_pct / 100) / 12
    n = years * 12
    return loan * r / (1 - (1 + r) ** -n)


def calculate_affordability(price, income, rate):
    ratio = round(price / income, 2)
    monthly = mortgage_payment(price, rate)
    burden = round((monthly / (income / 12)) * 100, 1)
    return ratio, round(monthly, 0), burden


def get_income_tier(salary, median_income):
    relative = round(salary / median_income, 2)
    if relative < 0.8:
        tier = "working_class"
    elif relative <= 1.5:
        tier = "middle_class"
    else:
        tier = "upper_middle"
    return tier, relative


def calculate_profiles(price, rate, salaries, city, year, median_income):
    occupations = load_json("../data/static/occupations.json")
    households  = load_json("../data/static/households.json")

    results = []

    for occ in occupations:
        salary_entry = next(
            (s for s in salaries
             if s["occupation_id"] == occ["id"]
             and s["city"] == city
             and s["year"] == year),
            None
        ) or next(
            (s for s in salaries
             if s["occupation_id"] == occ["id"]
             and s["city"] == "all"
             and s["year"] == year),
            None
        )

        if not salary_entry:
            continue

        base_salary = salary_entry["salary"]
        income_tier, relative_to_median = get_income_tier(base_salary, median_income)

        for hh in households:
            effective_income = base_salary * hh["multiplier"]

            # median home
            ratio, monthly, burden = calculate_affordability(price, effective_income, rate)

            # starter home
            starter_price = round(price * STARTER_HOME_RATIO)
            starter_ratio, starter_monthly, starter_burden = calculate_affordability(
                starter_price, effective_income, rate
            )

            if burden <= 28:
                affordability_status = "comfortable"
            elif burden <= 38:
                affordability_status = "stretch"
            else:
                affordability_status = "unaffordable"

            if starter_burden <= 28:
                starter_affordability = "comfortable"
            elif starter_burden <= 38:
                starter_affordability = "stretch"
            else:
                starter_affordability = "unaffordable"

            context_flags = []
            if hh["multiplier"] == 1.0:
                context_flags.append("one_income")
            if "kid" in hh["id"]:
                context_flags.append("has_dependents")
            if hh["id"] == "family_3kids" and hh["multiplier"] == 1.0:
                context_flags.append("high_dependency")

            results.append({
                "occupation_id":        occ["id"],
                "occupation_label":     occ["label"],
                "household_id":         hh["id"],
                "household_label":      hh["label"],
                "base_salary":          base_salary,
                "effective_income":     round(effective_income, 0),
                "salary_confidence":    salary_entry["confidence"],
                "income_tier":          income_tier,
                "relative_to_median":   relative_to_median,
                "median_home": {
                    "price":                price,
                    "price_to_income":      ratio,
                    "monthly_payment":      monthly,
                    "burden_pct":           burden,
                    "affordability_status": affordability_status,
                },
                "starter_home": {
                    "price":                starter_price,
                    "price_to_income":      starter_ratio,
                    "monthly_payment":      starter_monthly,
                    "burden_pct":           starter_burden,
                    "affordability_status": starter_affordability,
                },
                "context_flags":        context_flags
            })

    return results


def run_calculations(raw_data):
    salaries = load_json("../data/static/salaries.json")

    results = []

    for entry in raw_data:
        city   = entry["city"]
        year   = entry["year"]
        price  = entry["median_home_price"]
        income = entry["median_household_income"]
        rate   = entry["mortgage_rate"]

        ratio, monthly, burden = calculate_affordability(price, income, rate)

        profiles = calculate_profiles(price, rate, salaries, city, year, income)

        results.append({
            "city":  city,
            "year":  year,
            "market": {
                "median_home_price":       price,
                "starter_home_price":      round(price * STARTER_HOME_RATIO),
                "median_household_income": income,
                "mortgage_rate":           rate,
                "price_to_income":         ratio,
                "monthly_payment":         monthly,
                "burden_pct":              burden,
                "confidence":              entry["confidence"]
            },
            "profiles": profiles
        })

    return results