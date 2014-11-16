[Keyboard Maestro](http://www.keyboardmaestro.com/main/) macro library and controller script for [Bitwig Studio](http://www.bitwig.com/en/bitwig-studio/overview.html).


### Install Macro Library
- BitwigStudioActions(Safe).kmlibrary - execute only if Bitwig Studio is at the front.
<br/>or
- BitwigStudioActions.kmlibrary

import via "Import to Macro Library" menu in Keybord Maestro Editor.


### Install Controller Script
- [Keyboard Maestro.control.js](Keyboard Maestro.control.js)
<br/>or
- [Keyboard Maestro.min.control.js](Keyboard Maestro.min.control.js) (minified script)

put into

OS| Location
:---|:---|:---|
Windows|%USERPROFILE%\Documents\Bitwig Studio\Controller Scripts\Stairways Software
Mac| ~/Documents/Bitwig Studio/Controller Scripts/Stairways Software


### Update Procedure
This macro library and controller script depends on Bitwig Studio Version.

- send CC message(CC# 0, ch.16) from Keyboard Maestro.
- copy JSON string from Script Console.
- beautify JOSN at [here](http://archive.dojotoolkit.org/nightly/checkout/dojox/gfx/demos/beautify.html). - (optional)
- create JSON file. actions/bitwig-studio-actions-${version}.json
- modify 'template' section in Grunt.js.
```
    data: grunt.file.readJSON('actions/bitwig-studio-actions-${version}.json')
```
- generate macro library and generated-actions.js.
```
    grunt generate
```
- build controller script
```
    grunt
```
