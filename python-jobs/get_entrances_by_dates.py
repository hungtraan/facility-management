#!/usr/bin/env python
from urllib2 import Request, urlopen
from urllib import urlencode
import base64
import json
import requests
import MySQLdb
import datetime
import time

"""
Fill in the entries below
username        - the username you use to log in to app.scanalyticsinc.com.  Typically your e-mail address.
password        - the password you use to log in to app.scanalyticsinc.com.  
clientId        - generate a clientId and secret from https://app.scanalyticsinc.com/developers
clientSecret    - generated along with clientId
array_keys_list - the 5-character array key, visible in the URL when editing a deployment
                - https://app.scanalyticsinc.com/deployments/XXXXX/zones/YYYYY
                - "YYYYY" is the array key
"""

#username        = "user@email.com"
#password        = "password"
#clientId        = "clientId"
#clientSecret    = "clientSecret"
#from credentials import username, password, clientId, clientSecret
array_keys_list = ["1AMDJ"]  # may have one or more array keys in the list

def get_token(username, password, clientId, clientSecret):
    """
    get an oAuth token
    """
    data = {'username':username, 'password':password, "grant_type":"password"}
    values = urlencode(data)
    clientkey = base64.b64encode(clientId+":"+clientSecret)

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic '+clientkey
    }

    request = Request('https://api-v2.scanalyticsinc.com/token', data=values, headers=headers)
    #request = Request('https://api-v2.scanalyticsinc.com/token', headers=headers)

    token = urlopen(request).read()
    #print token
    token_dict=json.loads(token)

    return token_dict["access_token"]

def get_entrances_report(access_token, array_keys_list, ISODATE1, ISODATE2):
    """
    use the token to get visits
    """

    data = {
        "keys": array_keys_list,
        "metrics": ["entrances.entrances","entrances.exits"],
        "interval": None,
        "group" : False,
        "date_range" : {"startDate" : ISODATE1,
                        "endDate"   : ISODATE2}
    }
    values = json.dumps(data)
    #print(values)
    headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+access_token
    }
    query_r = requests.post('https://api-v2.scanalyticsinc.com/reports/query', data=values, headers=headers, verify=False)
    #print(query_r.text)

    query_json = query_r.json()
    #print json.dumps(query_json, sort_keys=True, indent=4, separators=(',', ': ')) #pretty 

    report_list = query_json["report"]["collection"]
    return report_list

#def get_available_metrics(access_token):
#    headers = {
#      'Content-Type': 'application/json',
#      'Authorization': 'Bearer '+access_token
#    }
#    query_r = requests.post('https://api-v2.scanalyticsinc.com/metrics?limit=15&page=1', headers=headers, verify=False)
#    print query_r.text

def getAndSaveData(db):
    now = datetime.datetime.now()
    twelveAmToday = datetime.datetime.combine(now.date(), datetime.time(0,0,0))
    isoDateNow = now.isoformat()
    isoDateDayStart = twelveAmToday.isoformat()
    sqlFormatNow = datetime.datetime.strftime(now,'%Y-%m-%d %H:%m:%S')
    sqlFormatDayStart = datetime.datetime.strftime(twelveAmToday,'%Y-%m-%d %H:%M:%S')
    # ISODATE1 = "2016-03-07T04:00:00-05:00"
    # ISODATE2 = "2016-03-07T17:00:00-05:00"
    username = 'tran_h3@denison.edu'
    password = 'makeitcount'
    clientId = '41082c49d21ec03ab278adadca407567585621e5'
    clientSecret = 'e74845de757512ca7d9ca78a809a8d9335ad5d7cebc385c192f71e47d0be9d7a'
    access_token = get_token(username, password, clientId, clientSecret)
    #print "access_token=",access_token
    print(sqlFormatDayStart)
    print(sqlFormatNow)
    
    #get_available_metrics(access_token)

    for doc in get_entrances_report(access_token, array_keys_list, isoDateNow, isoDateDayStart):
        entrances = doc["entrances"]
        exits = doc["exits"]
        occupancy = entrances - exits
        print(doc["name"])
        print(entrances)
        print(exits)
        print(occupancy)
    
    # Process with list command in db
    c = db.cursor()

    try:
        sql_cmd = "INSERT INTO occupancy (zone_id, zone_name, time_from, time_to, entrances, exits, occupancy) VALUES (1,'Crowne Fitness Center','"+ sqlFormatDayStart + "','" + sqlFormatNow + "'," + str(entrances) + "," + str(exits) + "," + str(occupancy) + ")" 
        c.execute(sql_cmd)
        db.commit()
    except Exception as e:
        print(e)
        pass
   
if __name__ == "__main__":
    # Connection to Heroku mysql db
    db=MySQLdb.connect(host="us-cdbr-iron-east-03.cleardb.net",user="bbaf414965fded", passwd="2f3310e8",db="heroku_fa3c47157b8ffc1",charset='utf8',use_unicode=True)

    # Simple scheduler to get and save data every 5 minutes
    #while True:
    getAndSaveData(db)
    #time.sleep(300) # 300s = 1 minutes
    
