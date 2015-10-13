# xformjs Algorithms

## Pseudocode

### Parsing Binding

```js
normalize nodeset and ref usage
normalize input types(eg int to integer)
parse question type, default to string
parse readonly state
parse saveIncomplete state
parse required state
parse all `true()` and `false()` into js `true` and `false`
parse variable name of the question
```

### Parsing Bindings

```js
for each binding
    parse question binding
    parse default value
end each
```

### Parsing Question Default Value
Parsing question default value allow to specify a default value to be used with observation instance, when no answer provided. It helps to provide `missing value(s)` in question `data cleansing`

```js
get question ref/nodeset to instance
get the path using ref as a key
if its not a readonly node
    parse a value or use missing value option
end if
```

### Parsing Question

```js
normalize question node
extend question with its binding
deduce and set question form widget
update question label with instance reference to use angular style data binding
```

### Parse and Convert XForm Body into JSON Questions

```js
for each body element    
    s1: if its a form control element (input, select, select1, upload, trigger)
        s1.1: if its a collection of form control element
                for each form control element
                    normalize node
                    parse question from form control element
                end each
              end if
        s1.2: else
                normalize node
                parse question from form control element
              end else
        end if
    s2: if its a user control element (group, repeat, label, hint, output, item, itemset, value)
        normalize node
        s2.1: if its a form control element do s1
              end if
        s2.2  else do s2
              end else
end each
```