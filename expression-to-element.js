var library = require("module-library")(require)

module.exports = library.export(
  "expression-to-element",
  function() {

    function expressionToElement(bridge, expression, tree, options) {

      if (!options) { options = {} }

      if (typeof expression != "object" || !expression || !expression.kind) {
        throw new Error("Trying to turn "+stringify(expression)+" into an element, but it doesn't look like an expression")
      }

      var kind = expression.kind

      var moduleName = "render-"+kind.replace(" ", "-")

      var render = library.get(moduleName)

      if (typeof render != "function") {
        throw new Error("No renderer for "+kind)
      }

      if (!tree) {throw new Error()}
      var el = render(expression, tree, bridge, options)

      if (el.id && el.id != expression.id) {
        console.log("expression:", expression)
        console.log("element:", el)
        throw new Error("Expression element ids must match the expression id")
      }

      el.id = expression.id

      if (expression.role == "function literal line") {
        el.addSelector(".function-literal-line")
      }

      return el
    }

    function stringify(thing) {
      if (typeof thing == "function") {
        return thing.toString()
      } else {
        return JSON.stringify(thing)
      }
    }

    return expressionToElement
  }
)