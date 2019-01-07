define(function(require) {

    var template = require('text!plugin/stats/view/stats.hbs'),
        $ = require('jquery'),
        helper = require('utils/helper'),
        Header = require('theme/aw-bubble/view/header'),
        Protoplast = require('protoplast'),
        SpiderChart = require('utils/charts/spider'),
        BarChart = require('utils/charts/bar'),
        PieChart = require('utils/charts/pie'),
        PageBalanceChart = require('utils/charts/page_balance'),
        LineChart = require('utils/charts/line'),
        LocationsBreakdown = require('utils/charts/locations_breakdown'),
        SectionViewMixin = require('theme/aw-bubble/view/section-view-mixin'),
        StatsViewPresenter = require('plugin/stats/view/stats-view-presenter'),
        ThemeModel = require('theme/aw-bubble/model/theme-model'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller'),
        BaseComponent = require('core/view/base-component');

    return BaseComponent.extend([SectionViewMixin], {

        $meta: {
            presenter: StatsViewPresenter
        },

        hbs: template,

        themeController: {
            inject: ThemeController
        },

        themeModel: {
            inject: ThemeModel
        },

        $sceneLengthType: null,

        // TODO: Move to presenter? (+)
        settings: {
            inject: 'settings'
        },

        whoWithWhoHeader: {
            component: Header
        },

        scriptPulseHeader: {
            component: Header
        },

        sceneLengthHeader: {
            component: Header
        },

        locationsBreakdownHeader: {
            component: Header
        },

        pageBalanceHeader: {
            component: Header
        },

        daysAndNightsHeader: {
            component: Header
        },

        intVsExtHeader: {
            component: Header
        },

        data: null,

        spiderChart: null,

        barChart: null,

        pieChart: null,

        pageBalanceChart: null,

        lineChart: null,

        locationsBreakdown: null,

        init: function() {
            BaseComponent.init.call(this);

            this.spiderChart = SpiderChart;
            this.barChart = BarChart;
            this.pieChart = PieChart;
            this.pageBalanceChart = PageBalanceChart;
            this.lineChart = LineChart;
            this.locationsBreakdown = LocationsBreakdown;

            this.whoWithWhoHeader.id = "stats-who";
            this.whoWithWhoHeader.title = "Who talks with whom (by number of scenes)";
            this.whoWithWhoHeader.description = "Each character is represented by a circle (max. 10 characters). If characters are connected with a line that means they are talking in the same scene. Thicker the line - more scenes together. Hover the mouse cursor over a character circle to see how many dialogues scenes that character have with other characters.";

            this.scriptPulseHeader.id = "stats-tempo";
            this.scriptPulseHeader.title = "Script Pulse";
            this.scriptPulseHeader.description = "Short scenes and short action/dialogue blocks bump the tempo up. Long scenes and long blocks set it back.";

            this.sceneLengthHeader.id = "stats-scene-length";
            this.sceneLengthHeader.title = "Scene length";
            this.sceneLengthHeader.description = "Each bar represent one scene (white bars for day scenes, black bars for night scenes). Hover the mouse cursor over a bar to see estimated time of a scene. You can click on a bar to jump to selected scene in the editor.";

            this.locationsBreakdown.id = "stats-locations-breakdown";
            this.locationsBreakdownHeader.title = "Locations breakdown";
            this.locationsBreakdownHeader.description = "Blocks on the top strip represent amount of time spent in a location. If a location occurs more than once in the script, it's highlighted by a colour (white colour is used for each location occurring only once).<br />Pie chart below shows time distribution for each location. Mouse over the blocks to see corresponding data on the pie chart (and vice versa).";

            this.pageBalanceHeader.id = "stats-page-balance";
            this.pageBalanceHeader.title = "Page balance";
            this.pageBalanceHeader.description = "Shows balance between action time and dialogue time on each page. Click on a page to jump to the editor.";

            this.daysAndNightsHeader.id = "stats-days-nights";
            this.daysAndNightsHeader.title = "Days and nights";
            this.daysAndNightsHeader.description = "Pie chart representing day vs night scenes breakdown. Hover over sections to see number of day/night scenes.";

            this.intVsExtHeader.id = "stats-int-ext";
            this.intVsExtHeader.title = "INT. vs EXT.";
            this.intVsExtHeader.description = "Pie chart representing interior vs exterior scenes breakdown. Hover over sections to see number of int/ext scenes.";
        },

        addBindings: function() {
            Protoplast.utils.bind(this, 'data', this._render);
        },

        addInteractions: function() {
            var themeModel = this.themeModel;

            this.$sceneLengthType.on('change', this._render);

            Protoplast.utils.bind(themeModel, 'expanded', function() {
                if (this.active) {
                    this._render();
                }
            }.bind(this));
        },
        
        refresh: function() {
            // TODO: Remove refresh method, chart should refresh when parent content changes (+)
            // Timeout is added to make sure _render is called after content is fully expanded/collapsed
            // as chart components rely on query ".content" to calculate width of the chart
            setTimeout(function() {
                this._render();
            }.bind(this), 0);
        },

        _render: function() {

            var themeController = this.themeController;
            var themeModel = this.themeModel;

            if (!this.data) {
                return;
            }

            this.spiderChart.render('#who-with-who', this.data.who_with_who.characters, this.data.who_with_who.links, {
                label: 'name'
            });

            this.barChart.render('#stats-scene-length', this.data.scenes, {
                tooltip: function(d) {
                    return d.header + ' (time: ' + helper.format_time((d.length / this.settings.print.lines_per_page)) + ')';
                }.bind(this),
                value: 'length',
                small: themeModel.small,
                show_tooltip: themeController.showTooltip.bind(themeController),
                hide_tooltip: themeController.hideTooltip.bind(themeController),
                move_tooltip: themeController.moveTooltip.bind(themeController),
                color: function(d) {
                    if (this.$sceneLengthType.val() === "int_ext") {
                        if (d.location_type === 'mixed') {
                            return '#777777';
                        } else if (d.location_type === 'int') {
                            return '#eeeeee';
                        } else if (d.location_type === 'ext') {
                            return '#111111';
                        } else if (d.location_type === 'other') {
                            return '#444444';
                        }
                    }

                    if (d.type == 'day') {
                        return '#eeeeee';
                    } else if (d.type == 'night') {
                        return '#222222';
                    } else {
                        return '#777777';
                    }
                }.bind(this),
                bar_click: function(d) {
                    if (!themeModel.small) {
                        this._goto(d.token.line);
                    }
                }.bind(this)
            });

            this.pieChart.render('#stats-days-and-nights', this.data.days_and_nights, {
                tooltip: function(d) {
                    return d.data.label + ': ' + d.data.value + (d.data.value == 1 ? ' scene' : ' scenes');
                },
                value: 'value',
                small: themeModel.small,
                show_tooltip: themeController.showTooltip.bind(themeController),
                hide_tooltip: themeController.hideTooltip.bind(themeController),
                move_tooltip: themeController.moveTooltip.bind(themeController),
                color: function(d) {
                    if (d.data.label == 'DAY') {
                        return '#eeeeee';
                    } else if (d.data.label == 'NIGHT') {
                        return '#222222';
                    } else if (d.data.label == 'DAWN') {
                        return '#777777';
                    } else if (d.data.label == 'DUSK') {
                        return '#444444';
                    } else {
                        return '#aaaaaa';
                    }
                }
            });

            var int_ext_labels = {
                int: 'INT.',
                ext: 'EXT.',
                mixed: 'INT./EXT.',
                other: 'OTHER'
            };

            this.pieChart.render('#stats-int-ext', this.data.int_and_ext, {
                tooltip: function(d) {
                    return int_ext_labels[d.data.label] + ': ' + d.data.value + (d.data.value == 1 ? ' scene' : ' scenes');
                },
                value: 'value',
                small: themeModel.small,
                show_tooltip: themeController.showTooltip.bind(themeController),
                hide_tooltip: themeController.hideTooltip.bind(themeController),
                move_tooltip: themeController.moveTooltip.bind(themeController),
                color: function(d) {
                    if (d.data.label == 'mixed') {
                        return '#777777';
                    } else if (d.data.label == 'int') {
                        return '#eeeeee';
                    } else if (d.data.label == 'ext') {
                        return '#111111';
                    } else if (d.data.label == 'other') {
                        return '#444444';
                    }
                }
            });

            this.pageBalanceChart.render('#stats-page-balance', this.data.page_balance, {
                page_click: function(d) {
                    if (!themeModel.small) {
                        this._goto(d.first_line.token.line);
                    }
                }.bind(this),
                small: themeModel.small,
                show_tooltip: themeController.showTooltip.bind(themeController),
                hide_tooltip: themeController.hideTooltip.bind(themeController),
                move_tooltip: themeController.moveTooltip.bind(themeController)
            });

            this.lineChart.render('#stats-tempo', this.data.tempo, {
                value: 'tempo',
                small: themeModel.small,
                show_tooltip: themeController.showTooltip.bind(themeController),
                hide_tooltip: themeController.hideTooltip.bind(themeController),
                move_tooltip: themeController.moveTooltip.bind(themeController),
                tooltip: function(d, i) {
                    if (i === this.data.tempo.length - 1) {
                        return '';
                    }
                    return d.scene + '<br />...' + d.line + '... ';
                }.bind(this),
                click: function(d) {
                    if (!themeModel.small) {
                        this._goto(d.line_no);
                    }
                }.bind(this)
            });

            this.locationsBreakdown.render('#locations-breakdown', this.data.locationsBreakdown, {
                small: themeModel.small,
                show_tooltip: themeController.showTooltip.bind(themeController),
                hide_tooltip: themeController.hideTooltip.bind(themeController),
                move_tooltip: themeController.moveTooltip.bind(themeController)
            });

        },

        _goto: function(position) {
            this.dispatch('goto', position);
        }

    });

});
