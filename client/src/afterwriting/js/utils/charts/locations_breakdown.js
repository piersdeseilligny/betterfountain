define(function(require) {
    var d3 = require('d3'),
        $ = require('jquery'),
        helper = require('utils/helper');
    var plugin = {};

    plugin.render = function(id, data, config) {
        $(id).empty();

        if (data.length < 1) {
            $(id).append('<p class="error">Sorry, there is not enough data to display the chart. Add at least ??? to your script.</p>');
            return;
        }

        // prepare data

        var total = data.reduce(function(result, item) {
                return result + item.lines;
            }, 0),
            current_shift = 0,
            total_pages = 0,
            occurrences = {},
            aggregated_data = {},
            location_index = 0; // used for created classes

        data.forEach(function(item) {
            // to calculate box position
            item.total_lines = current_shift;
            total_pages += item.pages;
            current_shift += item.lines;

            occurrences[item.location] = occurrences[item.location] || [];
            occurrences[item.location].push(item);

            if (!aggregated_data[item.location]) {
                location_index++;
                aggregated_data[item.location] = {
                    location: item.location,
                    pages: 0,
                    location_index: location_index,
                    scenes: 0
                };
            }

            aggregated_data[item.location].scens += item.scenes;
            aggregated_data[item.location].pages += item.pages;
            aggregated_data[item.location].occurrences = occurrences[item.location].length;

            item.occurrences = occurrences[item.location];
        });

        var aggregated_data_list = [];
        for (var key in aggregated_data) {
            var item = aggregated_data[key];
            item.value = item.pages / total_pages;
            aggregated_data_list.push(item);
        }

        var vis = d3.select(id).append('svg:svg')
            .attr('width', '98%')
            .attr('height', '480px');
        var h = 300;
        var color = d3.scale.category20();

        // scenes
        vis.selectAll('g')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', function(item) {
                return (100 * item.total_lines / total) + '%';
            })
            .attr('y', 0)
            .attr('width', function(item) {
                return (100 * item.lines / total) + '%';
            })
            .attr('height', h / 2)
            .attr('stroke', '#000000')
            .attr('stroke-width', 1)
            .attr('class', function(item) {
                return 'location location' + aggregated_data[item.location].location_index;
            })
            .attr('fill', function(item) {
                return item.occurrences.length === 1 ? '#eeeeee' : color(item.location);
            })
            .on("mouseover", function(d) {
                var occurences = 'occurrences: ' + aggregated_data[d.location].occurrences;
                config.show_tooltip(d.location + ' (' + helper.format_time(d.pages) + ' / ' + helper.format_time(aggregated_data[d.location].pages) + ')<br />' + occurences);
                d3.selectAll('.location').style('opacity', 0.2);
                d3.selectAll('.location' + aggregated_data[d.location].location_index).style('opacity', 1);
            })
            .on("mousemove", function() {
                config.move_tooltip(d3.event.pageX, d3.event.pageY);
            })
            .on("mouseout", function() {
                config.hide_tooltip();
                d3.selectAll('.location').style('opacity', 1);
            });

        var pie_chart = vis.append('g')
            .attr('transform', 'translate(-150,0)')
            .append('svg:svg')
            .data([aggregated_data_list])
            .attr('height', 300)
            .attr('width', 300)
            .attr('x', '50%')
            .attr('y', h * 0.5 + 30)
            .append('g')
            .attr('transform', 'translate(150,150)');

        var arc = d3.svg.arc().outerRadius(150);
        var pie = d3.layout.pie().value(function(d) {
            return d.pages;
        });

        var arcs = pie_chart.selectAll('g')
            .data(pie)
            .enter()
            .append('svg:g');

        arcs.append('svg:path')
            .attr('stroke', '#777777')
            .attr('class', function(item) {
                return 'location location' + aggregated_data[item.data.location].location_index;
            })
            .attr('fill', function(d) {
                return d.data.occurrences > 1 ? color(d.data.location) : '#eeeeee';
            })
            .attr('d', arc)
            .on("mouseover", function(d) {
                var occurences = 'occurrences: ' + aggregated_data[d.data.location].occurrences;
                config.show_tooltip(d.data.location + ' (' + helper.format_time(d.data.pages) + ')<br />' + occurences);
                d3.selectAll('.location').style('opacity', 0.2);
                d3.selectAll('.location' + aggregated_data[d.data.location].location_index).style('opacity', 1);
            })
            .on("mousemove", function() {
                config.move_tooltip(d3.event.pageX, d3.event.pageY);
            })
            .on("mouseout", function() {
                config.hide_tooltip();
                d3.selectAll('.location').style('opacity', 1);
            });

    };


    return plugin;
});