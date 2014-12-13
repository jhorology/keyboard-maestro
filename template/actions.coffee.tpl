exports.version = '<%= hostVersion %>'
exports.ids = [
<%
    print(_.map(actions, function(action) {
        return '    \'' + action.id + '\'';
    }).join('\n'));
%>
]
