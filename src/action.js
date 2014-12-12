var bitwig = require('./bitwig'),
    actions = require('./actions');

module.exports = {
    init: function() {
        var ver = String(bitwig.getHostVersion());
        if (ver !== actions.version) {
            throw new Error('Invalid version. host:[' + ver + ']' + ' actions:[' + actions.version + ']' );
        }
        this.application = bitwig.createApplication();
    },

    midi: function(s, d1, d2) {
        var index = (d1 << 7) + d2;
        if (s=== 0xB0 && index < actions.ids.length) {
            this.application.getAction(actions.ids[index]).invoke();
        }
    }
};
