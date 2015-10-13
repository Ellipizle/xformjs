# XFORM

## Structure
- head
    + title
- model
    + instance
    + bindings
- body
 
### Model
`<model>` can have multiple childnodes. First required node(`<instance>`) is called `primary instance`, additional nodes are called `secondary instances`

#### Primary Instance
- Provide definition of the data structure of the `record or observation` captured by the form.
- Any value inside primary instance node is considered a `default value` displayed with a question when rendered for filling. 

##### Nodes
- May contain attributes and retained in record when submitted

### Secondary Instances
- Used to preload data inside form
- Should have unique `id` attribute to allow data querying

#### Metadata / Preloaders

| jr:preload | jr:preloadParams | node | description
---|---|---|---
instance | | /meta/instanceID | unique instance id. `uuid:uuid()`
timestamp | start | /meta/timeStart | firstly timestamp when form opened. populated only once
timestamp | end | /meta/timeEnd | lastly timestamp when form saved  
property | deviceid | tbc | device unique identifier
property | email | tbc | email address of the entity fill the form
property | username | tbc | name of the entity fill the form
property | phonenumber | tbc | phone number of the device used to fill the form
property | simserial | tbc | serial number of the phone used to fill the form
property | subscriberid | tbc | phone IMSI


### Bindings
Describes an individual node and includes information such as:
- datatype
- skip logic
- calculations
- etc 

#### Attributes

| Attribute | Description |
---|---
nodeset | specifies path to instance node [required]
type | specifies data type. default to `string`
readonly | specifies whether data entry is allowed. default to `false()`
required | specifies whether question required non-empty value. default to `false()`
relevant | specifies whether question or group is relevant. If xpath expression evaluate to `true` question or group is shown.
constraint | specifies acceptable answers using xpath expression
calculate | calculate node value with an xpath expression
saveIncomplete | specifies whether to automatically save the draft record when user reaches this question. default to `false()`
jr:constraintMsg | message displayed if specified constraint is violated
jr:preload | preloader for metadata
jr:preloadParams | parameter used by `jr:preload`

#### Data Types

| Type | Description
---|---
string | 
int | 
boolean | 
decimal | 
date | 
time | 
dateTime | 
select | space separated list of strings
select1 | as string (avoid space)
geopoint | space separated latitude, longitude, altitude and accuracy
geotrace | semi-colon separated list of at least 2 geopoints
geoshape | semi-colon separated list of atleast 3 geopoints
binary | 
barcode | as string

#### XPath Paths
Used to reference instance node to store or retrieve data

Example
- .
- ..
- /
- node
- /absolute/path/to/node
- ../relative/path/to/node

#### XPath Expressions
All expressions are supported i.e `|, or, and, =, !=, <=, <, >=, >` 

#### XPath Functions



### Body
Contains information required to display form question(s), including
- type of prompt
- appearance of prompt(widget)
- label
- hint
- choice options

#### Form Controls Element(Widget)

| Control | Description |
---|---
`<input>` | obtained inputs of type string, integer, decimal and date
`<select1>` | obtained inputs of type select1(single selected value)
`<select>` | obtain inputs of type select(multi selected value)
`<upload>` | used for image, audio and video capture
`<trigger>` | used to obtain confirmations

#### User Controls Element

| Element | Description |
---|---
`<group>` | child of `<body>`,`<group>` or `<repeat>`. Used to group form controls together
`<repeat>` | child of `<body>` or `<group>` that can be repeated
`<label>` | child of form control element, `<item>`, `<itemset>`, or `<group>`. Used to display label
`<hint>` | child of form control element. used to display hint
`<output>` | child of `<label>` or `<hint>` element. Used to display instance value
`<item>` | child of `<select>` or `<select1>` that define a choice option
`<itemset>` | child of `<select>` or `<select1>` that defines a list of choice options to be obtained elsewhere
`<value>` | child of `<item>` or `<itemset>` that define a choice value

#### Body Attributes

| Attribute | Description |
---|---
`ref` / `nodeset` | link body element with its corresponding data node and binding. `nodeset` for `<repeat>` and `ref` for everything else
`class` | supported by `<h:body>` for form-wide style classes
`appearance` | used in all form controls element and groups to change their apperance
`jr:count` | only for `<repeat>` to specify how many repeats should be crated by default
`jr:noAddRemove` | only for `<repeat>` to indicates whether user is allowed to add or remove repeats. Suppoorted values are `true()` and `false()`
`autoplay` | for all form control elements, to autoplay video or audio
`accuracyThreshold` | for `<input>` type `geopoint`, `geotrace`, or `geoshape`  to set auto-accepted threshold in meters for geopoint captures
`rows` | specifies minimum number of rows a string `<input>` fields get. Also `apperance="multiline"` can be used

#### Apperances

#### Groups
- combines elements together
- if it has child `<label>`, it is `presentation group` and will be displayed as visual distinct group
- if it have `ref`, it is `logical group` and has a `<bind>` element
- `logical group` may contain `relevant attribute` on its `<bind>` element as a way to keep form logic maintanable

#### Repeats
- specify sections that may be repeated
- recommended to wrap `<repeat>` inside a `<group>`
- uses `nodeset attribute` to identify repeated node

#### Languages

