define(function() {

    var RealFileReader = FileReader,
        realSetInterval = sinon.timers.setInterval.bind(window),
        realClearInterval = sinon.timers.clearInterval.bind(window);

    /**
     * A mock for a FileReader intended to use with acceptance tests
     * When writing an acceptance test you may face the issue where you have to write a step that
     * waits for the FileReader before proceeding to the next step. You may use setTimeout with 
     * delay that is long enough to process the file or use this helper. Run SinonFileReader.setup() 
     * before the test and SinonFileReader.restore() after. To implement a step that waits for all
     * the FileReaders to be processed run SinonFileReader.wait(final_callback)
     * 
     * @constructor
     */
    var SinonFileReader = function() {
        this.processing = false;
        SinonFileReader.readers.push(this);
    };

    /**
     * List of all mocked readers
     * @type {FileReader}
     */
    SinonFileReader.readers = [];

    /**
     * Replace FileReader class
     */
    SinonFileReader.setup = function() {
        window.FileReader = SinonFileReader;
        SinonFileReader.readers = [];
    };

    /**
     * Restore real FileReader
     */
    SinonFileReader.restore = function() {
        window.FileReader = RealFileReader;
        SinonFileReader.readers = [];
    };

    /**
     * True if the reader is still processing a file
     * @type {boolean}
     */
    SinonFileReader.prototype.processing = false;

    /**
     * ReadAsText decorator
     * @param {Blob} blob
     */
    SinonFileReader.prototype.readAsText = function(blob) {
        this.processing = true;
        var realReader = new RealFileReader();
        realReader.onload = function() {
            this.processing = false;
            this.onload.apply(realReader, arguments);
        }.bind(this);
        return realReader.readAsText(blob);
    };

    /**
     * readAsArrayBuffer decorator
     * @param {Blob} blob
     */
    SinonFileReader.prototype.readAsArrayBuffer = function(blob) {
        this.processing = true;
        var realReader = new RealFileReader();
        realReader.onload = function() {
            this.processing = false;
            this.onload.apply(realReader, arguments);
        }.bind(this);
        return realReader.readAsArrayBuffer(blob);
    };

    /**
     * True if there's any processing FileReader
     * @returns {boolean}
     */
    SinonFileReader.processingReaders = function() {
        return SinonFileReader.readers.some(function(reader) {
            return reader.processing;
        });
    };

    /**
     * Waits for the all readers to finish processing the files
     * @param {Function} done
     */
    SinonFileReader.wait = function(done) {
        var tries = 0, interval;

        if (SinonFileReader.processingReaders()) {
            interval = realSetInterval(function() {
                if (tries === 100) {
                    realClearInterval(interval);
                    console.warn("FileReader timeout");
                    done();
                }
                else if (!SinonFileReader.processingReaders()) {
                    realClearInterval(interval);
                    done();
                }
            }.bind(this), 10);
        }
        else {
            done();
        }
    };

    return SinonFileReader;

});