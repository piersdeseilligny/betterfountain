const {
    values
} = require('d3');

define(function (require) {

    /** @type {import('@types/d3')} */
    var d3 = require('d3');

    var plugin = {};


    function padZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
    function secondsToString(seconds) {
        var time = new Date(null);
        time.setHours(0);
        time.setMinutes(0);
        time.setSeconds(seconds);
        return padZero(time.getHours()) + ":" + padZero(time.getMinutes()) + ":" + padZero(time.getSeconds());
    }

    plugin.render = function (id, datas, uipersistence, config) {
        let vis = {};
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
        let headerHeight = 36;
        let footerHeight = 64;
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
            .curve(d3.curveLinear);

        vis = d3.select(id)
            .append('svg:svg')
            .attr('width', "100%")
            .attr('height', height);


        vis.append('rect').attr('width', width).attr('height', innerHeight).attr('fill', 'none').attr('class', 'chart-container').attr('y', headerHeight);


        vis.append("rect")
        .attr("class", "selection-box")
        .attr("width", 0)
        .attr("y", headerHeight)
        .attr("x", 0)
        .attr("height", innerHeight)
        .style("opacity", "1");

        var structurecontainer = vis.append('g').attr('class', 'chart-structurecontainer');
        var structurePositions = [0];

        function calculateStructurePositions() {
            structurecontainer.selectAll('rect').remove();
            if (config.structure) {
                structurePositions = [0]

                function appendStructLine(token) {
                    let tokenline = token.range[0].line;
                    let opacity = 0.1;
                    let rulerheight = 6;
                    let xpos = x(tokenline);
                    let tokentype = "";
                    if (token.section) {
                        switch (token.level) {
                            case 1:
                                if (uipersistence.chartSnapToSection1) structurePositions.push(xpos);
                                tokentype = "section1";
                                opacity = 1;
                                rulerheight = 12;
                                break;
                            case 2:
                                if (uipersistence.chartSnapToSection2) structurePositions.push(xpos);
                                tokentype = "section2";
                                opacity = 0.5;
                                rulerheight = 8;
                                break;
                            default:
                                if (uipersistence.chartSnapToSection3) structurePositions.push(xpos);
                                tokentype = "section3";
                                opacity = 0.25;
                                rulerheight = 6;
                                break;
                        }
                    } else {
                        if (uipersistence.chartSnapToScene) structurePositions.push(xpos);
                        tokentype = "scene";
                    }
                    structurecontainer.append('rect').attr('class', 'verticalline')
                        .attr('x', xpos)
                        .attr('data-line', tokenline)
                        .attr('data-type', tokentype)
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
        let pointcontainer = vis.append('g').attr('class', 'chart-pointcontainer');
        for (let i = 0; i < datas.length; i++) {
            let path = linecontainer.append('path').attr('d', line(datas[i])).attr('fill', 'none').attr('class', 'chart-data').attr('data-line', i).attr('y', headerHeight);
            if(config.labels){
                path.attr('data-label', encodeURIComponent(config.labels[i]));
            }
            if(config.colors){
                path.attr('stroke', config.colors[i]);
            }
            for (let j = 0; j < datas[i].length; j++) {
                if(config.pointvalue && datas[i][j][config.pointvalue]){
                    let xpos = datas[i][j][config.xvalue];
                    let ypos = datas[i][j][config.yvalue];
                    let circle = pointcontainer.append('circle').attr('r',3).attr('cx', x(xpos)).attr('cy', y(ypos)).attr('data-line', xpos).attr('data-ypos', ypos).attr('title', 'Monologue');
                    if(config.labels){
                        circle.attr('data-label', encodeURIComponent(config.labels[i]));
                    }
                    if(config.colors){
                        circle.style('fill', config.colors[i]);
                    }
                }
            }
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
        var selectionRightFooter = mouseG.append("g").attr("class", "selectionrightfooter").attr("visibility", "collapse");
        var selectionLeftFooter = mouseG.append("g").attr("class", "selectionleftfooter").attr("visibility", "collapse");
        var selectionRightFooterWidth = 0;
        var selectionLeftFooterWidth = 0;
        var mouseGhover = mouseG.append("g").style("opacity", "0");
        mouseGhover.append("text").attr("class", "pageNumber").text("p.1").attr("x", "100%").attr("text-anchor", "end").attr("y", "1em");
        mouseGhover.append("text").attr("class", "currentTime").text("00:00:00").attr("x", "100%").attr("text-anchor", "end").attr("y", "2.25em");
        mouseGhover.append("text").attr("class", "breadcrumbs").text("test").attr("y", "1em");
        mouseGhover.append("text").attr("class", "scene").text("test").attr("y", "2.25em").style("opacity", 0.5);
        selectionRightFooter.append("text").attr("class", "button openineditor").attr("title", "Select in editor").html("&#xeae9").attr('y', height - footerHeight + 24).on('click', function () {
            if (config.revealSelection && brush.extent()) {
                config.revealSelection(x.invert(brushSelection[0]), x.invert(brushSelection[1]));
            }
            //select code in editor
        }).append("title").text("Select in Editor");
        selectionRightFooterWidth += 16; //width of button
        selectionRightFooterWidth += 8; //added margin between buttons

        var rightbuttonsWidth = 48;
        var leftbuttonsWidth = 0;
        selectionRightFooter.append("text").attr("class", "button zoom").html("&#xeb81").attr('y', height - footerHeight + 24).attr('x', selectionRightFooterWidth).on('click', zoomChart).append("title").text("Zoom In");
        selectionRightFooterWidth += 16; //width of button
        selectionRightFooterWidth += 8; //added margin between buttons


        var rightbuttons = mouseG.append("g").attr("class", "rightbuttons");
        var selectionhtml = mouseG.append("g").attr("class", "selectionhtml");

        let magnetbtn = rightbuttons.append("text").attr("class", "button rightbutton snap").html("&#xebae").attr('y', height - footerHeight + 24).attr('x', width - 24).append("title").text("Grid snapping").on("click", function () {
            console.log("Clicked on snap thing");
        });

        var snapMenu = $.contextMenu({
            selector: ".button.rightbutton.snap",
            trigger: "left",
            position: function(opt, x, y){
                opt.$menu.position({ my: "right top+24", at: "right bottom", of: opt.$trigger})
            },
            build: function ($trigger, e) {
                return {
                    callback: function (key, options) {
                        var m = "clicked: " + key;
                    },
                    items: {
                        freeSelection: {
                            name: "Free Selection",
                            selected: uipersistence.chartFreeSelection,
                            updateOnClick: true,
                            settingskey: "chartFreeSelection",
                            type: "check",
                            callback: function () {
                                console.log("called back!");
                                calculateStructurePositions();
                                return false;
                            }
                        },
                        snapToSection1: {
                            name: "Snap to # section",
                            selected: uipersistence.chartSnapToSection1,
                            settingskey: "chartSnapToSection1",
                            type: "check",
                            disabled: () => uipersistence.chartFreeSelection,
                            callback: function () {
                                console.log("called back!");
                                calculateStructurePositions();
                                return false;
                            }
                        },
                        snapToSection2: {
                            name: "Snap to ## section",
                            selected: uipersistence.chartSnapToSection2,
                            settingskey: "chartSnapToSection2",
                            type: "check",
                            disabled: () => uipersistence.chartFreeSelection,
                            callback: function () {
                                console.log("called back!");
                                calculateStructurePositions();
                                return false;
                            }
                        },
                        snapToSection3: {
                            name: "Snap to ###+ section",
                            selected: uipersistence.chartSnapToSection3,
                            settingskey: "chartSnapToSection3",
                            type: "check",
                            disabled: () => uipersistence.chartFreeSelection,
                            callback: function () {
                                console.log("called back!");
                                calculateStructurePositions();
                                return false;
                            }
                        },
                        snapToScene: {
                            name: "Snap to scenes",
                            selected: uipersistence.chartSnapToScene,
                            settingskey: "chartSnapToScene",
                            type: "check",
                            disabled: () => uipersistence.chartFreeSelection,
                            callback: function () {
                                console.log("called back!");
                                calculateStructurePositions();
                            }
                        },
                    }
                }
            },
        });

        rightbuttons.append("text").attr("class", "button rightbutton unzoom").html("&#xeb82").attr('y', height - footerHeight + 24).attr('x', width - 48).attr("visibility", "collapse").on('click', function () {
            x.domain([0, longestData - 1])
            y.domain([min, max]);
            vis.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            vis.selectAll('.chart-data').each(function (d, i) {
                d3.select(this).transition().ease(d3.easeCubic).duration(500).attr('d', line(datas[i]));
            });
            rightbuttons.select(".unzoom").attr("visibility", "collapse");
            rightbuttons.select(".buttonseperator").attr('x', width - (48)).attr("visibility", "collapse");
            repositionStructure(true);
            positionSelection(true);
            positionCaret(true);
            positionPoints(true);
            rightbuttonsWidth = 48;
        }).append("title").text("Zoom Out");
        rightbuttons.append("rect").attr("class", "buttonseperator rightbutton").attr('y', height - footerHeight + 24 - 14).attr('x', width - (48)).attr('height', 14).attr('width', 1).attr("visibility", "collapse");

        mouseG.append("rect") // this is the vertical line to follow the mouse
            .attr("class", "mouse-line")
            .attr("width", "1px")
            .attr("y", headerHeight)
            .attr("height", innerHeight)
            .style("opacity", "0");

        mouseG.append("rect") // this is the vertical line to follow the caret in the document
            .attr("class", "caret-line")
            .attr("width", "1px")
            .attr("y", headerHeight)
            .attr("height", innerHeight)
            .style("opacity", "1");

        ///
        /// BRUSHING
        ///

        var idleTimeout

        function idled() {
            idleTimeout = null;
        }

        let buttonsize = 22;
        let selectionExists = false;
        let brush = d3.brushX().extent([
                [0, headerHeight],
                [width, height - footerHeight]
            ])
            .on('brush', function () {
                let extent = d3.event.selection;
                if (extent) {
                    if (d3.event.sourceEvent.type !== "brush" && !uipersistence.chartFreeSelection) {
                        const d0 = d3.event.selection.map(x.invert);
                        console.log("selected [" + extent[0] + ", " + extent[1] + "]")
                        let snappedX0 = structurePositions[d3.bisectLeft(structurePositions, extent[0])];
                        let snappedX1 = structurePositions[d3.bisectLeft(structurePositions, extent[1])];
                        console.log("snap to [" + snappedX0 + ", " + snappedX1 + "]")
                        d3.select(this).call(brush.move, [snappedX0, snappedX1]);
                        extent[0] = snappedX0;
                        extent[1] = snappedX1;
                    }
                    if (!extent[0] && !extent[1]) return;
                    let invertedExtent0 = x.invert(extent[0]);
                    let invertedExtent1 = x.invert(extent[1]);
                    let vals = hover(invertedExtent0, invertedExtent1);
                    let rightoffset = 0;

                    let selectionLeftFooterContent = "";
                    let selectionLeftFooterWidth
                    if (config.selectionSvg) {
                        let selectionSvg = config.selectionSvg(vals);
                        selectionLeftFooterWidth = selectionSvg.width;
                        selectionLeftFooter.html(selectionSvg.svg)
                    }
                    selectionRightFooter.attr("transform", `translate(${extent[1] - rightoffset - selectionRightFooterWidth},0)`);
                    selectionRightFooter.attr("visibility", "visible");
                    selectionLeftFooter.attr("visibility", "visible");

                    let rightfooterX = 0;
                    let leftfooterX = 0;
                    let generaloffset = 0;

                    let maximumPosition = width - rightbuttonsWidth;
                    let minimumPosition = leftbuttonsWidth;

                    let selectFooterWidth = selectionRightFooterWidth + selectionLeftFooterWidth;
                    let selectionWidth = extent[1] - extent[0];

                    if (selectFooterWidth > selectionWidth) {
                        //the width of the buttons is bigger than the width of the selection: center the buttons below the selection
                        let selectionCenter = extent[0] + ((extent[1] - extent[0]) / 2);
                        rightfooterX = selectionCenter + selectionLeftFooterWidth - (selectFooterWidth / 2);
                        if (rightfooterX + selectionRightFooterWidth > maximumPosition) {
                            //too far right
                            rightfooterX = rightfooterX + (maximumPosition - (rightfooterX + selectionRightFooterWidth));
                            rightbuttons.select(".buttonseperator").attr('visibility', "visible");
                        } else {
                            rightbuttons.select(".buttonseperator").attr('visibility', "collapse");
                        }

                        if (rightfooterX - selectionLeftFooterWidth < minimumPosition) {
                            //too far left
                            rightfooterX = rightfooterX + (minimumPosition - (rightfooterX - selectionLeftFooterWidth));
                        }

                        leftfooterX = rightfooterX - selectionLeftFooterWidth;
                        iscentered = true;
                    } else {
                        leftfooterX = extent[0];
                        rightfooterX = extent[1] - selectionRightFooterWidth;
                        if (rightfooterX + selectionRightFooterWidth > maximumPosition) {
                            //too far right
                            rightfooterX = rightfooterX + (maximumPosition - (rightfooterX + selectionRightFooterWidth));
                            if (rightfooterX - selectionLeftFooterWidth < extent[0])
                                leftfooterX = rightfooterX - selectionLeftFooterWidth;
                            rightbuttons.select(".buttonseperator").attr('visibility', "visible");
                        } else {
                            rightbuttons.select(".buttonseperator").attr('visibility', "collapse");
                        }
                        if (leftfooterX < minimumPosition) {
                            //too far left
                            leftfooterX = minimumPosition;
                            if (leftfooterX + selectionLeftFooterWidth > rightfooterX) {
                                rightfooterX = leftfooterX + selectionLeftFooterWidth;
                            }
                        }
                        //the buttons can all fit in the selection area without being center-aligned
                    }
                    selectionRightFooter.attr("transform", `translate(${rightfooterX},0)`).attr("visibility", "visible");;
                    selectionLeftFooter.attr("transform", `translate(${leftfooterX},${height-footerHeight+16})`).attr("visibility", "visible");

                    //buttons.each(function (d, i) {
                    //    d3.select(this).attr("visibility", "visible").attr("x", );
                    //});
                    let pageextent0 = config.map.get(Math.floor(x.invert(extent[0])).toString());
                    let pageextent1 = config.map.get(Math.floor(x.invert(extent[1])).toString());
                    let pageextentstr = "";
                    if (pageextent0 && pageextent1)
                        pageextentstr = pageextent0.page + "-" + pageextent1.page;
                    mouseG.select(".pageNumber").text("p." + pageextentstr);
                    mouseG.select(".currentTime").text(secondsToString(pageextent0 ? pageextent0.cumulativeDuration : 0)+"-"+secondsToString(pageextent1 ? pageextent1.cumulativeDuration : 0));
                    mouseG.select(".scene").text("");
                    mouseG.select(".breadcrumbs").html("");
                } else {
                    selectionExists = false;
                }
            })
            .on('end', function () {
                let extent = d3.event.selection;
                brushSelection = extent;
                if (!extent) {
                    selectionRightFooter.attr("visibility", "collapse");
                    selectionLeftFooter.attr("visibility", "collapse");
                    rightbuttons.select(".buttonseperator").attr('visibility', "collapse");
                }
                return;

            })
            .on('start', function () {
                selectionExists = true;
            });
        vis.append("g").attr("class", "brush").call(brush)

        vis.select(".brush > .overlay").on('mouseout', mouseout)
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('dblclick', doubleclick)


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

        function doubleclick() {
            var mouse = d3.mouse(this);
            if (config.revealLine)
                config.revealLine(x.invert(mouse[0]));
        }

        function mouseout() {
            vis.select(".mouse-line").style("opacity", "0");
            mouseGhover.style("opacity", "0");
        }

        function mouseover() {
            vis.select(".mouse-line").style("opacity", "1");
            mouseGhover.style("opacity", "1");
        }

        function mousemove() {
            var mouse = d3.mouse(this);
            vis.select(".mouse-line")
                .attr('x', mouse[0]);
            hover(x.invert(mouse[0]));
        }

        function hover(xval, xval2) {
            let values = [];
            vis.selectAll('.chart-data').each(function (d, i) {
                if (xval2)
                    values.push([bisect(xval, i), bisect(xval2, i)]);
                else
                    values.push(bisect(xval, i));
            });
            if (config.map) {
                let lineNb = Math.floor(xval).toString();
                if (config.map.has(lineNb)) {
                    let lineinfo = config.map.get(lineNb);
                    mouseG.select(".pageNumber").text("p." + lineinfo.page);
                    mouseG.select(".currentTime").text(secondsToString(lineinfo.cumulativeDuration));
                    mouseG.select(".scene").text(lineinfo.scene);
                    mouseG.select(".breadcrumbs").html(lineinfo.sections.join("<tspan class='chevron' alignment-baseline='middle'>&#xeab6</tspan>"));
                }
            }
            return values;
        }

        function bisect(xval, lineindex) {
            let data = datas[lineindex];
            if(!data) return 0;
            const bisect = d3.bisector(d => d[config.xvalue]).left;
            const index = bisect(data, xval, 1);
            const a = data[index - 1];
            const b = data[index];
            if (b && (xval - a[config.xvalue] > b[config.xvalue] - xval)) {
                b.index = index;
                return b;
            } else {
                a.index = index - 1;
                return a;
            }
        }

        function resize(e) {
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
            ]);
            vis.select('.brush').call(brush).call(brush.move, null);
            vis.selectAll('.rightbutton').each(function (d, i) {
                d3.select(this).attr('x', width - 24 * (i + 1));
            });
            vis.select(".buttonseperator.rightbutton").attr('x', width-48);
            rightbuttons.select(".unzoom").attr("visibility", "collapse");
            positionPoints()
            positionSelection();
            positionCaret();
        };

        function repositionStructure(transition) {
            structurePositions = [0];
            structurecontainer.selectAll('rect').each(function (d, i) {
                let structline = d3.select(this);
                let xpos = x(structline.attr('data-line'));
                switch (structline.attr('data-type')) {
                    case 'section1':
                        if (uipersistence.chartSnapToSection1) structurePositions.push(xpos);
                        break;
                    case 'section2':
                        if (uipersistence.chartSnapToSection2) structurePositions.push(xpos);
                        break;
                    case 'section3':
                        if (uipersistence.chartSnapToSection3) structurePositions.push(xpos);
                        break;
                    case 'scene':
                        if (uipersistence.chartSnapToScene) structurePositions.push(xpos);
                }
                if (transition)
                    structline.transition().duration(500).ease(d3.easeCubic).attr('x', x(structline.attr('data-line')));
                else
                    structline.attr('x', x(structline.attr('data-line')));
            });
            structurePositions.push(width);
        }

        var caretline = 0;
        var selectionstart = 0;
        var selectionend = 0;
        function zoomChart() {
            let xstart = x.invert(brushSelection[0]);
            let xend = x.invert(brushSelection[1])
            x.domain([xstart, xend])
            vis.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            let ymins = [];
            let ymaxs = [];
            for (let i = 0; i < datas.length; i++) {
                let sliced = datas[i].slice(bisect(xstart, i).index, bisect(xend, i).index+1);
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
            positionSelection(true);
            positionCaret(true);
            positionPoints(true);
        }

        function positionSelection(animate){
            let linestartX = x(selectionstart);
            let lineendX = x(selectionend);
            if(animate)
                vis.select(".selection-box").transition().ease(d3.easeCubic).duration(500).attr('x', linestartX).attr('width', lineendX-linestartX);
            else
                vis.select(".selection-box").attr('x', linestartX).attr('width', lineendX-linestartX);
        }
        function positionPoints(animate){
            pointcontainer.selectAll('circle').each(function(d,i){
                let point = d3.select(this);
                let xpos = x(point.attr('data-line'));
                console.log("new xpos="+xpos);
                let ypos = y(point.attr('data-ypos'));
                if(animate){
                    point.transition().ease(d3.easeCubic).duration(500).attr('cx', xpos).attr('cy', ypos);
                }
                else{
                    point.attr('cx', xpos);
                    point.attr('cy', ypos);
                }

            })
        }
        function positionCaret(animate){
            if(animate){
                mouseG.select(".caret-line").transition().ease(d3.easeCubic).duration(500).attr('x',x(caretline))
            }
            else{
                mouseG.select(".caret-line").attr('x', x(caretline));
            }
        }

        return{
            updatecaret:function(line){
                caretline = line;
                positionCaret();
            },
            updateselection:function(start,end){
                selectionstart = start;
                selectionend = end;
                positionSelection();
            },
            resize:resize
        }
    };

    return plugin;
});