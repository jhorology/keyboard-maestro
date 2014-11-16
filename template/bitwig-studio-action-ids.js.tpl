(function(root) {
    'use strict';
    root.KeyboardMaestro || (root.KeyboardMaestro = {});
    root.KeyboardMaestro.ActionVersion = '<%= hostVersion %>';
    root.KeyboardMaestro.ActionIds = [
<%
            print(_.map(actions, function(action) {
                return '\t\t\'' + action.id + '\'';
            }).join(',\n'));
%>
    ];
}(this));
