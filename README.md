[Keyboard Maestro](http://www.keyboardmaestro.com/main/) macro library and controller script for [Bitwig Studio](http://www.bitwig.com/en/bitwig-studio/overview.html).


### Install Macro Library
- [BitwigStudioActions.kmlibrary](BitwigStudioActions.kmlibrary)

import via "Import to Macro Library" menu in Keybord Maestro Editor.


### Install Controller Script
- [Keyboard Maestro.control.js](Keyboard Maestro.control.js)
<br/>or
- [Keyboard Maestro.min.control.js](Keyboard Maestro.min.control.js) (minified script)

put into

OS| Location
:---|:---|:---|
Mac| ~/Documents/Bitwig Studio/Controller Scripts/Stairways Software

### Build
```
    npm install
    grunt generate
    grunt
```

### Update Procedure
This macro library and controller script depends on Bitwig Studio Version.

- send CC message(CC# 0, ch.16) from Keyboard Maestro.
- copy JSON string from Script Console.
- beautify JOSN at [here](http://archive.dojotoolkit.org/nightly/checkout/dojox/gfx/demos/beautify.html). - (optional)
- create JSON file. actions/bitwig-studio-actions-${version}.json
- modify 'template' section in Gruntfile.coffee.
```
    data: grunt.file.readJSON 'actions/bitwig-studio-actions-${version}.json'
```
- generate macro library and actions.coffee.
```
    grunt generate
```
- build controller script
```
    grunt
```

### Example macro
Here is an example macro using library.

- [Bitwig Studio - Channel Strip.kmmacros](example/Bitwig Studio - Channel Strip.kmmacros)

[Option + T] for activate/deactvate macro.
