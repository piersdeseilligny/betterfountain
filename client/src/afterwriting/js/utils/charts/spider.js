define(function(require) {
    var d3 = require('d3'),
        $ = require('jquery');

    var plugin = {},
        MAX_CHARACTER_NAME = 15;

    plugin.render = function(id, data, links, config) {
        $(id).empty();

        if (data.length <= 1) {
            $(id).append('<p class="error">Sorry, there is not enough data to display the chart. Add at least two speaking characters to your script.</p>');
            return;
        }

        for (var i = 0; i < data.length; i++) {
            if (data[i][config.label].length > MAX_CHARACTER_NAME) {
                data[i][config.label] = data[i][config.label].substr(0, MAX_CHARACTER_NAME) + '...';
            }
        }

        var max_name_length = Math.max.apply(null, data.map(function(item) {
            return item[config.label].length;
        }));
        var padding = 7.2 * max_name_length;

        var max_value = Math.max.apply(null, links.map(function(d) {
            return d.scenes;
        }));
        var link_scale = d3.scale.linear().domain([1, max_value]).range([1, Math.min(max_value, 6)]);
        links.forEach(function(link) {
            link.value = link_scale(link.scenes);
        });

        var width = 350 + padding * 2;
        var height = 300;
        var svg = d3.select(id).append('svg').attr('width', Math.min(width, $('.plugin-contents').width() - 40)).attr('viewBox', '0 0 ' + width.toString() + ' ' + height.toString());

        var circle_size = 12;
        var inner_radius = 250;
        var translate_circle = 'translate(' + ((inner_radius / 2) + padding + circle_size + 2) + ',' + ((inner_radius / 2) + circle_size) + ')';

        var arc = d3.svg.arc().outerRadius(inner_radius).innerRadius(0);

        var layout = d3.layout.pie().value(function() {
            return 1;
        });

        var points = layout(data).map(function(point) {
            return arc.centroid(point);
        });

        svg.selectAll('g')
            .data(links)
            .enter()
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', '#444444')
            .attr('stroke-width', function(d) {
                return d.value;
            })
            .attr('d', function(d) {
                return d3.svg.line().interpolate('bundle')([points[d.from], [0, 0], points[d.to]]);
            })
            .attr('transform', translate_circle)
            .attr('class', function(d) {
                return 'who-' + d.from + ' who-' + d.to;
            });

        svg.selectAll('g')
            .data(data)
            .enter()
            .append('text')
            .attr('transform', translate_circle)
            .text(function(d) {
                return d[config.label];
            })
            .attr('class', function(d, i) {
                return 'who-' + i;
            })
            .attr('font-size', 12)
            .attr('font-family', 'Courier New')
            .attr('x', function(d, i) {
                return points[i][0] > 0 ? points[i][0] + circle_size + 2 : points[i][0] - circle_size - 2 - (d[config.label].length * 7.2);
            })
            .attr('y', function(d, i) {
                return points[i][1] + 3;
            });

        svg.selectAll('g')
            .data(points)
            .enter()
            .append('circle')
            .attr('transform', translate_circle)
            .attr('cx', function(d) {
                return d[0];
            })
            .attr('cy', function(d) {
                return d[1];
            })
            .attr('class', function(d, i) {
                return 'who-' + i;
            })
            .attr('r', circle_size)
            .attr('fill', '#222222')
            .on('mouseover', function(d, i) {

                var selectors;
                var paths = svg.selectAll('path.who-' + i);
                if (paths.size()) {
                    selectors = paths[0].reduce(function(c, n) {
                        return c.concat(n.getAttribute('class').split(' '));
                    }, []).map(function(c) {
                        return 'circle.' + c + ',text.' + c;
                    }).join(',');
                } else {
                    selectors = '.who-' + i;
                }
                svg.selectAll('*').transition().style('opacity', 0.1);
                paths.transition().style('opacity', 1);
                svg.selectAll(selectors).transition().style('opacity', 1);

                var to;
                for (var j = 0; j < links.length; j++) {
                    if (links[j].from === i) {
                        to = links[j].to;
                    } else if (links[j].to === i) {
                        to = links[j].from;
                    } else {
                        continue;
                    }
                    var value = links[j].scenes.toString();
                    svg.append('text')
                        .text(value)
                        .attr('font-size', 12)
                        .attr('class', 'temp-number')
                        .attr('font-family', 'Courier New')
                        .attr('transform', translate_circle)
                        .attr('fill', '#eeeeee')
                        .attr('x', points[to][0] - value.length * 3)
                        .attr('y', points[to][1] + 3);
                }

            })
            .on('mouseout', function() {
                svg.selectAll('*').transition().style('opacity', '1.0');
                svg.selectAll('.temp-number').remove();
            });

    };

    return plugin;

});