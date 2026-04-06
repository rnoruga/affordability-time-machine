import json
import os


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


def calculate_profiles(price, rate, salaries, city, year):
    occupations = load_json("../data/static/occupations.json")
    households = load_json("../data/static/households.json")

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

        for hh in households:
            effective_income = base_salary * hh["multiplier"]
            ratio, monthly, burden = calculate_affordability(
                price, effective_income, rate
            )

            can_afford = burden <= 35

            results.append({
                "occupation_id":  occ["id"],
                "occupation_label": occ["label"],
                "household_id":   hh["id"],
                "household_label": hh["label"],
                "base_salary":    base_salary,
                "effective_income": round(effective_income, 0),
                "salary_confidence": salary_entry["confidence"],
                "price_to_income": ratio,
                "monthly_payment": monthly,
                "burden_pct":     burden,
                "can_afford":     can_afford
            })

    return results


def run_calculations(raw_data):
    salaries = load_json("../data/static/salaries.json")

    results = []

    for entry in raw_data:
        city = entry["city"]
        year = entry["year"]
        price = entry["median_home_price"]
        income = entry["median_household_income"]
        rate = entry["mortgage_rate"]

        ratio, monthly, burden = calculate_affordability(price, income, rate)

        profiles = calculate_profiles(price, rate, salaries, city, year)

        results.append({
            "city":  city,
            "year":  year,
            "market": {
                "median_home_price":       price,
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
