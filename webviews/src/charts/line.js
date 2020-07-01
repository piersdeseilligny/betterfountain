define(function(require) {
    var d3 = require('d3'),
        $ = require('jquery');

    console.log("d3=");
    console.log(d3);

    var plugin = {};
    plugin.render = function(id, data, config) {
        $(id).empty();

        if (data.length < 1) {
            $(id).append('<p class="error">Sorry, there is not enough data to display the chart. Add at least one scene to your script.</p>');
            return;
        }

        var min = 0,
            max = 0;
        data.forEach(function(item) {
            var value = item[config.value];
            if (value < min) {
                min = value;
            }
            if (value > max) {
                max = value;
            }
        });
        console.log("min="+min);
        console.log("max="+max);

        var width = $('.content').width() - (config.small ? 30 : 100);
        var height = 100;
        var padding = 5;

        var y = d3.scaleLinear().domain([min, max]).range([height - padding, padding]);
        var x = d3.scaleLinear().domain([0, data.length - 1]).range([0, width]);
        var line = d3.line()
            .x(function(d, i) {
                return x(i);
            })
            .y(function(d) {
                return y(d[config.value]);
            })
            .curve(d3.curveBasis);

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
                if(!config.tooltip) return;
                var txt = config.tooltip(d, i);
                if (txt) {
                    show_tip(d, i);
                    config.show_tooltip(txt);
                }
            })
            .on("mousemove", function(d, i) {
                if(!config.tooltip) return;
                hide_tip();
                var txt = config.tooltip(d, i);
                if (txt) {
                    config.move_tooltip(d3.event.pageX, d3.event.pageY);
                    show_tip(d, i);
                }
            })
            .on("mouseout", function() {
                if(!config.tooltip) return;
                hide_tip();
                config.hide_tooltip();
            });
    };

    plugin.renderTwo = function(id, data1, data2, config) {
        $(id).empty();

        if (data1.length < 1 && data2.length < 1) {
            $(id).append('<p class="error">Sorry, there is not enough data to display the chart. Add at least one scene to your script.</p>');
            return;
        }

        var min = 0,
            max = 0;
        data1.forEach(function(item) {
            var value = item[config.value];
            if (value < min) {
                min = value;
            }
            if (value > max) {
                max = value;
            }
        });
        data2.forEach(function(item) {
            var value = item[config.value];
            if (value < min) {
                min = value;
            }
            if (value > max) {
                max = value;
            }
        });

        var longestData = Math.max(data1.length, data2.length);

        console.log("min="+min);
        console.log("max="+max);

        var width = $('.content').width() - (config.small ? 30 : 100);
        var height = $(id).height();
        var padding = 5;

        var y = d3.scaleLinear().domain([min, max]).range([height - padding, padding]);
        var x = d3.scaleLinear().domain([0, longestData - 1]).range([0, width]);
        var line = d3.line()
            .x(function(d, i) {
                return x(i);
            })
            .y(function(d) {
                return y(d[config.value]);
            })
            .curve(d3.curveBasis);

        var vis = d3.select(id)
            .append('svg:svg')
            .attr('width', '100%')
            .attr('height', height);

        $(id + ' svg').attr('viewBox', `0 0 ${width} ${height}`);
        vis.append('rect').attr('width', width).attr('height', height).attr('fill', 'none').attr('class', 'chart-container');
        //vis.append('path').attr('d', 'M 0 ' + y(0) + ' l ' + width + ' 0').attr('fill', 'none').attr('stroke', '#777777');
        vis.append('path').attr('d', line(data1)).attr('fill', 'none').attr('class', 'chart-data1');
        vis.append('path').attr('d', line(data2)).attr('fill', 'none').attr('class', 'chart-data2');
        
        var block_width = width / longestData;
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
            .data(data1)
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
                if(!config.tooltip) return;
                var txt = config.tooltip(d, i);
                if (txt) {
                    show_tip(d, i);
                    config.show_tooltip(txt);
                }
            })
            .on("mousemove", function(d, i) {
                if(!config.tooltip) return;
                hide_tip();
                var txt = config.tooltip(d, i);
                if (txt) {
                    config.move_tooltip(d3.event.pageX, d3.event.pageY);
                    show_tip(d, i);
                }
            })
            .on("mouseout", function() {
                if(!config.tooltip) return;
                hide_tip();
                config.hide_tooltip();
            });
    };

    return plugin;
});
