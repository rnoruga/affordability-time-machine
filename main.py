import json
import os
from engine.fetch_census import fetch_all
from engine.calculate import run_calculations

def save_results(results):
    path = os.path.join(os.path.dirname(__file__), "output/results.json")
    with open(path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved {len(results)} entries to output/results.json")

def main():
    print("=== Affordability Time Machine ===\n")

    print("Step 1: Fetching data...")
    raw_data = fetch_all()
    print(f"Fetched {len(raw_data)} city/year combinations\n")

    print("Step 2: Running calculations...")
    results = run_calculations(raw_data)
    print(f"Calculated {len(results)} entries\n")

    print("Step 3: Saving results...")
    save_results(results)

    print("\n=== Done ===")
    print("Open output/results.json to see the data")

if __name__ == "__main__":
    main()