define(function(require) {
    var d3 = require('d3'),
        $ = require('jquery');

    var plugin = {};

    var page_width = 25,
        page_height = 30;

    plugin.render = function(id, data, config) {
        $(id).empty();

        if (data.length < 1) {
            $(id).append('<p class="error">Sorry, there is not enough data to display the chart. Add at least one scene to your script.</p>');
            return;
        }

        var vis = d3.select(id);

        var pages = vis.selectAll('svg')
            .data(data)
            .enter()
            .append('svg')
            .attr('width', page_width)
            .attr('height', page_height)
            .style('margin', 5)
            .on("mouseover", function(d) {
                var action = Math.round(d.action_percentage * 100) + '%';
                var dialogue = Math.round(d.dialogue_percentage * 100) + '%';
                var action_legend = ' (<div style="width:10px;height:8px;background-color:#eeeeee;display:inline-block"></div>)';
                var dialogue_legend = ' (<div style="width:10px;height:8px;background-color:#777777;display:inline-block"></div>)';
                config.show_tooltip("Page #" + d.page_number + "<br />Action: " + action + action_legend + '<br />Dialogue: ' + dialogue + dialogue_legend);
            })
            .style('cursor', 'pointer')
            .on("mousemove", function() {
                config.move_tooltip(d3.event.pageX, d3.event.pageY);
            })
            .on("mouseout", function() {
                config.hide_tooltip();
            })
            .on('click', function(d) {
                if (config.page_click) {
                    config.page_click(d);
                }
            });

        pages.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', page_width)
            .attr('height', function(d) {
                return d.action_time * page_height;
            })
            .attr('stroke', 'none')
            .attr('fill', '#eeeeee');

        pages.append('rect')
            .attr('x', 0)
            .attr('y', function(d) {
                return d.action_time * page_height;
            })
            .attr('width', page_width)
            .attr('height', function(d) {
                return d.dialogue_time * page_height;
            })
            .attr('stroke', 'none')
            .attr('fill', '#777777');

        pages.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', page_width)
            .attr('height', page_height)
            .attr('stroke', '#000000')
            .attr('fill', 'none');

        $(id).append($('<div style="clear:both" />'));

    };

    return plugin;
});