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
        var screenplaylineInfo = [];
        datas.forEach(data=>{
            data.forEach(function(item) {
                var value = item[config.yvalue];
                if (value < min) {
                    min = value;
                }
                if (value > max) {
                    max = value;
                }
                if(item[config.xvalue]>longestData) longestData = item[config.xvalue];
            });

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
                return x(d[config.xvalue]);
            })
            .y(function(d) {
                return y(d[config.yvalue]);
            })
            .curve(d3.curveBasis);

        var vis = d3.select(id)
            .append('svg:svg')
            .attr('width', "100%")
            .attr('height', height);

        vis.append('rect').attr('width', width).attr('height', height).attr('fill', 'none').attr('class', 'chart-container');
        for (let i = 0; i < datas.length; i++) {
            vis.append('path').attr('d', line(datas[i])).attr('fill', 'none').attr('class', 'chart-data').attr('data-line', i);
        }
        var mouseG = vis.append("g")
                        .attr("class", "mouse-over-effects");

        mouseG.append("path") // this is the vertical line to follow mouse
          .attr("class", "mouse-line")
          .style("stroke-width", "1px")
          .style("opacity", "0");
        mouseG.append("text").attr("class", "pageNumber").text("test");
        var offsetLeft = $(id)[0].offsetLeft;
        mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
              .attr('width', width) // can't catch mouse events on a g element
              .attr('height', height)
              .attr('fill', 'none')
              .attr('pointer-events', 'all')
              .on('mouseout', function() { // on mouse out hide line, circles and text
                d3.select(".mouse-line").style("opacity", "0");
                if(config.hover){
                    config.hover(false);
                }
              })
              .on('mouseover', function() { // on mouse in show line, circles and text
                d3.select(".mouse-line").style("opacity", "1");
              })
              .on('mousemove', function() { // mouse moving over canvas
                var mouse = d3.mouse(this);
                d3.select(".mouse-line")
                  .attr("d", function() {
                    var d = "M" + mouse[0] + "," + height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                  });
                let xval = x.invert(d3.mouse(this)[0]);
                if(config.hover){
                    yvalues = [];
                    
                    d3.selectAll('.chart-data').each(function(d,i){
                        yvalues.push(bisect(xval, xval, i));
                    });
                    config.hover(true, xval, yvalues)
                }
                if(config.map){
                    let lineNb = Math.floor(xval).toString();
                    if(config.map.has(lineNb)){
                        let lineinfo = config.map.get(lineNb);
                        mouseG.select(".pageNumber").text(lineinfo.page)
                    }
                }

            });

        function bisect(xval, mx, lineindex){
            const bisect = d3.bisector(d => d[config.xvalue]).left;
            const index = bisect(datas[lineindex], xval, 1);
            const a = datas[lineindex][index - 1];
            const b = datas[lineindex][index];
            const yval= b && (xval - a[config.xvalue] > b[config.xvalue] - xval) ? b : a;
            return yval[config.yvalue];
          }
        function getInterpolatedY(x0, lineIndex){
            var bisect = d3.bisector(function(d) { return d[config.xvalue]; }).left;
 
            var item = datas[lineIndex][bisect(datas[lineIndex], x0)];
            return y(item[config.yvalue]);
            //For a given non-whole value X, get the corresponding interpolated Y value for the chart of index=lineindex
            /*let yArray = pureDatas[lineIndex];
            let flooredX = Math.floor(x0);
            if(flooredX<0)flooredX=0;
            if(flooredX>yArray.length) flooredX = yArray.length;
            var flooredY = yArray[flooredX];
            if(yArray[flooredX+1]!=undefined){
                let rangeInY = yArray[flooredX+1]-yArray[flooredX];
                let fractionalY = flooredY+(rangeInY*(x0-flooredX));
                return fractionalY;
            }
            else{
                return flooredY;
            }*/
            return 0;
        }

        $(window).resize(function(e){
            console.log("resized");
            let width = $(id).width();
            vis.select('rect').attr('width', width);
            calculateScales(width,height);
            vis.selectAll('.chart-data').each(function(d,i){
                d3.select(this).attr('d', line(datas[i]));
            });
        });
    };

    return plugin;
});
