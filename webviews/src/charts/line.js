define(function(require) {

    /** @type {import('@types/d3')} */
    var d3 = require('d3');
    /** @type {import('@types/jquery/index')} */
    var $ = require('jquery');

    console.log("d3=");
    console.log(d3);
    var plugin = {};

    plugin.render = function(id, datas, config) {
        $(id).empty();
        var min = 0,
            max = 0;

        var longestData = 0;
        datas.forEach(data=>{
            data.forEach(function(item) {
                var value = item[config.value];
                if (value < min) {
                    min = value;
                }
                if (value > max) {
                    max = value;
                }
            });
            if(data.length>longestData) longestData = data.length;
        });

        var width = $(id).width() - (config.small ? 30 : 100);
        var height = $(id).height();
        var padding = 5;

        var x,y;
        function calculateScales(w,h){
            y = d3.scaleLinear().domain([min, max]).range([h - padding, padding]);
            x = d3.scaleLinear().domain([0, longestData - 1]).range([0, w]);
        }

        calculateScales(width,height);
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
            .attr('width', "100%")
            .attr('height', height);

        vis.append('rect').attr('width', width).attr('height', height).attr('fill', 'none').attr('class', 'chart-container');
        for (let i = 0; i < datas.length; i++) {
            vis.append('path').attr('d', line(datas[i])).attr('fill', 'none').attr('class', 'chart-data'+(i+1));
        }


        $(window).resize(function(e){
            console.log("resized");
            let width = $(id).width();
            vis.select('rect').attr('width', width);
            calculateScales(width,height);
            vis.selectAll('path').each(function(d,i){
                d3.select(this).attr('d', line(datas[i]));
            });
        });
        $(id).on('mousemove', function(e){
            console.log("mousemove");
            console.log(e)
        });
    };

    return plugin;
});
