#!/usr/bin/env python
from urllib2 import Request, urlopen
from urllib import urlencode
import base64
import json
import requests

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

def get_entrances_report(access_token, array_keys_list, startDateIso, endDateIso):
    """
    use the token to get visits
    """

    data = {
        "keys": array_keys_list,
        "metrics": ["entrances.entrances","entrances.exits"],
        "interval": None,
        "group" : False,
        "date_range" : {"startDate" : startDateIso,
                        "endDate"   : endDateIso}
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

def get_available_metrics(access_token):
   headers = {
     'Content-Type': 'application/json',
     'Authorization': 'Bearer '+access_token
   }
   query_r = requests.post('https://api-v2.scanalyticsinc.com/metrics?limit=15&page=1', headers=headers, verify=False)
   print query_r.text
