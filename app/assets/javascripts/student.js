//= require d3

$(document).ready(function(){
	var perc = $('#perc').val();
	var occupancy = $('#occupancy').val();
	var size = 150,
    thickness = 60;

	var color = d3.scale.linear()
	    // .domain([100, 75, 50, 25, 0])
	    .domain([0,25,40,60,100])
	    .range(['#0f9f59','#48ba17','#fbbd08','#db7f29','#db2828']);
		// .domain([0, 17, 33, 50, 67, 83, 100])
		// .range(['#db4639', '#db7f29', '#d1bf1f', '#92c51b', '#48ba17', '#12ab24', '#0f9f59']);

	var arc = d3.svg.arc()
	    .innerRadius(size - thickness)
	    .outerRadius(size)
	    .startAngle(-Math.PI / 2);

	var svg = d3.select('#chart').append('svg')
	    .attr('width', size * 2)
	    .attr('height', size + 20)
	    .attr('class', 'gauge');

	var chart = svg.append('g')
	    .attr('transform', 'translate(' + size + ',' + size + ')')

	var background = chart.append('path')
	    .datum({
	        endAngle: Math.PI / 2
	    })
	    .attr('class', 'background')
	    .attr('d', arc);

	var foreground = chart.append('path')
	    .datum({
	        endAngle: -Math.PI / 2
	    })
	    .style('fill', '#db2828')
	    .attr('d', arc);

	var value = svg.append('g')
	    .attr('transform', 'translate(' + size + ',' + (size * .9) + ')')
	    .append('text')
	    .text(0)
	    .attr('text-anchor', 'middle')
	    .attr('class', 'value');

	var scale = svg.append('g')
	    .attr('transform', 'translate(' + size + ',' + (size + 15) + ')')
	    .attr('class', 'scale');

	scale.append('text')
	    .text('100%')
	    .attr('text-anchor', 'middle')
	    .attr('x', (size - thickness / 2));

	scale.append('text')
	    .text('0%')
	    .attr('text-anchor', 'middle')
	    .attr('x', -(size - thickness / 2));

	// setInterval(function() {
	//     update(Math.random() * 100);
	// }, 1500);

	function update(v, occupancy) {
	    v = d3.format('.1f')(v);
	    foreground.transition()
	        .duration(1000)
	        .style('fill', function() {
	            return color(v);
	        })
	        .call(arcTween, v);

	    value.transition()
	        .duration(1000)
	        .call(textTween, occupancy);
	}

	function arcTween(transition, v) {
	    var newAngle = v / 100 * Math.PI - Math.PI / 2;
	    transition.attrTween('d', function(d) {
	        var interpolate = d3.interpolate(d.endAngle, newAngle);
	        return function(t) {
	            d.endAngle = interpolate(t);
	            return arc(d);
	        };
	    });
	}

	function textTween(transition, v) {
	    transition.tween('text', function() {
            this.innerHTML = d3.format('d')(v) + ' people';
	    });
	}

	update(perc, occupancy);

	$('input.update').on('click', function () {
	    $.ajax({
			type: "GET",
			contentType: "application/json; charset=utf-8",
			url: 'pages/data_get',
			dataType: 'json',
			success: function (data) {
				console.log(data);
				$('.time').html(data.time);
				perc = Math.round(data.occupancy/120*100);
				update(perc, data.occupancy);
			},
			error: function (result) {
			   error();
			}
		});
	});

	// $('input.update').on('click', function () {
	// 	$.ajax({
	// 		method: "POST",
	// 		url: "pages/data_post",
	// 		data: { name: "John", location: "Boston" }
	// 		})
	// 		.done(function( msg ) {
	// 		alert( "Data Saved: " + msg );
	// 		});
	// });
});
	


	