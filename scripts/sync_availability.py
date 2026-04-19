import csv
import json
import os

# Member Name -> ID Mapping
member_map = {
    "Spencer": "0aAAX1JIRCJ0IIO0dYdz",
    "Garrett": "4AQoWvbX7iyVAVy4M5DP",
    "Robert": "9QnrhxKDDsAq8E5n6loG",
    "Petal": "J5o07l9Xfcu2ix7MGU1N",
    "Oriana": "JAnZq9YXo4dBPTKPIlDE",
    "Jen": "RMhw5VeCrW0hxwbkkmOx",
    "Regina": "X4bQQ7kYjLKfpZVFTAoC",
    "FrancXs": "ZYzptDyxsyssucJCoUua", # Handle casing in CSV "FrancXs"
    "Melissa": "hysA4OSIsJOV8cruiNye",
    "Michael": "ihSC9eBk9Ia17rRaDck0",
    "Megan": "lZ1CrczxUP7XDppFAXRk",
    "Franklin": "oQM4HxgJ6WjBeKh2nVo2",
    "Ceda": "pNbeb6Xzt7EPGkp9PdCW",
    "Omari": "zMvzDmba2xF8muZItjvf"
}

# CSV Title Prefix -> Performance ID Mapping
perf_map = {
    "April 18th Black Earth": "april_18th_black_earth_day",
    "April 25th St Joes": "april_25th_st_joes",
    "April 25th Road House": "april_25th_road_house",
    "May 20th Sammamish": "may_20th_sammamish_farmers_market",
    "May 24th Folklife": "may_24th_folklife",
    "June 7th Auburn": "june_7th_auburn_farmers_market",
    "June 20th SAM": "june_20th_seattle_art_museum",
    "July 12th Ballard Farmers": "july_12th_ballard_farmers_market"
}

def sync():
    csv_file = "Performance Sign Up - Sheet1.csv"
    if not os.path.exists(csv_file):
        print(f"CSV file not found: {csv_file}")
        return

    with open(csv_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            title = row.get("Performance", "").strip()
            if not title:
                continue

            # Find matching performance ID
            perf_id = None
            for prefix, pid in perf_map.items():
                if title.startswith(prefix):
                    perf_id = pid
                    break
            
            if not perf_id:
                # print(f"No performance ID map for: {title}")
                continue

            for name, mid in member_map.items():
                val = row.get(name, "").lower().strip()
                if not val:
                    continue
                
                status = "pending"
                if val in ["yes", "y", "available"]:
                    status = "available"
                elif val in ["no", "n", "unavailable", "maybe"]:
                    status = "unavailable"

                # doc_id = f"{perf_id}_{mid}"
                data = {
                    "performanceId": perf_id,
                    "memberId": mid,
                    "status": status
                }
                print(f"SET_AVAIL:{perf_id}:{mid}:{status}")

if __name__ == "__main__":
    sync()
