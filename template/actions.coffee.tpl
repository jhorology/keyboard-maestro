exports.version = '<%= hostVersion %>'
exports.ids = [
<% _.forEach(_.filter(actions,function(action){return action.on.ch === 1}), function(action) { %>  {
    id: '<%= action.id%>'
    uuid: '<%= action.uuid%>'
  }
<% }); %>
]
exports.extended_ids = [
<% _.forEach(_.filter(actions,function(action){return action.on.ch === 2}), function(action) { %>  {
    id: '<%= action.id%>'
    uuid: '<%= action.uuid%>'
  }
<% }); %>
]
