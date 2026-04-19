
import json

availability_data = [
    # April 18th
    {"perfId": "april_18th_black_earth_day", "memberId": "ihSC9eBk9Ia17rRaDck0", "status": "available"},
    {"perfId": "april_18th_black_earth_day", "memberId": "pNbeb6Xzt7EPGkp9PdCW", "status": "available"},
    {"perfId": "april_18th_black_earth_day", "memberId": "RMhw5VeCrW0hxwbkkmOx", "status": "unavailable"},
    {"perfId": "april_18th_black_earth_day", "memberId": "lZ1CrczxUP7XDppFAXRk", "status": "available"},
    {"perfId": "april_18th_black_earth_day", "memberId": "zMvzDmba2xF8muZItjvf", "status": "unavailable"},
    {"perfId": "april_18th_black_earth_day", "memberId": "JAnZq9YXo4dBPTKPIlDE", "status": "available"},
    {"perfId": "april_18th_black_earth_day", "memberId": "J5o07l9Xfcu2ix7MGU1N", "status": "unavailable"},
    {"perfId": "april_18th_black_earth_day", "memberId": "0aAAX1JIRCJ0IIO0dYdz", "status": "available"},
    {"perfId": "april_18th_black_earth_day", "memberId": "hysA4OSIsJOV8cruiNye", "status": "available"},
    {"perfId": "april_18th_black_earth_day", "memberId": "X4bQQ7kYjLKfpZVFTAoC", "status": "unavailable"},
    {"perfId": "april_18th_black_earth_day", "memberId": "ZYzptDyxsyssucJCoUua", "status": "unavailable"},
    {"perfId": "april_18th_black_earth_day", "memberId": "oQM4HxgJ6WjBeKh2nVo2", "status": "unavailable"},
    {"perfId": "april_18th_black_earth_day", "memberId": "9QnrhxKDDsAq8E5n6loG", "status": "unavailable"},
    {"perfId": "april_18th_black_earth_day", "memberId": "4AQoWvbX7iyVAVy4M5DP", "status": "available"},
    
    # April 25th St Joe
    {"perfId": "april_25th_st_joes", "memberId": "ihSC9eBk9Ia17rRaDck0", "status": "available"},
    {"perfId": "april_25th_st_joes", "memberId": "pNbeb6Xzt7EPGkp9PdCW", "status": "available"},
    {"perfId": "april_25th_st_joes", "memberId": "RMhw5VeCrW0hxwbkkmOx", "status": "available"},
    {"perfId": "april_25th_st_joes", "memberId": "lZ1CrczxUP7XDppFAXRk", "status": "available"},
    {"perfId": "april_25th_st_joes", "memberId": "zMvzDmba2xF8muZItjvf", "status": "unavailable"},
    {"perfId": "april_25th_st_joes", "memberId": "JAnZq9YXo4dBPTKPIlDE", "status": "available"},
    {"perfId": "april_25th_st_joes", "memberId": "J5o07l9Xfcu2ix7MGU1N", "status": "unavailable"},
    {"perfId": "april_25th_st_joes", "memberId": "0aAAX1JIRCJ0IIO0dYdz", "status": "available"},
    {"perfId": "april_25th_st_joes", "memberId": "hysA4OSIsJOV8cruiNye", "status": "unavailable"},
    {"perfId": "april_25th_st_joes", "memberId": "X4bQQ7kYjLKfpZVFTAoC", "status": "available"},
    {"perfId": "april_25th_st_joes", "memberId": "ZYzptDyxsyssucJCoUua", "status": "unavailable"},
    {"perfId": "april_25th_st_joes", "memberId": "oQM4HxgJ6WjBeKh2nVo2", "status": "unavailable"},
    {"perfId": "april_25th_st_joes", "memberId": "4AQoWvbX7iyVAVy4M5DP", "status": "available"},

    # April 25th Road House
    {"perfId": "april_25th_road_house", "memberId": "ihSC9eBk9Ia17rRaDck0", "status": "available"},
    {"perfId": "april_25th_road_house", "memberId": "pNbeb6Xzt7EPGkp9PdCW", "status": "available"},
    {"perfId": "april_25th_road_house", "memberId": "RMhw5VeCrW0hxwbkkmOx", "status": "available"},
    {"perfId": "april_25th_road_house", "memberId": "lZ1CrczxUP7XDppFAXRk", "status": "available"},
    {"perfId": "april_25th_road_house", "memberId": "zMvzDmba2xF8muZItjvf", "status": "unavailable"},
    {"perfId": "april_25th_road_house", "memberId": "JAnZq9YXo4dBPTKPIlDE", "status": "available"},
    {"perfId": "april_25th_road_house", "memberId": "J5o07l9Xfcu2ix7MGU1N", "status": "unavailable"},
    {"perfId": "april_25th_road_house", "memberId": "0aAAX1JIRCJ0IIO0dYdz", "status": "available"},
    {"perfId": "april_25th_road_house", "memberId": "hysA4OSIsJOV8cruiNye", "status": "available"},
    {"perfId": "april_25th_road_house", "memberId": "X4bQQ7kYjLKfpZVFTAoC", "status": "available"},
    {"perfId": "april_25th_road_house", "memberId": "ZYzptDyxsyssucJCoUua", "status": "unavailable"},
    {"perfId": "april_25th_road_house", "memberId": "oQM4HxgJ6WjBeKh2nVo2", "status": "available"},
    {"perfId": "april_25th_road_house", "memberId": "4AQoWvbX7iyVAVy4M5DP", "status": "available"}
]

print(json.dumps(availability_data))
