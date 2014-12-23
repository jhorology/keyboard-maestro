exports.version = '<%= hostVersion %>'
exports.ids =
<% _.forEach(_.filter(actions,function(action){return action.on.ch === 1}), function(action) { %>  '<%= action.id%>': '<%= action.uuid%>'
<% }); %>

exports.extended_ids =
<% _.forEach(_.filter(actions,function(action){return action.on.ch === 2}), function(action) { %> '<%= action.id%>': '<%= action.uuid%>'
<% }); %>
