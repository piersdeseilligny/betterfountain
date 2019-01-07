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

        var min = Infinity,
            max = -Infinity;
        data.forEach(function(item) {
            var value = item[config.value];
            if (value < min) {
                min = value;
            }
            if (value > max) {
                max = value;
            }
        });

        var width = $('.content').width() - (config.small ? 30 : 100);
        var height = 100;
        var padding = 5;

        var y = d3.scale.linear().domain([min, max]).range([height - padding, padding]);
        var x = d3.scale.linear().domain([0, data.length - 1]).range([0, width]);
        var line = d3.svg.line()
            .x(function(d, i) {
                return x(i);
            })
            .y(function(d) {
                return y(d[config.value]);
            })
            .interpolate('basis');

        var vis = d3.select(id)
            .append('svg:svg')
            .attr('width', '100%')
            .attr('height', height);

        $(id + ' svg').attr('viewBox', '0 0 ' + width + 'px ' + height + 'px');
        vis.append('path').attr('d', 'M 0 ' + y(0) + ' l ' + width + ' 0').attr('fill', 'none').attr('stroke', '#777777');
        vis.append('path').attr('d', line(data)).attr('fill', 'none').attr('stroke', '#111111');
        vis.append('rect').attr('width', width).attr('height', height).attr('stroke', '#111111').attr('fill', 'none');

        var block_width = width / data.length;
        var shift_tip = block_width / 2;

        var tip_layer = vis.append('g');

        var show_tip = function(d, i) {
            tip_layer.append('path')
                .attr('class', 'linetip')
                .attr('fill', 'none')
                .attr('stroke', '#777777')
                .attr('d', 'M ' + (x(i) + shift_tip) + ' 0 l 0 ' + height);
        };

        var hide_tip = function() {
            tip_layer.selectAll('.linetip').remove();
        };

        vis.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('fill-opacity', 0)
            .attr('width', block_width)
            .attr('height', height)
            .attr('x', function(d, i) {
                return x(i);
            })
            .attr('y', 0)
            .style('cursor', 'pointer')
            .on('click', function(d) {
                if (config.click) {
                    config.click(d);
                }
            })
            .on("mouseover", function(d, i) {
                var txt = config.tooltip(d, i);
                if (txt) {
                    show_tip(d, i);
                    config.show_tooltip(txt);
                }
            })
            .on("mousemove", function(d, i) {
                hide_tip();
                var txt = config.tooltip(d, i);
                if (txt) {
                    config.move_tooltip(d3.event.pageX, d3.event.pageY);
                    show_tip(d, i);
                }
            })
            .on("mouseout", function() {
                hide_tip();
                config.hide_tooltip();
            });

    };

    return plugin;
});