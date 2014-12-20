exports.version = '<%= hostVersion %>'
exports.ids = [
<%
    print(_.map(_.filter(actions,function(action){return action.on.ch === 1}), function(action) {
        return '    \'' + action.id + '\'';
    }).join('\n'));
%>
]
