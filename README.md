
## Facility Management Dashboard
* The report dashboard is a one-page app
* There are at-a-glance counters displaying: current occupancy value, average and peak entrances by date of the selected range
* Date range selector with several presets and the ability to select a custom date range: Last 7 days (default), Last 30 days, Last week, This week, Last month, This month
* Bar Chart of Daily Entrance: Traffic trend of the (Selectable time interface)
* Heatmap: 
  - By date: Report of distribution of entrances by hour across the selected date range
  -  By weekday: Same as above but grouped by weekday
* Export to file (csv type) with selectors for data range
  - Supports the ability to Save to file (PDF, CSV, Excel) or Print data table and heatmaps
* All charts and data tables are refresh in-page without refresh
* Authorization: Login/Log out with Google account
  - Only accessible to admins and software maintainers
*Readily responsive for mobile device display

#### Working in background:
A set of cronjobs (automated tasks) to record data received by Scanalytics tracking device to process and store traffic data into the software’s own database. This component is implemented in such a way that only the Hardware Communication (with the current Scanalytics box) will require modification for a different hardware choice.


![Screenshot1](https://monosnap.com/file/vKeX2eaIHuXP6TLTkwWOnxOnXhsu6d.png)
![Screenshot2](https://monosnap.com/file/44ksWeVhymaklXmJknvrtaEebqYn2c.png)
![Screenshot3](https://monosnap.com/file/k8nwHWfuc95hsir9VfOglcaLMSoKrR.png)
