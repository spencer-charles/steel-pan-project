import re

# Initialize Firebase
# Note: I'll use the service account if available, or just assume the env is setup for the MCP tool's context.
# Actually, since I'm an agent, I should probably use the MCP tool to update the documents one by one or in batch.
# But writing a script is easier for complex regex.
# However, I don't have the service account key file.
# I will use the MCP tools to update the documents instead of a local script that needs auth.

import json

def clean_title(title):
    # Remove dates like "April 18th", "May 24th"
    title = re.sub(r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+(st|nd|rd|th)?', '', title, flags=re.IGNORECASE)
    
    # Remove time ranges like "12:00pm", "7-9pm", "2:15- 3:00", "3:30- 4:30pm", "5-7", "1-4pm"
    title = re.sub(r'(\d{1,2}(:\d{2})?\s*(am|pm)?\s*(-|to)\s*\d{1,2}(:\d{2})?\s*(am|pm)?)|(\d{1,2}(:\d{2})?\s*(am|pm))', '', title, flags=re.IGNORECASE)
    
    # Remove "afternoon" before "noon"
    title = re.sub(r'afternoon', '', title, flags=re.IGNORECASE)
    
    # Remove "noon" variations
    title = re.sub(r'noon\s*(-|to)?\s*\d{1,2}?', '', title, flags=re.IGNORECASE)
    title = re.sub(r'noon', '', title, flags=re.IGNORECASE)
    
    # Remove "time TBD", "(Tentative)"
    title = re.sub(r'time\s*TBD|\(Tentative\)', '', title, flags=re.IGNORECASE)
    
    # Remove trailing/leading punctuation that might be left over
    title = title.strip().strip('-').strip().strip('(').strip(')').strip()
    
    # Final cleanup of whitespace
    title = re.sub(r'\s+', ' ', title).strip()
    return title

# I'll just print the mapping for verification first
example_titles = [
    "April 18th 12:00pm Black Earth Day Genesee Park",
    "April 25th Road House 7-9pm",
    "April 25th St. Joe's (Private) 2:15- 3:00",
    "July 14th Private Gig 3:30- 4:30pm",
    "July 16th noon -1 Woodland park Zoo",
    "July 17th noon- 1 Woodland park Zoo",
    "July 6th afternoon Bellevue (Tentative)",
    "July 7th Black and Tan Hall time TBD",
    "June 15th afternoon Bellevue (Tentative)",
    "June 20th 1:00- 4:00pm Seattle Art Museum",
    "June 26th afternoon Bellevue (Tentative)",
    "June 7th Auburn Farmers Market 12:00- 1:00pm",
    "May 20th Sammamish Farmers market 5-7",
    "May 24th 1-4pm Folklife Kuleana Courtyard"
]

print("Cleaning Results:")
for t in example_titles:
    print(f"'{t}' -> '{clean_title(t)}'")
