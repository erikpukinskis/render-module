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

var indexedById = {}
var lastInteger = 1999

function barCode(expression) {
  var id = expression.__barCode

  if (!id) {
    lastInteger += 1
    id = "BC"+lastInteger.toString(36)
    expression.__barCode = id
    indexedById[id] = expression
    checkSize()
  }

  return id
}

function checkSize() {
  if (lastInteger == 2999) {
    console.log("Whoa! 1000 items in the index! Getting fancy.")
  } else if (lastInteger == 11999) {
    console.log("Um, 10,000 indexed items is a lot. Are there even 10,000 perceptible features on the page?")
  }
}

barCode.scan = function(id) {
  return indexedById[id]
}





// OUR PROGRAM

var program = {
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
          stringLiteralJson("sup family"),
          // stringLiteralJson("body"),
          {
            kind: "function call",
            functionName: "element.style",
            arguments: [
              {
                kind: "object literal",
                object:
                  {
                "background": stringLiteralJson("cornsilk"),
                "color": stringLiteralJson("orchid"),
                "font-size": stringLiteralJson("60pt"),
                "font-family": stringLiteralJson("georgia")
                  }
              }
            ]
          }
        ]
      }
    }, /////////////////
    {
      kind: "function call",
      functionName: "bridgeRoute",
      arguments: [
        stringLiteralJson("/"),
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



function stringLiteralJson(string) {
  return {
    kind: "string literal",
    string: string
  }
}

function emptyExpressionJson() {
  return { kind: "empty expression" }
}




// RENDERERS

var ghostExpression = element.template(
  ".ghost-expression.ghost.button",
  "&nbsp;",
  function(options) {
    this.assignId()

    if (!options) { options = {} }

    var add = functionCall(addExpression).withArgs(this.id)

    if (options.parentId) {
      add = add.withArgs(options.parentId)
    }

    this.onclick(add)
  }
)

function addExpression(ghostElementId, parentId) {

  menu(
    menu.choice(
      "&nbsp;",
      {kind: "empty"}
    ),
    menu.choice(
      "\" text \"",
      {kind: "string literal"}
    ),
    menu.choice(
      "var _ =",
      {
        kind: "variable assignment",
        expression: emptyExpressionJson(),
        variableName: "fraggleRock"
      }
    ),
    menu.choice(
      "page",
      {kind: "variable reference", variableName: "page"}
    ),
    menu.choice(
      "options :",
      {kind: "object literal"}
    ),
    menu.choice(
      "function",
      {kind: "function literal"}
    ),
    menu.choice(
      "element",
      {kind: "function call", functionName: "element", arguments: []}
    ),
    menu.choice(
      "bridgeRoute",
      {kind: "function call", functionName: "bridgeRoute"}
    ),
    menu.choice(
      "element.style",
      {kind: "function call", functionName: "bridgeRoute"}
    ),
    function(choice) {

      var expression = barCode.scan(parentId)

      expression.arguments.push(choice)

      var newEl = expressionToElement(choice)

      var crucible = document.createElement('div')

      crucible.innerHTML = newEl.html()

      var newChild = crucible.firstChild

      var oldChild = document.getElementById(ghostElementId)

      var parent = oldChild.parentNode

      parent.replaceChild(newChild, oldChild)

      runIt(program)

    }
  )

}




var renderFunctionCall = element.template(
  ".function-call",
  function(expression) {

    var button = element(
      ".button.function-call-name.indenter",
      expression.functionName
    )

    var expressionId = barCode(expression)

    makeEditable(
      button,
      functionCall(getProperty).withArgs("functionName", expressionId),
      functionCall(setProperty).withArgs("functionName", expressionId)
    )

    this.children.push(button)

    this.onclick(
      functionCall(handleAttention)
      .withArgs(
        this.assignId(),
        functionCall.raw("event")
      )
    )

    // this.onclick(
    //   functionCall(addGhostBabyArgument)
    //   .withArgs(
    //     expressionId,
    //     functionCall.raw("event")
    //   )
    // )

    var container = element(
      ".function-call-args.container-"+expressionId)

    container.children =
      argumentsToElements(
        expression.arguments
      )

    this.children.push(container)
  }
)

function getProperty(property, expressionId) {
  var expression = barCode.scan(expressionId)
  return expression[property]
}

function setProperty(property, expressionId, newValue, oldValue) {
  var expression = barCode.scan(expressionId)
  expression[property] = newValue
  runIt(program)
}

function argumentsToElements(args) {

  var elements = []
  for(var i=0; i<args.length; i++) {

    var expression = args[i]
    var isFunctionCall = expression.kind == "function call"
    var arg = expressionToElement(expression)

    arg.classes.push(
      "function-argument")

    if (isFunctionCall) {
      arg.classes.push("call-in-call")
    }

    elements.push(arg)
  }

  return elements
}




var stringLiteral = element.template(
  ".button.literal",
  function(expression) {

    var stringElement = element("span", element.raw(expression.string))

    this.children.push(
      element("span", "\""),
      stringElement,
      element("span", "\"")
    )

    makeEditable(
      this,
      functionCall(getProperty).withArgs("string", barCode(expression)),
      functionCall(setProperty).withArgs("string", barCode(expression)),
      {updateElement: stringElement}
    )

    makeIndicable(this)
  }
)




var functionLiteral = element.template(
  ".function-literal",
  function(expression) {
    var children = this.children

    children.push(
      element(
        ".button.function-literal-label.indenter",
        "function"
      )
    )

    var argumentNames = element(
      ".function-argument-names",
      expression.argumentNames.map(function(name, index) {
        return argumentName(expression, name, index)
      })
    )

    children.push(argumentNames)

    children.push(
      functionLiteralBody(
        expression.body
      )
    )

    makeIndicable(this)

  }
)

function makeIndicable(el) {
  el.onclick(
    functionCall(handleAttention)
    .withArgs(
      el.assignId(),
      functionCall.raw("event")
    )
  )
}

var lastSelectedId

function handleAttention(elementId, event) {

  event.stopPropagation()

  var el = document.getElementById(elementId)

  if (elementId == lastSelectedId) {
    el.classList.remove("selected")
    lastSelectedId = null
  } else {
    if (lastSelectedId) {
      document.getElementById(lastSelectedId).classList.remove("selected")
    }
    el.classList.add("selected")
    lastSelectedId = elementId
  }
}

var argumentName = element.template(
  ".button.argument-name",
  function(expression, name, argumentIndex) {

    this.children.push(
      element.raw(name)
    )
    
    makeEditable(
      this,
      functionCall(getArgumentName).withArgs(barCode(expression), argumentIndex),
      functionCall(renameArgument).withArgs(barCode(expression), argumentIndex)
    )

  }
)

function getArgumentName(expressionId, index) {
  var expression = barCode.scan(expressionId)

  return expression.argumentNames[index]
}

function renameArgument(expressionId, index, newName) {
  var expression = barCode.scan(expressionId)

  expression.argumentNames[index] = newName

  runIt(program)
}

var functionLiteralBody = element.template(
  ".function-literal-body",
  function(lines) {

    var previous

    this.children = lines.map(
      function(line) {
        var el = element(
          expressionToElement(line),
          ".function-literal-line"
        )

        if (previous) {
          previous.classes.push("leads-to-"+line.kind.replace(" ", "-"))

        }

        previous = el

        return el
      }
    )

  }
)




var variableAssignment = element.template(
  ".variable-assignment",
  function(expression) {
    var nameSpan = element("span",
      expression.variableName
    )

    var lhs = element(
      ".button.variable-name.indenter",
      [
        element("span", "var&nbsp;"),
        nameSpan,
        element("span", "&nbsp;=")
      ]
    )

    makeEditable(
      lhs,
      functionCall(getProperty).withArgs("variableName", barCode(expression)),
      functionCall(setProperty).withArgs("variableName", barCode(expression)),
      {updateElement: nameSpan}
    )


    makeIndicable(this)

    var rhs = expressionToElement(
      expression.expression
    )

    rhs.classes.push("rhs")
    this.children.push(lhs)
    this.children.push(rhs)
  }
)




var objectLiteral = element.template(
  ".object-literal",
  function(expression) {

    var object = expression.object

    for(var key in object) {
      var pairExpression = {
        key: key,
        expression: expression
      }

      var el = keyPair(
        pairExpression,
        functionCall(onKeyRename).withArgs(barCode(pairExpression))
      )

      this.children.push(el)
    }

    this.classes.push("container-"+barCode(expression))

    this.onclick(
      functionCall(handleAttention)
      .withArgs(
        this.assignId(),
        functionCall.raw("event")
      )
    )


    // this.onclick(
    //   functionCall(addGhostBabyKeyPair)
    //   .withArgs(
    //     barCode(expression),
    //     functionCall.raw("event")
    //   )
    // )

  }
)

function onKeyRename(pairId, newKey) {
  var pairExpression = barCode.scan(pairId)
  var object = pairExpression.expression.object
  var oldKey = pairExpression.key

  pairExpression.key = newKey
  object[newKey] = object[oldKey]

  delete object[oldKey]
  runIt(program)
}




var keyPair = element.template(
  ".key-pair",
  function keyPair(pairExpression, keyRenameHandler) {

    pairExpression.kind = "key pair"

    var expression = pairExpression.expression
    var key = pairExpression.key

    var valueExpression = expression.object[key] || pairExpression.valueExpression

    var textElement = element(
      "span",
      element.raw(key)
    )

    var pairId = barCode(pairExpression)

    var keyButton = element(
      ".button.key.key-pair-"+pairId+"-key",
      [
        textElement,
        element("span", ":")
      ]
    )

    makeEditable(
      keyButton,
      functionCall(getKeyName).withArgs(pairId),
      keyRenameHandler,
      {updateElement: textElement}
    )


    var valueElement =
      expressionToElement(valueExpression)

    this.children.push(keyButton)
    this.children.push(valueElement)
  }
)

function getKeyName(id) {
  var pairExpression = barCode.scan(id)
  return pairExpression.key
}

var variableReference = element.template(
  ".button.variable-reference",
  function(expression) {
    this.children.push(element.raw(
      expression.variableName
    ))
    makeIndicable(this)
  }
)




var arrayLiteral = element.template(
  ".array-literal.indenter",
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




// GHOST BABIES

var expressionHasGhostBaby = {}

function addGhost(containerId, el) {
  if (expressionHasGhostBaby[containerId]) {
    return
  }

  expressionHasGhostBaby[containerId] = true

  var container = document.querySelector(".container-"+containerId)

  container.innerHTML = container.innerHTML + el.html()
}

// GHOST BABY MAKERS

function addGhostBabyArgument(parentId, event) {
  var el = ghostExpression({
    parentId: parentId
  })
  el.classes.push("ghost-baby-arg")
  el.classes.push("ghost")
  el.classes.push("function-argument")
  addGhost(parentId, el)
}

function addGhostBabyKeyPair(expressionId, event) {

  var expression = barCode.scan(expressionId)

  var pair = {
    kind: "key pair",
    key: "",
    expression: expression,
    valueExpression: stringLiteralJson("")
  }

  var pairId = barCode(pair)

  var el = keyPair(
    pair,
    functionCall(onNewObjectKey).withArgs(barCode(pair))
  )

  el.classes.push("ghost")
  el.classes.push("ghost-baby-key-pair-"+pairId)

  addGhost(expressionId, el)

}

function onNewObjectKey(pairId, newKey, oldKey) {

  var pairExpression = barCode.scan(pairId)

  pairExpression.key = newKey

  var object = pairExpression.expression.object

  object[newKey] = pairExpression.valueExpression

  pairExpression.key = newKey

  // remove classes:

  var pairElement = document.querySelector(".ghost-baby-key-pair-"+pairId)
  pairElement.classList.remove("ghost")
  pairElement.classList.remove("ghost-baby-key-pair-"+pairId)

  // mark the ghost baby as gone:

  var expressionId = barCode(pairExpression.expression)
  expressionHasGhostBaby[expressionId] = false

  // swap in the normal callbacks:

  var keyElement = document.querySelector(".key-pair-"+pairId+"-key")
  var getValue = functionCall(getKeyName).withArgs(pairId)

  // this mabe needs to be more beefy, with the targetElement updater etc
  var setValue = functionCall(onKeyRename).withArgs(pairId)

  var startEditingScript = functionCall(startEditing).withArgs(keyElement.id, getValue, setValue).evalable()

  keyElement.setAttribute(
    "onclick",
    startEditingScript
  )

  var setValue = onKeyRename.bind(null, pairId)

  humanInputListener.callback = updateEditable.bind(null, setValue)

  runIt(program)

}




// HUMAN WORDS

function makeEditable(button, getValue, setValue, options) {
  return  
  button.assignId()

  if (options) {
    var updateElement = options.updateElement
  } else {
    var updateElement = button
  }

  updateElement.classes.push("editable-"+button.id+"-target")

  button.classes.push("editable-"+button.id)

  button.onclick(
    functionCall(startEditing)
    .withArgs(
      button.id,
      getValue,
      setValue
    )
  )
}

function startEditing(id, getValue, callback) {

  var el = document.querySelector(
    ".editable-"+id)

  el.classList.add("being-edited-by-human")

  editable = {
    id: id,
    oldValue: getValue()
  }

  streamHumanInput(
    editable.oldValue,
    updateEditable.bind(null, callback),
    functionCall(stopEditing).withArgs(editable.id)
  )

}

var editable

function updateEditable(callback, value) {

  var toUpdate = document.querySelector(
      ".editable-"
      +editable.id
      +"-target")

  toUpdate.innerHTML = value
  callback(value, editable.oldValue)
  editable.oldValue = value
}

function stopEditing(id) {
  var el = document.querySelector(".editable-"+id)
  el.classList.remove("being-edited-by-human")
}

var humanInputListener = {}

// It's pretty weird that callback is a function and done is a functionCall. Maybe they should both be functionCalls and we should actually modify the onChange

function streamHumanInput(startingText, callback, done) {

  humanInputListener.oldText = startingText
  humanInputListener.callback = callback

  var catcher = humanInputListener.catcher

  if (catcher) {
    catcher.onTapOut(done)
    catcher.show()
  } else {
    var input = humanWords()

    humanInputListener.inputId = input.assignId()

    var catcher = humanInputListener.catcher = tapCatcher(input, done)

    addToDom(catcher.html())
  }

  var input = document.getElementById(humanInputListener.inputId)

  input.value = startingText
  input.focus()
}

function onFreshHumanData(newText) {
  if (newText == humanInputListener.oldText) { return }
  humanInputListener.oldText = newText
  humanInputListener.callback(newText)
}

var humanWords = element.template(
  "input.human-words-and-stuff",
  {
    onKeyUp: "onFreshHumanData(this.value)"
  }
)


// CATCH DEM TAPS

function tapCatcher(child, callback) {

  var catcher = element(
    ".tap-catcher",
    {
      onclick: tapOutScript(callback)
    },
    element.style({
      "position": "fixed",
      "top": "0",
      "left": "0",
      "width": "100%",
      "height": "100%",
      "z-index": "1000"
    }),
    child
  )

  function tapOutScript(callback) {
    return functionCall(onTapOut).withArgs(functionCall.raw("event"), callback).evalable()
  }

  catcher.assignId()

  catcher.onTapOut =
    function(callback) {
      document.getElementById(this.id).setAttribute("onclick", tapOutScript(callback))
    }

  catcher.show =
    function() {
      document.getElementById(this.id).style.display = "block"
    }

  return catcher
}

function onTapOut(event, callback) {
  var catcherElement = event.target
  
  if (!catcherElement.classList.contains("tap-catcher")) {
    return
  }

  catcherElement.style.display = "none"

  callback && callback()
}


// DRAW THE PROGRAM

var renderers = {
  "function call": renderFunctionCall,
  "function literal": functionLiteral,
  "variable reference": variableReference,
  "variable assignment": variableAssignment,
  "object literal": objectLiteral,
  "array literal": arrayLiteral,
  "string literal": stringLiteral,
  "empty expression": ghostExpression
}

function expressionToElement(expression) {
  return traverseExpression(expression, renderers)
}

function traverseExpression(expression, handlers) {

  var kind = expression.kind
  var handler = handlers[kind]

  if (typeof handler != "function") {
    throw new Error("The object you provided had no "+kind+" handler, which is the kind of your expression: "+JSON.stringify(expression))
  }

  return handler(expression)
}

var line = element.template.container()

function drawProgram(expression) {
  var program = expressionToElement(
    expression)
  program.classes.push("program")

  var world = element(
    ".two-columns",
    {
      onclick: "// click away"
    },
    [
      element(".column", [
        line(program)
        // element(".logo", "EZJS"),
      ]),
      element(".column", [
        element(".output")
      ])
    ]
  )

  addToDom(world.html())
}





// RUN THE PROGRAM

function pad(str) {
  var lines = str.split("\n")
  return lines.map(function(line) {
    return "  "+line
  }).join("\n")
}

var codeGenerators = {
  "function call": function(expression) {
    var args = expression.arguments.map(
      expressionToJavascript
    ).join(",\n")
    return expression.functionName+"(\n"+pad(args)+"\n)"
  },
  "array literal": function(expression) {
    var items = expression.items.map(
      expressionToJavascript
    )
    return "[\n"+pad(items.join(",\n"))+"\n]"
  },
  "function literal": function(expression) {
    var names = expression.argumentNames.join(", ")
    var lines = expression.body.map(
      expressionToJavascript
    )
    var code = "function("
      +names
      +") {\n"
      +pad(lines.join("\n"))
      +"\n}"

    return code
  },
  "string literal": function(expression) {
    return JSON.stringify(expression.string)
  },
  "empty expression": function() {
    return "null"
  },
  "variable assignment": function(expression) {
    return "var "
      +expression.variableName
      +" = "
      +expressionToJavascript(expression.expression)
  },
  "variable reference": function(expression) {
    return expression.variableName
  },
  "object literal": function(expression) {
    var keyPairs = []

    for(var key in expression.object) {
      keyPairs.push(
        "  "
        +JSON.stringify(key)
        +": "
        +expressionToJavascript(expression.object[key])
      )
    }
    return "{\n"+keyPairs.join(",\n")+"\n}"
  }
}

function runIt(functionLiteral) {
  var expression = packageAsModule(functionLiteral)

  var js = expressionToJavascript(expression)

  js = js + "\n//# sourceURL=home-page.js"

  eval(js)
}

function packageAsModule(functionLiteral) {
  
  return {
    kind: "function call",
    functionName: "using",
    arguments: [
      {
        kind: "array literal",
        items: dependenciesFromArgumentNames(functionLiteral)
      },
      functionLiteral
    ]
  }

}

function dependenciesFromArgumentNames(functionLiteral) {

  return functionLiteral
    .argumentNames
    .map(
      function(camelCase) {
        return stringLiteralJson(
          dasherized(camelCase)
        )
      }
    )

}

function dasherized(camelCase) {
  var words = []
  var wordStart = 0

  for(var i=0; i<camelCase.length+1; i++) {

    var letter = camelCase[i]
    var isEnd = i == camelCase.length
    var isUpperCase = letter && letter.toUpperCase() == letter

    if (isUpperCase || isEnd) {
      // new word!
      var word = camelCase.slice(wordStart, i)
      words.push(word.toLowerCase())
      wordStart = i
    }
  }

  return words.join("-")
}

function expressionToJavascript(expression) {
  return traverseExpression(
    expression,
    codeGenerators
  )
}

var library = new Library()
var using = library.using.bind(library)
library.define("element", function () {
  return element
})

library.define("bridge-route", function() {
  return function(path, handler) {
    var bridge = {
      sendPage: function(element) {
        var out = document.querySelector(".output")

        out.innerHTML = element.html()

        setTimeout(function() {
          var el = document.querySelector(".program")
          var top = el.offsetTop
          var parentTop = el.parentNode.parentNode.offsetTop

          out.style.top = (top-parentTop)+"px"
          out.style.position = "relative"
        })
      }
    }

    handler(bridge)
  }
})







// BOTTOM OF THE FILE

drawProgram(program)

runIt(program)



