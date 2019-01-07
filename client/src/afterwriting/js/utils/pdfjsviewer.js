/* global PDFJS */
define(function(require){

    var $ = require('jquery');

    PDFJS.disableWebGL = false;

    var base_zoom = 1.15;

    var viewer = {
        page: 1,
        numPages: 1,
        zoom: base_zoom,
        pdf: null
    };

    viewer.set_container = function(container) {
        viewer.container = container;
    };

    viewer.from_blob = function(blob) {
        var arrayBuffer, uint8array,
            fileReader = new FileReader();

        fileReader.onload = function() {
            arrayBuffer = this.result;
            uint8array = new Uint8Array(arrayBuffer);

            PDFJS.getDocument(uint8array).then(function(pdfFile) {
                viewer.set_pdf(pdfFile);
            }).catch(function(error){
                console.log(error);
            });
        };
        fileReader.readAsArrayBuffer(blob);
    };

    viewer.set_pdf = function(pdf) {
        viewer.pdf = pdf;
        viewer.numPages = pdf.numPages;
        viewer.render();
    };

    viewer.prev = function() {
        viewer.page -= 1;
        if (viewer.page < 1) {
            viewer.page = 0;
        }
        viewer.render();
    };

    viewer.next = function() {
        viewer.page += 1;
        if (viewer.page > viewer.numPages) {
            viewer.page = viewer.numPages;
        }
        viewer.render();
    };

    viewer.zoomin = function() {
        viewer.zoom *= base_zoom;
        viewer.render();
    };

    viewer.zoomout = function() {
        viewer.zoom /= base_zoom;
        viewer.render();
    };

    viewer.render = function() {
        $(viewer.container).empty();

        for (var i=1; i <= viewer.numPages; i++) {

            viewer.pdf.getPage(i).then(function(page) {
                var viewport = page.getViewport(viewer.zoom);

                var pdf_viewer = viewer.container;
                var canvas_container = document.createElement('div');
                canvas_container.style.display = "inline-block";
                canvas_container.style.padding = "2px";
                pdf_viewer.appendChild(canvas_container);

                var canvas = document.createElement('canvas');
                canvas.style.border = "1px solid #777777";
                canvas_container.appendChild(canvas);

                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                context.clearRect(0, 0, canvas.width, canvas.height);
                page.render(renderContext);
            });
        }
    };

    return viewer;
});