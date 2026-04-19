
import re
import json

def clean_title(title, location):
    # Remove dates like "April 18th", "May 24th"
    title = re.sub(r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+(st|nd|rd|th)?', '', title, flags=re.IGNORECASE)
    
    # Extract potential time string before removing it
    time_range_regex = r'(\d{1,2}(:\d{2})?\s*(am|pm)?\s*(-|to)\s*\d{1,2}(:\d{2})?\s*(am|pm)?)|(\d{1,2}(:\d{2})?\s*(am|pm))'
    time_match = re.search(time_range_regex, title, flags=re.IGNORECASE)
    extracted_time = time_match.group(0) if time_match else None

    # Remove time ranges
    title = re.sub(time_range_regex, '', title, flags=re.IGNORECASE)
    
    # Remove "afternoon" before "noon"
    title = re.sub(r'afternoon', '', title, flags=re.IGNORECASE)
    # Remove "noon" variations
    title = re.sub(r'noon\s*(-|to)?\s*\d{1,2}?', '', title, flags=re.IGNORECASE)
    title = re.sub(r'noon', '', title, flags=re.IGNORECASE)
    # Remove "time TBD", "(Tentative)"
    title = re.sub(r'time\s*TBD|\(Tentative\)', '', title, flags=re.IGNORECASE)
    
    # Remove redundancy with location if location is in title
    if location.lower() in title.lower():
        # Case insensitive replacement
        title = re.sub(re.escape(location), '', title, flags=re.IGNORECASE)
    
    # Common cleanup for "Farmers market" etc
    title = re.sub(r'Farmers\s*market', 'Farmers Market', title, flags=re.IGNORECASE)
    
    # Final cleanup of punctuation and whitespace
    title = title.strip().strip('-').strip().strip(':').strip().strip('(').strip(')').strip()
    title = re.sub(r'\s+', ' ', title).strip()
    
    # If title becomes empty, use location or "Gig"
    if not title:
        title = location if location else "Gig"

    return title, extracted_time

# Input from the list_documents output
documents = [
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/april_18th_black_earth_day", "title": "April 18th 12:00pm Black Earth Day Genesee Park", "location": "Genesee Park"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/april_25th_road_house", "title": "April 25th Road House 7-9pm", "location": "Road House"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/april_25th_st_joes", "title": "April 25th St. Joe's (Private) 2:15- 3:00", "location": "St. Joe's"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/july_14th_private_gig", "title": "July 14th Private Gig 3:30- 4:30pm", "location": "Private Gig"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/july_16th_woodland_park_zoo", "title": "July 16th noon -1 Woodland park Zoo", "location": "Woodland Park Zoo"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/july_17th_woodland_park_zoo", "title": "July 17th noon- 1 Woodland park Zoo", "location": "Woodland Park Zoo"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/july_6th_bellevue_tentative", "title": "July 6th afternoon Bellevue (Tentative)", "location": "Bellevue"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/july_7th_black_and_tan_hall", "title": "July 7th Black and Tan Hall time TBD", "location": "Black and Tan Hall"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/june_15th_bellevue_tentative", "title": "June 15th afternoon Bellevue (Tentative)", "location": "Bellevue"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/june_20th_seattle_art_museum", "title": "June 20th 1:00- 4:00pm Seattle Art Museum", "location": "Seattle Art Museum"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/june_26th_bellevue_tentative", "title": "June 26th afternoon Bellevue (Tentative)", "location": "Bellevue"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/june_7th_auburn_farmers_market", "title": "June 7th Auburn Farmers Market 12:00- 1:00pm", "location": "Auburn"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/may_20th_sammamish_farmers_market", "title": "May 20th Sammamish Farmers market 5-7", "location": "Sammamish"},
    {"name": "projects/steel-pan-project-spencer/databases/(default)/documents/performances/may_24th_folklife", "title": "May 24th 1-4pm Folklife Kuleana Courtyard", "location": "Folklife Kuleana Courtyard"}
]

updates = []
for doc in documents:
    new_title, extracted_time = clean_title(doc['title'], doc['location'])
    
    # Split extracted_time into start/end if optional
    start = extracted_time
    end = ""
    if extracted_time and '-' in extracted_time:
        parts = extracted_time.split('-')
        start = parts[0].strip()
        end = parts[1].strip()
    
    update = {
        "name": doc['name'],
        "document": {
            "fields": {
                "title": {"stringValue": new_title},
                "startTime": {"stringValue": start if start else ""},
                "endTime": {"stringValue": end if end else ""}
            }
        },
        "updateMask": "title,startTime,endTime"
    }
    updates.append(update)

print(json.dumps(updates, indent=2))
