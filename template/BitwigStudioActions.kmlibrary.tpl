<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Author</key>
    <string>jhorology &lt;jhorology2014@gmail.com&gt;</string>
    <key>AuthorURL</key>
    <string>https://github.com/jhorology/keyboard-maestro</string>
    <key>CanDragToMacroGroup</key>
    <true/>
    <key>Category1</key>
    <string>Interface Control</string>
    <key>Category2</key>
    <string>Application Control</string>
    <key>Description</key>
    <string></string>
    <key>Items</key>
    <array>
      <% _.forEach(actions, function(action) { %>
      <dict>
        <key>Activate</key>
        <string>AlwaysWithPalette</string>
        <key>AddToMacroPalette</key>
        <true/>
        <key>AddToStatusMenu</key>
        <false/>
        <key>IsActive</key>
        <true/>
        <key>KeyCode</key>
        <integer>32767</integer>
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
            <key>CustomIconData</key>
            <string>KMEP-GenericApplication-/Applications/Bitwig Studio.app</string>
            <key>IsActive</key>
            <true/>
            <key>ModificationDate</key>
            <real>440732432.86673301</real>
            <key>Name</key>
            <string><%= action.category %> - <%= action.id %></string>
            <key>Triggers</key>
            <array/>
            <key>UID</key>
            <string><%= action.uuid %></string>
          </dict>
        </array>
        <key>Modifiers</key>
        <integer>0</integer>
        <key>Name</key>
        <string>Bitwig Actions</string>
        <key>Targeting</key>
        <dict>
          <key>Targeting</key>
          <string>Included</string>
          <key>TargetingApps</key>
          <array>
            <dict>
              <key>BundleIdentifier</key>
              <string>com.bitwig.studio</string>
              <key>Name</key>
              <string>Bitwig Studio</string>
              <key>NewFile</key>
              <string>/Applications/Bitwig Studio.app</string>
            </dict>
          </array>
        </dict>
      </dict>
      <% }); %>
      <dict>
        <key>Activate</key>
        <string>AlwaysWithPalette</string>
        <key>AddToMacroPalette</key>
        <true/>
        <key>AddToStatusMenu</key>
        <false/>
        <key>IsActive</key>
        <true/>
        <key>KeyCode</key>
        <integer>32767</integer>
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
                <false/>
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
            <real>437842817.06119698</real>
            <key>Name</key>
            <string>Utility - Print JSON in Console</string>
            <key>Triggers</key>
            <array/>
            <key>UID</key>
            <string>BDD72774-2346-4A9F-8658-776A0E207A58</string>
          </dict>
        </array>
        <key>Modifiers</key>
        <integer>0</integer>
        <key>Name</key>
        <string>Bitwig Actions</string>
        <key>Targeting</key>
        <dict>
          <key>Targeting</key>
          <string>Included</string>
          <key>TargetingApps</key>
          <array>
            <dict>
              <key>BundleIdentifier</key>
              <string>com.bitwig.studio</string>
              <key>Name</key>
              <string>Bitwig Studio</string>
              <key>NewFile</key>
              <string>/Applications/Bitwig Studio.app</string>
            </dict>
          </array>
        </dict>
        <key>UID</key>
        <string>30651478-0D07-4947-88B5-87994C91A719</string>
      </dict>
    </array>
    <key>UID</key>
    <string>D9C2F3ED-3ED8-4A70-93C8-7BD2604825B4</string>
  </dict>
</plist>
