define(function (require) {

    /** @type {import('@types/d3')} */
    var d3 = require('d3');


    console.log("d3=");
    console.log(d3);
    var plugin = {};

    plugin.render = function (id, datas, uipersistence, config) {
        $(id).empty();
        var min = 0,
            max = 0;

        var longestData = 0;
        var screenplaylineInfo = [];
        datas.forEach(data => {
            data.forEach(function (item) {
                var value = item[config.yvalue];
                if (value < min) {
                    min = value;
                }
                if (value > max) {
                    max = value;
                }
                if (item[config.xvalue] > longestData) longestData = item[config.xvalue];
            });
        });

        var width = $(id).width();
        var height = $(id).height();
        var padding = 4;
        let headerHeight = 32;
        let footerHeight = 20;
        let innerHeight = height - headerHeight - footerHeight;

        var x, y;

        function calculateScales(w, h) {
            y = d3.scaleLinear().domain([min, max]).range([h - padding + headerHeight, padding + headerHeight]);
            x = d3.scaleLinear().domain([0, longestData - 1]).range([0, w]);
        }

        calculateScales(width, innerHeight);
        var line = d3.line()
            .x(function (d, i) {
                return x(d[config.xvalue]);
            })
            .y(function (d) {
                return y(d[config.yvalue]);
            })
            .curve(d3.curveBasis);


        var vis = d3.select(id)
            .append('svg:svg')
            .attr('width', "100%")
            .attr('height', height);

        vis.append('rect').attr('width', width).attr('height', innerHeight).attr('fill', 'none').attr('class', 'chart-container').attr('y', headerHeight);

        var structurecontainer = vis.append('g').attr('class', 'chart-structurecontainer');
        var structurePositions = [0];

        function calculateStructurePositions() {
            if (config.structure) {
                function appendStructLine(token) {
                    structurePositions = []
                    let tokenline = token.range[0].line;
                    let opacity = 0.1;
                    let rulerheight = 6;
                    let xpos = x(tokenline);
                    if (token.section) {
                        switch (token.level) {
                            case 1:
                                if(uipersistence.snapToSection1) structurePositions.push(xpos);
                                opacity = 1;
                                rulerheight = 12;
                                break;
                            case 2:
                                if(uipersistence.snapToSection2) structurePositions.push(xpos);
                                opacity = 0.5;
                                rulerheight = 8;
                                break;
                            case 3:
                                if(uipersistence.snapToSection3) structurePositions.push(xpos);
                                opacity = 0.25;
                                rulerheight = 6;
                                break;
                        }
                    }
                    else{
                        if(uipersistence.snapToScene) structurePositions.push(xpos);
                    }

                    structurecontainer.append('rect').attr('class', 'verticalline')
                        .attr('x', xpos)
                        .attr('data-line', tokenline)
                        .attr('width', 1)
                        .attr('height', rulerheight)
                        .attr('y', headerHeight + innerHeight - rulerheight)
                        .attr('fill', 'none').attr('stroke', '#fff').attr('opacity', opacity);
                    if (token.children) {
                        for (let i = 0; i < token.children.length; i++) {
                            appendStructLine(token.children[i]);
                        }
                    }
                }
                for (let i = 0; i < config.structure.length; i++) {
                    opacity = 1;
                    appendStructLine(config.structure[i], 1);
                }
                structurePositions.push(width)
            }
        }
        calculateStructurePositions();

        let linecontainer = vis.append('g').attr('class', 'chart-linecontainer');
        for (let i = 0; i < datas.length; i++) {
            linecontainer.append('path').attr('d', line(datas[i])).attr('fill', 'none').attr('class', 'chart-data').attr('data-line', i).attr('y', headerHeight);
        }



        /* let mouserect = mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
               .attr('width', width) // can't catch mouse events on a g element
               .attr('height', innerHeight)
               .attr('y', headerHeight)
               .attr('class', "mouseG")
               .attr('fill', 'none')
               .attr('pointer-events', 'all')
               .on('mouseout', mouseout)
               .on('mouseover', mouseover)
               .on('mousemove', mousemove);*/

        ///
        /// HOVERING FEATURES
        ///

        let brushSelection = [0, 0];
        var mouseG = vis.append("g").attr("class", "mouse-over-effects");
        mouseG.append("text").attr("class", "pageNumber").text("p.1").attr("x", "100%").attr("text-anchor", "end").attr("y", "1em");
        mouseG.append("text").attr("class", "breadcrumbs").text("test").attr("y", "1em");
        mouseG.append("text").attr("class", "scene").text("test").attr("y", "2.1em").style("opacity", 0.5);
        mouseG.append("text").attr("class", "button selectbutton openineditor").attr("title", "Select in editor").html("&#xeae9").attr('y', height).attr("visibility", "collapse").on('click', function () {
            //select code in editor
        }).append("title").text("Select in Editor");
        var rightbuttonsWidth = 48;
        mouseG.append("text").attr("class", "button selectbutton zoom").html("&#xeb81").attr('y', height).attr("visibility", "collapse").on('click', function () {
            let xstart = x.invert(brushSelection[0]);
            let xend = x.invert(brushSelection[1])
            x.domain([xstart, xend])
            vis.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            let ymins = [];
            let ymaxs = [];
            for (let i = 0; i < datas.length; i++) {
                let sliced = datas[i].slice(bisect(xstart, i).index, bisect(xend, i).index);
                let extent = d3.extent(sliced, function (d) {
                    return d[config.yvalue]
                });
                ymins.push(extent[0]);
                ymaxs.push(extent[1]);
            }
            let ymin = d3.min(ymins);
            let ymax = d3.max(ymaxs);
            y.domain([ymin, ymax]);
            vis.selectAll('.chart-data').each(function (d, i) {
                d3.select(this).transition().ease(d3.easeCubic).duration(500).attr('d', line(datas[i]));
            });
            repositionStructure(true);
            rightbuttons.select(".unzoom").attr("visibility", "visible");

            rightbuttons.select(".buttonseperator").attr('x', width - (72)).attr("visibility", "collapse");
            rightbuttonsWidth = 72;
        }).append("title").text("Zoom In");;

        var rightbuttons = mouseG.append("g").attr("class", "rightbuttons");

        let magnetbtn = rightbuttons.append("text").attr("class", "button rightbutton snap").html("&#xebae").attr('y', height).attr('x', width - 24).append("title").text("Grid snapping").on("click", function () {
            console.log("Clicked on snap thing");
        });

        var snapMenu = $.contextMenu({
            selector: ".button.rightbutton.snap",
            trigger: "left",

            build: function ($trigger, e) {
                return {
                    callback: function (key, options) {
                        var m = "clicked: " + key;
                    },
                    items: {
                        freeSelection: {
                            name: "Free Selection",
                            selected: uipersistence.freeSelection,
                            updateOnClick:true,
                            settingskey: "freeSelection",
                            type: "check",
                            callback:function(){
                                console.log("called back!");
                                calculateStructurePositions();
                                return false;
                            }
                        },
                        snapToSection1: {
                            name: "Snap to # section",
                            selected: uipersistence.snapToSection1,
                            settingskey: "snapToSection1",
                            type: "check",
                            disabled:()=>uipersistence.freeSelection,
                            callback:function(){
                                console.log("called back!");
                                calculateStructurePositions();
                                return false;
                            }
                        },
                        snapToSection2: {
                            name: "Snap to ## section",
                            selected: uipersistence.snapToSection2,
                            settingskey: "snapToSection2",
                            type: "check",
                            disabled:()=>uipersistence.freeSelection,
                            callback:function(){
                                console.log("called back!");
                                calculateStructurePositions();
                                return false;
                            }
                        },
                        snapToSection3: {
                            name: "Snap to ###+ section",
                            selected: uipersistence.snapToSection3,
                            settingskey: "snapToSection3",
                            type: "check",
                            disabled:()=>uipersistence.freeSelection,
                            callback:function(){
                                console.log("called back!");
                                calculateStructurePositions();
                                return false;
                            }
                        },
                        snapToScene: {
                            name: "Snap to scenes",
                            selected: uipersistence.snapToScene,
                            settingskey: "snapToScene",
                            type: "check",
                            disabled:()=>uipersistence.freeSelection,
                            callback:function(){
                                console.log("called back!");
                                calculateStructurePositions();
                            }
                        },
                    }
                }
            },
        });

        console.log(magnetbtn);

        rightbuttons.append("text").attr("class", "button rightbutton unzoom").html("&#xeb82").attr('y', height).attr('x', width - 48).attr("visibility", "collapse").on('click', function () {
            x.domain([0, longestData - 1])
            y.domain([min, max]);
            vis.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            vis.selectAll('.chart-data').each(function (d, i) {
                d3.select(this).transition().ease(d3.easeCubic).duration(500).attr('d', line(datas[i]));
            });
            rightbuttons.select(".unzoom").attr("visibility", "collapse");
            rightbuttons.select(".buttonseperator").attr('x', width - (48)).attr("visibility", "collapse");
            repositionStructure(true);
            rightbuttonsWidth = 48;
        }).append("title").text("Zoom Out");
        rightbuttons.append("rect").attr("class", "buttonseperator rightbutton").attr('y', height - 14).attr('x', width - (48)).attr('height', 14).attr('width', 1).attr("visibility", "collapse");

        mouseG.append("rect") // this is the vertical line to follow mouse
            .attr("class", "mouse-line")
            .attr("width", "1px")
            .attr("y", headerHeight)
            .attr("height", innerHeight)
            .style("opacity", "0");

        ///
        /// BRUSHING
        ///

        var idleTimeout

        function idled() {
            idleTimeout = null;
        }

        let buttonsize = 22;
        let brush = d3.brushX().extent([
                [0, headerHeight],
                [width, height - footerHeight]
            ])
            .on('brush', function () {
                let extent = d3.event.selection;
                if (extent) {
                    if (d3.event.sourceEvent.type !== "brush" && !uipersistence.freeSelection) {
                        const d0 = d3.event.selection.map(x.invert);
                        console.log("selected [" + extent[0] + ", " + extent[1] + "]")
                        let snappedX0 = structurePositions[d3.bisectLeft(structurePositions, extent[0])];
                        let snappedX1 = structurePositions[d3.bisectLeft(structurePositions, extent[1])];
                        console.log("snap to [" + snappedX0 + ", " + snappedX1 + "]")
                        d3.select(this).call(brush.move, [snappedX0, snappedX1]);
                    }
                    if (!extent[0] || !extent[1]) return;
                    hover(x.invert(extent[0]), x.invert(extent[1]));
                    let buttons = mouseG.selectAll(".selectbutton");
                    let buttonsWidth = buttons.size() * buttonsize;
                    let offset = 0;

                    if (buttonsWidth > extent[1]) {
                        //selection is too far to the left, add an offset so they don't clip
                        offset = extent[1] - buttonsWidth;
                    } else if (extent[1] > (width - rightbuttonsWidth)) {
                        //selection is too far to the right
                        offset = extent[1] - (width - rightbuttonsWidth);
                        rightbuttons.select(".buttonseperator").attr('visibility', "visible");
                    } else {
                        rightbuttons.select(".buttonseperator").attr('visibility', "collapse");
                        if (buttonsWidth > extent[1] - extent[0]) {
                            //selection is smaller than buttons, center it between the two
                            offset = -((buttonsWidth - (extent[1] - extent[0])) / 2)
                        }
                    }
                    buttons.each(function (d, i) {
                        d3.select(this).attr("visibility", "visible").attr("x", extent[1] + (i * buttonsize) - offset - buttonsWidth);
                    });
                }

            })
            .on('end', function () {
                let extent = d3.event.selection;
                brushSelection = extent;
                if (!extent) {
                    mouseG.selectAll(".selectbutton").each(function (d, i) {
                        d3.select(this).attr("visibility", "collapse");
                    });
                    rightbuttons.select(".buttonseperator").attr('visibility', "collapse");
                }
                return;

            })
            .on('start', function () {

            });
        vis.append("g").attr("class", "brush").call(brush)

        d3.select(".brush > .overlay").on('mouseout', mouseout)
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)


        function eventToBrush() {
            const new_click_event = new MouseEvent(d3.event.type, {
                pageX: d3.event.pageX,
                pageY: d3.event.pageY,
                clientX: d3.event.clientX,
                clientY: d3.event.clientY,
                layerX: d3.event.layerX,
                layerY: d3.event.layerY,
                bubbles: true,
                cancelable: true,
                view: window
            });
            mouserect.node().dispatchEvent(new_click_event);
        }

        function mouseout() {
            vis.select(".mouse-line").style("opacity", "0");
            if (config.hover) {
                config.hover(false);
            }
        }

        function mouseover() {
            vis.select(".mouse-line").style("opacity", "1")
        }

        function mousemove() {
            var mouse = d3.mouse(this);
            vis.select(".mouse-line")
                .attr('x', mouse[0]);
            hover(x.invert(mouse[0]));
        }

        function hover(xval, xval2) {
            values = [];
            if (config.hover) {
                d3.selectAll('.chart-data').each(function (d, i) {
                    if (xval2)
                        values.push([bisect(xval, i), bisect(xval2, i)]);
                    else
                        values.push(bisect(xval, i));
                });
                config.hover(true, xval, values, (xval2 != undefined))
            }
            if (config.map) {
                let lineNb = Math.floor(xval).toString();
                if (config.map.has(lineNb)) {
                    let lineinfo = config.map.get(lineNb);
                    mouseG.select(".pageNumber").text("p." + lineinfo.page);
                    mouseG.select(".scene").text(lineinfo.scene);
                    mouseG.select(".breadcrumbs").html(lineinfo.sections.join("<tspan class='chevron' alignment-baseline='middle'>&#xeab6</tspan>"));
                }
            }
        }

        function bisect(xval, lineindex) {
            const bisect = d3.bisector(d => d[config.xvalue]).left;
            const index = bisect(datas[lineindex], xval, 1);
            const a = datas[lineindex][index - 1];
            const b = datas[lineindex][index];
            if (b && (xval - a[config.xvalue] > b[config.xvalue] - xval)) {
                b.index = index;
                return b;
            } else {
                a.index = index - 1;
                return a;
            }
        }

        function getInterpolatedY(x0, lineIndex) {
            var bisect = d3.bisector(function (d) {
                return d[config.xvalue];
            }).left;

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

        $(window).resize(function (e) {
            console.log("resized");
            width = $(id).width();
            vis.select('rect').attr('width', width);
            vis.select('.mouseG').attr('width', width);
            calculateScales(width, innerHeight);
            vis.selectAll('.chart-data').each(function (d, i) {
                d3.select(this).attr('d', line(datas[i]));
            });
            repositionStructure();
            brush.extent([
                [0, headerHeight],
                [width, height - footerHeight]
            ])
            vis.selectAll('.rightbutton').each(function (d, i) {
                d3.select(this).attr('x', width - 24 * (i + 1));
            });
        });

        function repositionStructure(transition) {
            structurePositions = [0];
            structurecontainer.selectAll('rect').each(function (d, i) {
                let structline = d3.select(this);
                let xpos = x(structline.attr('data-line'));
                structurePositions.push(xpos);
                if (transition)
                    structline.transition().duration(500).ease(d3.easeCubic).attr('x', x(structline.attr('data-line')));
                else
                    structline.attr('x', x(structline.attr('data-line')));
            });
            structurePositions.push(width);
        }
    };

    return plugin;
});