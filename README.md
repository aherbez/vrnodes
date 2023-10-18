# vrnodes

Experimental interface for node-based development in VR. To see it in action, check out this video: https://www.youtube.com/watch?v=OE4Kxt2VKjg, or play with the live version here: https://adrianherbez.net/vrnodes/02/

## What it is

This is an in-progress proof of concept for a VR-friendly, node-based scripting system. There is a simple 3d environment that can be navigated with standard FPS controls (mouse to look, WASD to move). Tapping space toggles a node-based interface, where the user can drag and drop various nodes. 

While it's not (yet) possible to connect the nodes, there is an actual scripting system under the hood. There's a simple scripting language for node definition that defines a node by listing a set of typed inputs, and describing outputs in terms of those inputs. The language supports vectors, as well as switching between XYZ, RGB, and UV-based indexing. To see how that all works, have a look at src/parser/parser.js. To see some example node definitions, have a look at src/parser/test_inputs.js.


