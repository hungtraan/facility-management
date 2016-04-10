require 'rest-client'
require 'base64'
require 'json'

module ApplicationHelper
	def full_title(page_title = '')
		base_title = " Denison Facility Management"
		if page_title.empty?
		  base_title
		else
		  page_title + " | " + base_title
		end
	end

	def get_token(username, password, clientId, clientSecret)
	    # Get an oAuth token
	    clientkey = Base64.strict_encode64(clientId+":"+clientSecret)

	    values = "grant_type=password&username=#{username}&password=#{password}"
	    headers = {
	        :content_type =>  "application/x-www-form-urlencoded",
	        :authorization => "Basic #{clientkey}"
	    }

	    response = RestClient.post 'https://api-v2.scanalyticsinc.com/token', values, headers
	    data = JSON.parse(response)
	    access_token = data["access_token"]
	    return access_token
	end

	def get_entrances_report(access_token, array_keys_list, startDateIso, endDateIso)
	    # Use the token to get visits
	    data = {
	        'keys' => array_keys_list,
	        'metrics'=> ['entrances.entrances','entrances.exits'],
	        'interval'=> nil,
	        'group' => false,
	        'date_range' => {'startDate' => startDateIso,
	                        'endDate' => endDateIso
	                    }
	    }
	    values = JSON.pretty_generate data #JSON.dump(data)
	    headers = {
	      :content_type => 'application/json',
	      :authorization => "Bearer #{access_token}"
	    }
	    response = RestClient.post 'https://api-v2.scanalyticsinc.com/reports/query',values, headers

	    report_list = JSON.parse(response)["report"]["collection"]
	    return report_list
	end

	def get_available_metrics(access_token)
	   headers = {
			:content_type => 'application/json',
			:authorization => "Bearer #{access_token}"
	   }
	   response = RestClient.post('https://api-v2.scanalyticsinc.com/metrics?limit=15&page=1', headers=headers)
	   puts response
	end
end
