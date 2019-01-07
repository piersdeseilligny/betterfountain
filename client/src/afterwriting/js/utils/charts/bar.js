define(function(require) {
    var d3 = require('d3'),
        $ = require('jquery');

    var plugin = {};

    plugin.render = function(id, data, config) {
        $(id).empty();

        if (data.length < 1) {
            $(id).append('<p class="error">Sorry, there is not enough data to display the chart. Add at least one scene to your script.</p>');
            return;
        }

        var max = 0;
        data.forEach(function(item) {
            if (item[config.value] > max) {
                max = item[config.value];
            }
        });
        data.forEach(function(item) {
            item.value = item.length / (max * 1.1);
        });

        var graph_width = ($('.content').width() - (config.small ? 30 : 100));
        var bar_width = graph_width / data.length;

        var vis = d3.select(id)
            .append('svg:svg')
            .attr('width', '100%')
            .attr('height', '200');

        $(id + ' svg').attr('viewBox', '0 0 200px ' + graph_width + 'px');

        var bars = vis.selectAll('g')
            .data(data)
            .enter()
            .append('rect');

        bars.attr('width', bar_width)
            .attr('height', function(d) {
                return d.value * 200;
            })
            .attr('y', function(d) {
                return 200 - d.value * 200;
            })
            .attr('x', function(d, i) {
                return i * bar_width;
            })
            .attr('fill', config.color)
            .attr('stroke', '#000000')
            .style('cursor', 'pointer')
            .on('click', function(d) {
                if (config.bar_click) {
                    config.bar_click(d);
                }
            })
            .on("mouseover", function(d) {
                config.show_tooltip(config.tooltip(d));
            })
            .on("mousemove", function() {
                config.move_tooltip(d3.event.pageX, d3.event.pageY);
            })
            .on("mouseout", function() {
                config.hide_tooltip();
            });

        vis.append('svg:path')
            .attr('d', 'M 0 0 L 0 200')
            .attr('stroke', '#000000');

        vis.append('svg:path')
            .attr('d', 'M 0 200 L 600 200')
            .attr('stroke', '#000000');

    };

    return plugin;
});