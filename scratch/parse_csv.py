
import csv
import json

csv_content = """Performance,Michael,Ceda,Jen,Megan,Omari,Oriana,Petal,Spencer,Melissa,Regina,FrancXs,Franklin,Robert,Garrett
April 18th 12:00pm Black Earth Day Genesee Park,Yes,Yes,No,Yes,No,Yes,No,Yes,Yes,No,No,No,No,Yes
April 25th St. Joe's (Private) 2:15- 3:00,Yes,Yes,Yes,Yes,No,Yes,No,Yes,no,Yes,No,No,,Yes
April 25th Road House 7-9pm,Y,Y,Y,Y,No,Y,No,Y,yes,Yes,No,Yes,,Yes
May 20th Sammamish Farmers market 5-7,,,,No,Yes,Y,No,Y,maybe,No,,Yes,,No
May 24th 1-4pm Folklife Kuleana Courtyard ,,,,No,Yes,Y,No,Y,yes,Yes,Yes,Yes,,No
June 7th Auburn Farmers Market 12:00- 1:00pm,,,,Yes,Y,Y,Yes,Y,yes,Yes,Yes,No,,Yes
June 15th afternoon Bellevue (Tentative),,,,,Maybe,,Yes,N,no,No,Yes,No,,Maybe
June 20th  1:00- 4:00pm Seattle Art Museum,,,,Yes,Yes,N,Maybe,Y,yes,Yes,No,No,,Yes
June 26th afternoon Bellevue (Tentative),,,,,N,,Maybe,Y,no,Maybe,No,No,,Maybe
July 6th afternoon Bellevue (Tentative),,,,,Maybe,,Maybe,N,no,No,Yes,Maybe,,No
July 7th Black and Tan Hall time TBD,,,,Maybe,Y,Y,Maybe,Maybe,no,Maybe,No,Yes,,No
July 14th Private Gig 3:30- 4:30pm,,,,No,Maybe,,Maybe,N,no,No,No,Yes,,Yes
July 16th  noon -1 Woodland park Zoo,,,,No,,Y,,Y,maybe,,,Yes,,
July 17th  noon- 1 Woodland park Zoo,,,,No,,Y,,Y,maybe,,,Yes,,
"""

members = {
    "Michael": "ihSC9eBk9Ia17rRaDck0",
    "Ceda": "pNbeb6Xzt7EPGkp9PdCW",
    "Jen": "RMhw5VeCrW0hxwbkkmOx",
    "Megan": "lZ1CrczxUP7XDppFAXRk",
    "Omari": "zMvzDmba2xF8muZItjvf",
    "Oriana": "JAnZq9YXo4dBPTKPIlDE",
    "Petal": "J5o07l9Xfcu2ix7MGU1N",
    "Spencer": "0aAAX1JIRCJ0IIO0dYdz",
    "Melissa": "hysA4OSIsJOV8cruiNye",
    "Regina": "X4bQQ7kYjLKfpZVFTAoC",
    "Francxs": "ZYzptDyxsyssucJCoUua",  # Case sensitive in Firestore but CSV says FrancXs
    "Franklin": "oQM4HxgJ6WjBeKh2nVo2",
    "Robert": "9QnrhxKDDsAq8E5n6loG",
    "Garrett": "4AQoWvbX7iyVAVy4M5DP"
}

# CSV naming to Firestore naming
member_map = {
    "Michael": "Michael",
    "Ceda": "Ceda",
    "Jen": "Jen",
    "Megan": "Megan",
    "Omari": "Omari",
    "Oriana": "Oriana",
    "Petal": "Petal",
    "Spencer": "Spencer",
    "Melissa": "Melissa",
    "Regina": "Regina",
    "FrancXs": "Francxs",
    "Franklin": "Franklin",
    "Robert": "Robert",
    "Garrett": "Garrett"
}

def parse_date(perf_str):
    months = {
        "April": "04", "May": "05", "June": "06", "July": "07"
    }
    for m, m_val in months.items():
        if m in perf_str:
            # Extract day
            day_part = perf_str.split(m)[1].strip().split(" ")[0].replace("th", "").replace("st", "").replace("nd", "").replace("rd", "")
            return f"2026-{m_val}-{day_part.zfill(2)}"
    return "2026-01-01"

lines = [l for l in csv_content.split("\n") if l.strip()]
reader = csv.DictReader(lines)

performances_out = []
availability_out = []

for row in reader:
    title = row["Performance"]
    if not title: continue
    
    date = parse_date(title)
    perf_id = title.replace(" ", "_").replace("(", "").replace(")", "").replace(":", "").replace("-", "").replace(".", "").replace(",", "").lower()[:32]
    
    performances_out.append({
        "id": perf_id,
        "title": title,
        "date": date,
        "status": "confirmed" if "Tentative" not in title else "pending",
        "location": "",
        "setlist": []
    })
    
    for csv_name, fire_name in member_map.items():
        val = row.get(csv_name, "").lower().strip()
        if not val:
            status = "pending" # We'll skip adding if it's blank or set to pending?
            # User didn't specify, but usually blank means no response.
            continue 
        
        if val in ["yes", "y"]:
            status = "available"
        elif val in ["no", "n", "maybe"]:
            status = "unavailable"
        else:
            continue
            
        availability_out.append({
            "perfId": perf_id,
            "memberId": members[fire_name],
            "status": status
        })

print(json.dumps({"performances": performances_out, "availability": availability_out}))
