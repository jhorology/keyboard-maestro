exports.version = '<%= hostVersion %>';
exports.ids = [
<%
    print(_.map(actions, function(action) {
        return '\t\t\'' + action.id + '\'';
    }).join(',\n'));
%>
];
