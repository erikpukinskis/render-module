// GLOBAL API SHIT

var cachedBody
function body() {
  if (!cachedBody) {
    cachedBody = document.querySelector("body")
  }
  return cachedBody
}

function addToDom(html) {
  body().innerHTML = body().innerHTML + html
}


// SOME MIDDLEWARE PERHAPS?


// OUR PROGRAM



var program = {
  kind: "function call",
  functionName: "using",
  arguments: [
    // "eriks-homepage",
    {
      kind: "array literal",
      items: [
        "element",
        "bridge-route"
      ]
    },
    {
      kind: "function literal",
      argumentNames: ["element", "bridgeRoute"],
      body: [
        {//////////
          kind: "variable assignment",
          variableName: "page",
          expression: {
            kind: "function call",
            functionName: "element",
            arguments: [
              "body",
              {
                kind: "function call",
                functionName: "element.styles",
                arguments: [
                  {
                    kind: "object literal",
                    object: 
                      {
                    "background": "smoke",
                    "color": "wood",
                    "font-family": "Georgia"
                      }
                  }
                ]
              },
              "sup family"
            ]
          }
        }, /////////////////
        {
          kind: "function call",
          functionName: "bridgeRoute",
          arguments: [
            "/",
            {
              kind: "function literal",
              argumentNames: ["bridge"],
              body: [
            {
              kind: "function call",
              functionName: "bridge.sendPage",
              arguments: [
                {
                  kind: "variable reference",
                  variableName: "page"
                }
              ]
            }                
              ]
            }
          ]
        }//////////////////
      ]
    }
  ]
}

function argumentsToElements(args) {
  var container = element(
    ".function-call-args"
  )
  
  for(var i=0; i<args.length; i++) {
    var expression = args[i]
    var isFunctionCall =      
      expression.kind
      == "function call"
    var arg = expressionToElement(
      expression)
    
    arg.classes.push(
      "function-argument")
    
    if (isFunctionCall) {
      arg.classes.push("call-in-call")
    }

    container.children.push(arg)
  }
  
  return container
}

var expressionsByElementId = {}

var functionCall = element.template(
  ".function-call",
  function(expression) {

    this.assignId()
    expressionsByElementId[this.id] = expression

    var edit = "edit(\""+this.id+"\")"

    var button = element(
      ".button.depth-1.function-call-name.button-"+this.id,
      expression.functionName,
      {onclick: edit}
    )

    this.children.push(button)

    var elements = argumentsToElements(
      expression.arguments
    )

    this.children = this.children.concat(elements)
  }
)




function edit(id) {

  var expression = expressionsByElementId[id]

  var el = document.querySelector(".button-"+id)

  streamHumanInput(
    expression.functionName,
    function onChange(value) {
      el.innerHTML = value
    },
    function done() {
      el.classList.remove("being-edited-by-human")
    }
  )

  el.classList.add("being-edited-by-human")
}





var stringElement = element.template(
  ".button.literal.depth-2",
  function(string) {
    this.children.push(
      element("span", "\"")
    )
    this.children.push(
      element.raw(string)
    )
    this.children.push(
      element("span", "\"")
    )
  }
)

var functionLiteral =
  element.template(
    ".function-literal.depth-2",
    function(expression) {
      var children = this.children

      children.push(
        element(
          ".button.depth-2",
          "function"
        )
      )

      children.push(argumentNames(
        expression.argumentNames
      ))

      children.push(
        functionLiteralBody(
          expression.body
        )
      )

    }
   )

var functionLiteralBody = element.template(
  ".function-literal-body",
  function(lines) {

    this.children = lines.map(
      function(line) {
        return element(
          expressionToElement(line),
          ".function-literal-line"
        )
      }
    )

  }
)

              
function argumentNames(names) {
  return element(
    ".function-argument-names",
    names.map(argumentName)
  )
}

function argumentName(name) {
  return element(
    ".button.argument-name",
    element.raw(name)
  )
}

var variableAssignment = element.template(
  ".variable-assignment",
  function(expression) {
    var lhs = element(
      ".button.variable-name",
      [
        element("span", "var&nbsp;"),
        element("span",
          expression.variableName
        ),
        element("span", "&nbsp;=")
      ]
    )
    
    this.children.push(lhs)
    this.children.push(
      expressionToElement(
        expression.expression
      )
    )
  }
)

var objectLiteral = element.template(
  ".object-literal",
  function(expression) {
    var object = expression.object
    for(var key in object) {
      this.children.push(
        keyPair(key, object[key])
      )
    }
  }
)

var keyPair = element.template(
  ".key-pair",
  function(key, value) {

    this.children.push(element(
      ".button.key.depth-2",
      [
        element("span", element.raw(key)),
        element("span", ":")
      ]
    ))
    
    this.children.push(
      expressionToElement(value)
    )
  }
)

var variableReference = element.template(
  ".button.variable-reference",
  function(expression) {
    this.children.push(element.raw(
      expression.variableName
    ))
  }
)

var arrayLiteral = element.template(
  ".array-literal",
  function(expression) {
    this.children = expression.items.map(itemToElement)
  }
)

function itemToElement(item) {
  return element(
    ".array-item",
    expressionToElement(item)
  )
}




var expressionHandlers = {
  "function call": functionCall,
  "function literal": functionLiteral,
  "variable reference": variableReference,
  "variable assignment": variableAssignment,
  "object literal": objectLiteral,
  "array literal": arrayLiteral
}

var elements = []
var expressions = []

function expressionToElement(expression, parent) {

  if (typeof expression == "string") {
    var el = stringElement(expression)
  } else {
    var el = expressionHandlers[
      expression.kind
    ](expression)
  }
    
  return el
}





// HUMAN WORDS

var humanWords = element.template(
  "input.human-words-and-stuff",
  {
    onKeyUp: "handleHumanInput(this)"
  }
)

var listener

function handleHumanInput(el) {
  var newText = el.value
  listener(newText)
}

function getInputElement() {
  return document.querySelector(".human-words-and-stuff")
}  

function streamHumanInput(startingText, callback, done) {
  listener = callback
  var input = getInputElement()
  var tapCatcher = document.getElementById("tap-catcher")
  tapCatcher.style.display = "block"
  input.value = startingText
  input.focus()

  tapOutCallback = function() {
    document.getElementById("tap-catcher").style.display = "none"
    done()
  }

}

var tapOutCallback

function tapCatcher(child, callback) {

  var style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: none;"

  var catcher = element(
    {
      id: "tap-catcher",
      style: style,
      onclick: "tapOutCallback()"
    },
    child
  )

  return catcher
}







function drawProgram(expression) {

  var program = element(
    ".program", 
    [
      expressionToElement(
  expression),
      element(".logo", "EZJS")
    ]
  )


  var input = tapCatcher(
    humanWords(),
    function() {
      console.log("done")
    }
  )

    
  var page = element([program, input])

  addToDom(page.html())
}

drawProgram(program)



