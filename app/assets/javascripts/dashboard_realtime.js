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

// require gauges
// require jquery
// require jquery.flot
// require jquery.flot.pie
// require chartjs/chart.min


var handleDataTableButtons = function() {
              "use strict";
              0 !== $("#datatable-buttons").length && $("#datatable-buttons").DataTable({
              	destroy: true,
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
	Chart.defaults.global.legend = {
    	enabled: false
    };


	// Bar chart
	var ctx = document.getElementById("mybarChart");
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
			// responsive: true,
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
							unitStepSize: 1,
							unit: 'day',
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

	var updateChartjs = function(labels,data) {
		// console.log(mybarChart);
		// console.log(mybarChart.config.data.datasets[0].data);
		// console.log(mybarChart.points);
		mybarChart.config.data.datasets[0].data = data;
		mybarChart.config.data.labels = labels;
		mybarChart.update();
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
		    // console.log(dataday);
		    // toRender.push(dataday);
		}
		// console.log(toRender);
		// updateChart(toRender);
		updateChartjs(labels,entrances);
	}
	var populateDataTable = function(json){
	    $('#datatable-buttons').dataTable().fnDestroy();
		$('#datatable-buttons > tbody').html("");
		json.forEach(function(entry){
			$('#datatable-buttons > tbody').append('<tr><td>'+entry[0]+'</td><td>'+entry[1]+'</td></tr>');
		});
		TableManageButtons.init();
	}
	
	// Load recent week
	var initStartDate = moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00');
	var initEndDate = moment().format('YYYY-MM-DD 23:59:59'); //2016-04-08 22:00:00
	$.ajax({
        method: "POST",
        url: "admin/data_post",
        dataType: "json",
        async:false,
        data: {
            time_from: initStartDate,
            time_to: initEndDate
        },
	    success:function(json) {
	    	ajaxRefresh(json);
	    	populateDataTable(json);
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
            daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
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
	                // console.log(json);
	                // alert("Data Saved: " + msg);
	                ajaxRefresh(json);
	                populateDataTable(json);
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

    $(".sparkline_one").sparkline([2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 5, 6, 4, 5, 6, 3, 5, 4, 5, 4, 5, 4, 3, 4, 5, 6, 7, 5, 4, 3, 5, 6], {
        type: 'bar',
        height: '125',
        barWidth: 13,
        colorMap: {
            '7': '#a1a1a1'
        },
        barSpacing: 2,
        barColor: '#26B99A'
    });

    $(".sparkline11").sparkline([2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 6, 2, 4, 3, 4, 5, 4, 5, 4, 3], {
        type: 'bar',
        height: '40',
        barWidth: 8,
        colorMap: {
            '7': '#a1a1a1'
        },
        barSpacing: 2,
        barColor: '#26B99A'
    });

    $(".sparkline22").sparkline([2, 4, 3, 4, 7, 5, 4, 3, 5, 6, 2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 6], {
        type: 'line',
        height: '40',
        width: '200',
        lineColor: '#26B99A',
        fillColor: '#ffffff',
        lineWidth: 3,
        spotColor: '#34495E',
        minSpotColor: '#34495E'
    });
    // TableManageButtons.init();
});


	// var updateChart = function(d1) {
	// 	if (d1 == undefined || d1 == null){
	// 		var d1 = [];
	// 		//here we generate data for chart
	// 	    for (var i = 0; i < 30; i++) {
	// 	        d1.push([new Date(Date.today().add(i).days()).getTime(), randNum() + i + i + 10]);
	// 	        //    d2.push([new Date(Date.today().add(i).days()).getTime(), randNum()]);
	// 	    }
	// 	}
	//     console.log(d1);
	//     var chartMinDate = d1[0][0]; //first day
	//     var chartMaxDate = d1[d1.length-1][0]; //last day
	//     console.log(chartMinDate, chartMaxDate);
	//     var tickSize = [1, "day"];
	//     var tformat = "%Y/%m/%d";

	//     //graph options
	//     var options = {
	//         grid: {
	//             show: true,
	//             aboveData: true,
	//             color: "#3f3f3f",
	//             labelMargin: 10,
	//             axisMargin: 0,
	//             borderWidth: 0,
	//             borderColor: null,
	//             minBorderMargin: 5,
	//             clickable: true,
	//             hoverable: true,
	//             autoHighlight: true,
	//             mouseActiveRadius: 100
	//         },
	//         series: {
	//             lines: {
	//                 show: true,
	//                 fill: true,
	//                 lineWidth: 2,
	//                 steps: false
	//             },
	//             points: {
	//                 show: true,
	//                 radius: 4.5,
	//                 symbol: "circle",
	//                 lineWidth: 3.0,
	//                 hoverable: true
	//             }
	//         },
	//         legend: {
	//             position: "ne",
	//             margin: [0, -25],
	//             noColumns: 0,
	//             labelBoxBorderColor: null,
	//             labelFormatter: function(label, series) {
	//                 // just add some space to labes
	//                 return label + '&nbsp;&nbsp;';
	//             },
	//             width: 40,
	//             height: 1
	//         },
	//         colors: chartColours,
	//         shadowSize: 0,
	//         // showTooltips: true, //activate tooltip
	//         // tooltipOpts: {
	//         //     content: "%s: %y.0",
	//         //     xDateFormat: "%m/%d",
	//         //     shifts: {
	//         //         x: -10,
	//         //         y: -10
	//         //     },
	//         //     defaultTheme: true
	//         // },
	//         tooltip: {
	// 	        format: {
	// 	            title: function (d) { return 'Data ' + d; },
	// 	            value: function (value, ratio, id) {
	// 	                var format = d3.format(',') ;
	// 	                return format(value);
	// 	            }
	// 	        }
	// 	    },
	//         yaxis: {
	//             min: 0
	//         },
	//         xaxis: {
	//             mode: "time",
	//             minTickSize: tickSize,
	//             timeformat: tformat,
	//             min: chartMinDate,
	//             max: chartMaxDate
	//         }
	//     };
	//     var plot = $.plot($("#placeholder33x"), [{
	//         label: "Entrances",
	//         data: d1,
	//         lines: {
	//             fillColor: "rgba(150, 202, 89, 0.12)"
	//         }, //#96CA59 rgba(150, 202, 89, 0.42)
	//         points: {
	//             fillColor: "#fff"
	//         }
	//     }], options);
	// }