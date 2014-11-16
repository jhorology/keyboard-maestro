<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
	<key>Author</key>
	<string>jhorology</string>
	<key>AuthorURL</key>
	<string>https://github.com/jhorology/keyboard-maestro</string>
	<key>CanDragToMacroGroup</key>
	<true/>
	<key>Category1</key>
	<string>Interface Control</string>
	<key>Category2</key>
	<string></string>
	<key>Description</key>
	<string>Bitwig Studio <%= hostVersion%> Actions</string>
	<key>Items</key>
	<array>
      <% _.forEach(actions, function(action) { %>
      <dict>
		<key>Activate</key>
		<string>Normal</string>
		<key>IsActive</key>
		<true/>
		<key>Macros</key>
		<array>
		  <dict>
			<key>Actions</key>
			<array>
			  <dict>
				<key>Channel</key>
				<integer><%= action.on.ch %></integer>
				<key>IsActive</key>
				<true/>
				<key>IsDisclosed</key>
				<true/>
				<key>MIDIMessageType</key>
				<string>ControlChange</string>
				<key>MacroActionType</key>
				<string>SendMIDIMessage</string>
				<key>Note</key>
				<integer><%= action.on.cc %></integer>
				<key>Value</key>
				<integer><%= action.on.value %></integer>
			  </dict>
			</array>
			<key>IsActive</key>
			<true/>
			<key>ModificationDate</key>
			<real>437819669.77276301</real>
			<key>Name</key>
			<string><%= action.category %> - <%= action.id %></string>
			<key>Triggers</key>
			<array/>
		  </dict>
		</array>
		<key>Name</key>
		<string>Bitwig Actions</string>
	  </dict>
      <% }); %>
	  <dict>
		<key>Activate</key>
		<string>Normal</string>
		<key>IsActive</key>
		<true/>
		<key>Macros</key>
		<array>
		  <dict>
			<key>Actions</key>
			<array>
			  <dict>
				<key>AllWindows</key>
				<true/>
				<key>AlreadyActivatedActionType</key>
				<string>Normal</string>
				<key>Application</key>
				<dict>
				  <key>BundleIdentifier</key>
				  <string>com.bitwig.studio</string>
				  <key>Name</key>
				  <string>Bitwig Studio</string>
				  <key>NewFile</key>
				  <string>/Applications/Bitwig Studio.app</string>
				</dict>
				<key>IsActive</key>
				<true/>
				<key>IsDisclosed</key>
				<false/>
				<key>MacroActionType</key>
				<string>ActivateApplication</string>
				<key>ReopenWindows</key>
				<false/>
				<key>TimeOutAbortsMacro</key>
				<true/>
			  </dict>
			  <dict>
				<key>Channel</key>
				<integer>16</integer>
				<key>IsActive</key>
				<true/>
				<key>IsDisclosed</key>
				<true/>
				<key>MIDIMessageType</key>
				<string>ControlChange</string>
				<key>MacroActionType</key>
				<string>SendMIDIMessage</string>
				<key>Note</key>
				<integer>0</integer>
				<key>Value</key>
				<integer>0</integer>
			  </dict>
			</array>
			<key>IsActive</key>
			<true/>
			<key>ModificationDate</key>
			<real>437812745.12949598</real>
			<key>Name</key>
			<string>Utility - Print JSON in Console</string>
			<key>Triggers</key>
			<array/>
			<key>UID</key>
			<string>BDD72774-2346-4A9F-8658-776A0E207A58</string>
		  </dict>
		</array>
		<key>Name</key>
		<string>Bitwig Actions</string>
		<key>UID</key>
		<string>F2B13F81-FE79-44AD-BE85-ABCCF9EFEA81</string>
	  </dict>
	</array>
	<key>UID</key>
	<string>336790C2-5DA8-4D78-A395-92FB4C8B4ED1</string>
  </dict>
</plist>
