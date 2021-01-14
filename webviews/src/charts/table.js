define(function (require) {

    var plugin = {};

    plugin.render = function(id, options){
        let defaults = {
            language: {
                search: "",
                searchPlaceholder: "Search",
                info:"Showing _START_ to _END_ of _TOTAL_ characters",
                lengthMenu:"Show _MENU_ characters",
                zeroRecords:"No matching characters found",
                paginate: {
                    next:"&nbsp;Next",
                    previous:"Previous&nbsp;"
                }
              },
              order:[[1, "asc"]],
              lengthChange: false,
              pageLength:10,
              dom:`<'charttable length'>f<'charttable morebtn'>rtpi`,
        }
        //Merge the defaults with the provided options
        let datatable = $(id).DataTable(Object.assign(defaults, options));
        
        let SELECTOR_LENGTHMENU = `${id}_wrapper .charttable.length`;
        let SELECTOR_LENGTHPICKER = `${id}_wrapper .visiblecharsdd`;
        let SELECTOR_MORE = `${id}_wrapper .charttable.morebtn`;
        let SELECTOR_MOREBTN = `${id}_wrapper .chartableoptsdd`;

        $(SELECTOR_LENGTHMENU).html('<div class="chartinfo">Show<a class="hyperbtn visiblecharsdd" href="#">&nbsp;<span>10</span><i class="codicon codicon-chevron-down" style="vertical-align: bottom;"></i></a>&nbsp;characters</div>');
        $(SELECTOR_MORE).html('<a class="smallbtn chartableoptsdd" style="text-align: center;float: right;height: 24px;line-height: 24px;" href="#"><i class="codicon codicon-ellipsis"></></a>');
        
        function showItemsGenerator(amount){
            return {
                name: amount.toString(),
                selected: datatable.page.len() == amount,
                updateOnClick: true,
                type: "check",
                hideonclick:true,
                callback: function () {
                    datatable.page.len(amount).draw();
                    $(SELECTOR_LENGTHPICKER).find("span").text(amount);
                }
            }
        }
        function buttonGenerator(columname, btn){
            return {
                name: columname,
                callback: function(){
                    let act = datatable.button(btn).action();
                    console.log(act);
                }
            }
        }
        var tableoptionsDropDown = $.contextMenu({
            selector: SELECTOR_MORE,
            trigger: "left",
            hideOnSecondTrigger:true,
            position: function(opt, x, y){
                opt.$menu.position({ my: "right top", at: "right bottom", of: SELECTOR_MOREBTN})
            },
            build: function ($trigger, e) {
                let items = {};
                for(let column of options.columns){
                    items[column.name] = {
                        name: column.title,
                        selected: function() { return datatable.column(column.name+":name").visible() },
                        updateOnClick: true,
                        type: "check",
                        disabled: column.alwaysvisible,
                        hideonclick:false,
                        callbackBefore: function(){
                            datatable.column(column.name+":name").visible(!datatable.column(column.name+":name").visible());
                        }
                    }
                }
                return { items };
            },
        });
        
        var visibleItemsDropDown = $.contextMenu({
            selector: SELECTOR_LENGTHPICKER,
            trigger: "left",
            hideOnSecondTrigger:true,
            position: function(opt, x, y){
                opt.$menu.position({ my: "left top", at: "left-23 top+24", of: opt.$trigger});
            },
            build: function ($trigger, e) {
                console.log("building items");
                return {
                    items: {
                        show5:showItemsGenerator(5),
                        show10:showItemsGenerator(10),
                        show20:showItemsGenerator(20),
                        show40:showItemsGenerator(40),
                        show80:showItemsGenerator(80),
                        show160:showItemsGenerator(160)
                    }
                }
            },
        });
        return datatable;
    }
    return plugin;
});

