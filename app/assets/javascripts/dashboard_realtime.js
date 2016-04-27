// require d3
//= require jquery
//= require bootstrap-sprockets
//= require bootstrap.min
//= require_tree .
//= require moment/moment.min
//= require datepicker/daterangepicker
//= require icheck/icheck.min
// require nprogress
// require nprogress-turbolinks
// require gauges

// require jquery.nicescroll
// require moment
// require chartjs/chart.min

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

var handleDataTableButtons = function() {
              "use strict";
              0 !== $("#datatable-buttons").length && $("#datatable-buttons").DataTable({
              	destroy: true,
              	responsive: true,
                dom: "Bfrtip",
                buttons: [{
                  extend: "copy",
                  className: "btn-sm"
                }, {
                  extend: "csv",
                  className: "btn-sm"
                }, {
                  extend: "excel",
                  className: "btn-sm"
                }, {
                  extend: "pdf",
                  className: "btn-sm"
                }, {
                  extend: "print",
                  className: "btn-sm"
                }],
                responsive: !0
              })
            },
            TableManageButtons = function() {
              "use strict";
              return {
                init: function() {
                  handleDataTableButtons()
                }
              }
            }();



$('document').ready(function() {
	$('.dropdown-toggle').dropdown();

	Chart.defaults.global.legend = {
    	enabled: false
    };

	// Bar chart initializer
	var ctx = document.getElementById("barChart");
		var mybarChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: [],
			datasets: [{
			  label: 'Entrances',
			  backgroundColor: "#26B99A",
			  data: []
			}], 
			},
		options: {
			responsive: true,
			scales: {
				yAxes: [{
					ticks: {
					  beginAtZero: true
					},
					scaleLabel: {
						display: false,
						labelString: 'Total Entrances'
					}
				}],
				xAxes: [{
						type: "time",
						time: {
							format: 'MM/DD/YYYY',
							unit: 'day',
							unitStepSize: 1,
							round: 'day',
							tooltipFormat: 'll'
						},
						scaleLabel: {
							display: true,
							labelString: 'Date'
						}
					}, ],
			}
		}
	});

	// Function to update various charts and numbers on ajax update
	var updateChartjs = function(labels,data) {
		mybarChart.config.data.datasets[0].data = data;
		mybarChart.config.data.labels = labels;
		mybarChart.update();
		var total_entrances = 0;
		for(var i = 0; i < data.length; i++) {
			total_entrances = total_entrances + data[i];
		}
		
		// Top Widget section
		$('.entrance-count').html(Math.round(total_entrances/data.length));
		$('.total_entrances').html(total_entrances);
		$('.busiest_day').html(data.max());
		busiest_date = moment(labels[data.indexOf(data.max())]).format("ll");
		$('.busiest_date').html(busiest_date);
		
	}

	var ajaxRefresh = function(json){
		toRender = [];
    	labels = [];
    	entrances = []
        for(var i = 0; i < json.length; i++) {
		    var eachDay = json[i];
		    date = eachDay[0]; // "2016-04-11"
		    dataday = [new Date(date),eachDay[1]];
		    labels.push(new Date(date));
		    entrances.push(eachDay[1]);
		}
		updateChartjs(labels,entrances);
	}

	// Populate DataTable with json response from ajax
	// Destroy the current table and draw a new one
	var populateDataTable = function(json){
	    $('#datatable-buttons').dataTable().fnDestroy();
		$('#datatable-buttons > tbody').html("");
		json.forEach(function(entry){
			$('#datatable-buttons > tbody').append('<tr><td>'+entry[0]+'</td><td>'+entry[1]+'</td></tr>');
		});
		TableManageButtons.init();
	}
	
	var heatmapHourlyDaily = function(json){
		hour_arr = [];
		date_arr = [];
		// z: [[1, 20, 30, 50, 1], 
	    	// [20, 1, 60, 80, 30], 
	    	// [30, 60, 1, -10, 20]],
	 	for(var hour = 5; hour < 23; hour++){
	 		entraces_by_date = [];
	 		for (var row in json){
	 			if (json[row][1] == hour){
	 				entraces_by_date.push(json[row][2]);
	 			}
	 			if (json[row][1] == 5){
	 				date_arr.push(json[row][0]);
	 			}
			}
			hour_arr.push(entraces_by_date);
		}
		var data = [
				  {
				    z: hour_arr,
				    x: date_arr,
				    y: ['5AM','6AM','7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','9PM','10PM'],
				    type: 'heatmap',
				    colorscale: [[0, '#26B99A'],
								 [1, '#001f3f']],

				  }
				];
		var layout = {
			annotations: [],
			height: 600,
			xaxis: {
				type: 'category',
				ticks: '',
				side: 'bottom'
				},
			yaxis: {
					ticks: '',
					ticksuffix: ' ',
					autosize: false
				}
			};

		Plotly.newPlot('heatmapHour', data, layout);
	}

	var heatmapHourlyWeekday = function(json){
		entraces_by_weekday = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
		// z: [[1, 20, 30, 50, 1], // hour 1 [day1, day2, day 3]
	    	// [20, 1, 60, 80, 30], 
	    	// [30, 60, 1, -10, 20]],
    	for (var row in json){
 			// json[row][0] = weekday Mon-Sun
 			// json[row][1] = hour 1-22
 			// json[row][2] = weekdaynum 0-6 (Mon-Sun)
 			// json[row][3] = entrances
 			hour = json[row][1];
			weekdaynum = json[row][2];
			if (typeof hour == 'undefined' || typeof weekdaynum == 'undefined'){
				break;
			}
			if (typeof entraces_by_weekday[hour-5][weekdaynum] == 'undefined' && entraces_by_weekday[hour-5][weekdaynum] == null) {
				entraces_by_weekday[hour-5][weekdaynum] = 0;
			}
			entraces_by_weekday[hour-5][weekdaynum] += json[row][3];
			// hour-5 for indexing
		}
		
		var data = [
				  {
				    z: entraces_by_weekday,
				    x: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'],
				    y: ['5AM','6AM','7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','9PM','10PM'],
				    type: 'heatmap',
				    colorscale: [[0, '#26B99A'],
								 [1, '#001f3f']],

				  }
				];
		var layout = {
			annotations: [],
			height: 600,
			xaxis: {
				type: 'category',
				ticks: '',
				side: 'bottom'
				},
			yaxis: {
					ticks: '',
					ticksuffix: ' ',
					autosize: true
				}
			};
		Plotly.newPlot('heatmapWeekday', data, layout);
	}

	// Load recent week
	var initStartDate = moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00');
	var initEndDate = moment().format('YYYY-MM-DD 23:59:59'); //2016-04-08 22:00:00
	$.ajax({
        method: "POST",
        url: "admin/data_post",
        dataType: "json",
        data: {
            time_from: initStartDate,
            time_to: initEndDate
        },
	    success:function(json) {
	    	ajaxRefresh(json);
	    	populateDataTable(json);
	    }
	});

    $.ajax({
    	method:"POST",
    	url: "admin/hourly_data",
        dataType: "json",
    	data: {
            time_from: initStartDate,
            time_to: initEndDate
        },
        success: function(json) {
            heatmapHourlyDaily(json);
        }
    });

    $.ajax({
    	method:"POST",
    	url: "admin/weekday_hourly_data",
        dataType: "json",
    	data: {
            time_from: initStartDate,
            time_to: initEndDate
        },
        success: function(json) {
            heatmapHourlyWeekday(json);
        }
    });

    var cb = function(start, end, label) {
        console.log(start.toISOString(), end.toISOString(), label);
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        //alert("Callback has fired: [" + start.format('MMMM D, YYYY') + " to " + end.format('MMMM D, YYYY') + ", label = " + label + "]");
    }

    // Datepicker
    var optionSet1 = {
        startDate: moment().subtract(6, 'days'),
        endDate: moment(),
        minDate: '01/01/2016',
        maxDate: moment(),
        dateLimit: {
            days: 90
        },
        showDropdowns: true,
        showWeekNumbers: true,
        timePicker: false,
        timePickerIncrement: 1,
        timePicker12Hour: true,
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Week': [moment().startOf('week'), moment().endOf('week')],
            'Last Week': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        opens: 'left',
        buttonClasses: ['btn btn-default'],
        applyClass: 'btn-small btn-primary',
        cancelClass: 'btn-small',
        format: 'MM/DD/YYYY',
        separator: ' to ',
        locale: {
            applyLabel: 'Submit',
            cancelLabel: 'Clear',
            fromLabel: 'From',
            toLabel: 'To',
            customRangeLabel: 'Custom',
            daysOfWeek: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            firstDay: 1
        }
    };
    $('#reportrange span').html(moment().subtract(6, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));

    $('#reportrange').daterangepicker(optionSet1, cb);

    // $('#reportrange').on('show.daterangepicker', function() {
    //     console.log("show event fired");
    // });
    // $('#reportrange').on('hide.daterangepicker', function() {
    //     console.log("hide event fired");
    // });

    $('#reportrange').on('apply.daterangepicker', function(ev, picker) {
        // console.log("apply event fired, start/end dates are " + picker.startDate.format('YYYY-MM-DD HH:mm:ss') + " to " + picker.endDate.format('YYYY-MM-DD'));
        var time_from = picker.startDate.format("YYYY-MM-DD HH:mm:ss"); //format: 2016-04-07 00:00:00
        var time_to = picker.endDate.format("YYYY-MM-DD HH:mm:ss");
        $.ajax({
                method: "POST",
                url: "admin/data_post",
                data: {
                    time_from: time_from,
                    time_to: time_to
                },
	            success: function(json) {
	                ajaxRefresh(json);
	                populateDataTable(json);
	            }
	        });
        $.ajax({
	    	method:"POST",
	    	url: "admin/hourly_data",
	        dataType: "json",
	    	data: {
	            time_from: time_from,
	            time_to: time_to
	        },
	        success: function(json) {
	            heatmapHourlyDaily(json);
	        }
	    });
	    $.ajax({
	    	method:"POST",
	    	url: "admin/weekday_hourly_data",
	        dataType: "json",
	    	data: {
	            time_from: time_from,
	            time_to: time_to
	        },
	        success: function(json) {
	            heatmapHourlyWeekday(json);
	        }
	    });
    });
    // $('#reportrange').on('cancel.daterangepicker', function(ev, picker) {
    //     console.log("cancel event fired");
    // });
    $('#options1').click(function() {
        $('#reportrange').data('daterangepicker').setOptions(optionSet1, cb);
    });
    $('#options2').click(function() {
        $('#reportrange').data('daterangepicker').setOptions(optionSet2, cb);
    });
    $('#destroy').click(function() {
        $('#reportrange').data('daterangepicker').remove();
    });
    // Datepicker end

    // TableManageButtons.init();


});
