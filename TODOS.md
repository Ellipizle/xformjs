# Form Parsing

## General
- [ ] Parallelize algorithms whenever possible
- [ ] Parallel parsing of bindings and questions
- [ ] Allow additional parser to be added/plugged in
- [ ] Accept options to specify missing values and default values per question type
- [ ] Parse form description
- [ ] Parse form version

## Function, Calculation & Formulas
- [ ] Implement and evaluate expressions
- [ ] Implement and evaluate formulas
- [ ] Implement and evaluate functions
- [ ] Evaluate calculations
- [ ] Implement formula to fill required metadata

## Validation & Constraints
- [ ] Implement and evaluate constraints
- [ ] Validate xForm before parsing

## Bindings
- [x] Parse question *variable name* from `nodeset` or `ref`
- [x] Parse, cast and set default values
    + [x] for `required` set to `false`
    + [x] for `readonly` set to `false`
    + [x] for `saveIncomplete` set to `false`
- [ ] Parse question relevant
- [x] Parse question readonly
- [x] Parse question type, default to *string* if none present
- [ ] parse question type, default to string
- [ ] parse preload and property as `meta` for the form

## Translation
- [x] parse default language
- [x] normalize default language
- [x] parse translation text
- [x] parse short and long attributes
- [ ] parse node with no attributes
- [ ] add translation per question
- [x] parse media translation

## Instance
- [x] Parse primary instance name or title
- [x] Parse and obtain node default values and set them to `default` or `defaultValue` on bindings
- [ ] Parse common instance id, version and preloads
- [ ] Parse meta and add formula to evaluate them
    + [ ] Parse their definition into js object
    + [ ] Add default nodejs evealuation logics 
- [ ] Parse instance structure and obtain it in both `xml` and `json`
- [ ] Parse `metadata` as `json`
- [ ] Parse geopoint data

## Body
- [ ] Parse question index/number
- [ ] Parse question page/face
- [ ] Parse question nodes attributes
- [x] Parse both nodeset and ref
- [ ] Process complex body structure
- [ ] Pre-code well known question types
- [x] Parse form input widget to be used in a given question
- [ ] Normalize input widgets to be used for html forms
- [ ] parse input hint form the input `<hint>` child node
- [ ] Parse geopoint data

## Label
- [ ] Allow references to be binded on the label using angular style
- [ ] parse default language label from text

## Repeat
- [ ] findout how repeat questions are submitted in instance
- [ ] parse repeated questions


## Widgets
- [ ] parse input widget
- [ ] parse select1 widget
- [ ] parse select widget
- [ ] parse upload widget
- [ ] parse trigger widget

## Controls
- [ ] parse group control
- [ ] parse repeat control
- [ ] parse label control
- [ ] parse hint control
- [ ] parse output control
- [ ] parse item control
- [ ] parse itemset control
- [ ] parse value control


## To resolve
- [ ] use simple structure on languages
- [ ] use simple structure on label and hint
