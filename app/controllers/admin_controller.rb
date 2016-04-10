class AdminController < ApplicationController

	def dashboard_realtime
		mysql_host = 'us-cdbr-iron-east-03.cleardb.net'
		mysql_username = 'bbaf414965fded'
		mysql_password = '2f3310e8'
		mysql_db_name = 'heroku_fa3c47157b8ffc1'
		db = Mysql2::Client.new(:host => mysql_host, :username => mysql_username, :password => mysql_password, :port => 3306, :database => mysql_db_name, :flags => Mysql2::Client::MULTI_STATEMENTS )
		sql = "SELECT zone_name, time_to, occupancy FROM occupancies order by time_to desc limit 1
		"
		results = ''

		#output = []

		results = db.query(sql)
		results.each do |row|
			# conveniently, row is a hash
			# the keys are the fields, as you'd expect
			# the values are pre-built ruby primitives mapped from their corresponding field types in MySQL
			@occupancy = row["occupancy"]
			@zone_name = row["zone_name"]
			@updated_at = row["time_to"]
			if row["dne"]  # non-existant hash entry is nil
			puts row["dne"]
		end
    end

	end

	def data_get
	end

	def data_post
	end

end
