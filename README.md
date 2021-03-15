# genie
Learn to play.  Play to learn.

## Development

After cloning the repository, run VSCode from the genie directory.

There are build tasks defined in .vscode.  Use Ctrl-Shift-B to build the project.  This will run two phases: 

1) tsc - TypeScript compiles to the src directory
2) webpack combines src into a single main.js and puts it in the dist directory

### Viewing in the browser

Right now, the code is under active development and there is at least as much information in the Console 
window as there is on the main web page.  So, it is recommended that you open the browser console when 
viewing the page.  In Chrome this is Ctrl-Shift-J.

To start the page in your browser, start a web service in the genie directory:

``` shell
$ python3 -m http.server 8880
```

Or with python2:

```
$ python -m SimpleHttpServer 8880
```

Then you can view the page in your browser:

http://localhost:8880/dist

### Running on the command line

Tests can be run from the command line using node.  It is not neccessary to run `webpack` to execute the code in Node, you only need run `tsc`.

Here's a one-liner you can use for compiling and running all tests:

```shell
$ tsc && for i in $(ls src/*Test.js); do node $i; done
```



