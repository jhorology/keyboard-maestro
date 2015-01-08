[Keyboard Maestro](http://www.keyboardmaestro.com/main/) macro library and controller script for [Bitwig Studio](http://www.bitwig.com/en/bitwig-studio/overview.html).


### Install Macro Library
- [BitwigStudioActions.kmlibrary](dist)

import via "Import to Macro Library" menu in Keybord Maestro Editor.


### Install Controller Script
- [Keyboard Maestro.control.js](dist)

put into

OS| Location
:---|:---|:---|
Mac| ~/Documents/Bitwig Studio/Controller Scripts/Stairways Software

### Build
```
    npm install
    gulp
```

### Update Procedure
This macro library and controller script depends on Bitwig Studio Version.

- send CC message(CC# 0, ch.16) from Keyboard Maestro.
- copy JSON string from Script Console.
- beautify JOSN at [here](http://archive.dojotoolkit.org/nightly/checkout/dojox/gfx/demos/beautify.html). - (optional)
- create JSON file. actions/bitwig-studio-actions-${version}.json
- modify settings section in gulpfile.coffee.
```
    json: 'bitwig-studio-actions-${version}.json'
```
- install controller script and macro library.
```
    gulp deploy
```
- delete 'Bitwig Actions' group in Keybord Maestro Editor.
- open Macro Library Window, and then select & insert 'BitwigStudioActions'.

### Example macro
[Here](example) are some example of how to use library.

- Bitwig Studio - Channel Strip.kmmacros  - [Option + T] to activate/deactivate macro.
- Bitwig Studio - Device.kmmacros  - [Option + D] to activate/deactivate macro.
