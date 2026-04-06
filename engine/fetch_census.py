import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

CENSUS_KEY = os.getenv("CENSUS_KEY")

RATES = {1960: 5.1, 1980: 13.7, 2000: 8.1, 2020: 3.1}

def fetch_from_api(year, variable, state, county):
    if year >= 2005:
        url = f"https://api.census.gov/data/{year}/acs/acs5"
    elif year == 2000:
        url = f"https://api.census.gov/data/2000/dec/sf3"

    params = {
        "get": variable,
        "for": f"county:{county}",
        "in": f"state:{state}",
        "key": CENSUS_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()
    return int(data[1][0])

def load_historical():
    path = os.path.join(
        os.path.dirname(__file__),
        "../data/historical/us/cities_manual.json"
    )
    with open(path) as f:
        return json.load(f)

def get_city_data(city_config, year):
    if year in city_config["api_available"]:
        price = fetch_from_api(
            year,
            "B25077_001E" if year == 2020 else "H076001",
            city_config["state"],
            city_config["county"]
        )
        income = fetch_from_api(
            year,
            "B19013_001E" if year == 2020 else "P053001",
            city_config["state"],
            city_config["county"]
        )
        confidence = "census_api"
    else:
        historical = next(
            h for h in city_config["historical"]
            if h["year"] == year
        )
        price = historical["median_home_price"]
        income = historical["median_household_income"]
        confidence = historical["confidence"]

    return {
        "city": city_config["city"],
        "year": year,
        "median_home_price": price,
        "median_household_income": income,
        "mortgage_rate": RATES[year],
        "confidence": confidence
    }

def fetch_all():
    cities = load_historical()
    years = [1960, 1980, 2000, 2020]
    results = []

    for city in cities:
        for year in years:
            print(f"Fetching {city['city']} {year}...")
            data = get_city_data(city, year)
            results.append(data)

    return results