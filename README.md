self-referential
================

Allows a self referential collection (array of objects) to be converted into a nested or flat hierarchy

###Install & Require
```
npm install self-referential

var selfref = require('self-referential');
```

###Examples
Imagine a table named `categories` like below where `parentId` foreign key refers to a record in the same `categories` table.

id | title | parentId
--- | --- | ---
1 | Colors | null
2 | Fruits | null
3 | Meats | null
4 | Warm Colors | 1
5 | Cold Colors | 1
6 | Red | 4
7 | Orange | 4
8 | Apple | 2

We can represent this table as an array of objects as shown below:

```
var categories = [
       {
           id: 1,
           title: 'Colors',
           parentId: null
       },
       {
           id: 2,
           title: 'Fruits',
           parentId: null
       },
       {
           id: 3,
           title: 'Meats',
           parentId: null
       },
       {
           id: 4,
           title: 'Warm Colors',
           parentId: 1
       },
       {
           id: 5,
           title: 'Cold Colors',
           parentId: 1
       },
       {
           id: 6,
           title: 'Red',
           parentId: 4
       },
       {
           id: 7,
           title: 'Orange',
           parentId: 4
       },
       {
           id: 8,
           title: 'Apple',
           parentId: 2
       }
   ];
```

####To Nested Hierarchy
To convert this to a nested hierarchy, we do:
```
var cfg = {
    selfKey: 'id',
    parentKey: 'parentId',
    childrenKey: 'children'

    // Optional properties
    // rootParentValues: see way below for explanation
    // rootSelfValues : see way below for explanation
};
var cats_hierarchy = selfref.toHier(cfg, categories);
```
cats_hierarchy has the following structure
```
[
    {
        "id": 1,
        "title": "Colors",
        "parentId": null,
        "children": [
            {
                "id": 4,
                "title": "Warm Colors",
                "parentId": 1,
                "children": [
                    {
                        "id": 6,
                        "title": "Red",
                        "parentId": 4,
                        "children": []
                    },
                    {
                        "id": 7,
                        "title": "Orange",
                        "parentId": 4,
                        "children": []
                    }
                ]
            },
            {
                "id": 5,
                "title": "Cold Colors",
                "parentId": 1,
                "children": []
            }
        ]
    },
    {
        "id": 2,
        "title": "Fruits",
        "parentId": null,
        "children": [
            {
                "id": 8,
                "title": "Apple",
                "parentId": 2,
                "children": []
            }
        ]
    },
    {
        "id": 3,
        "title": "Meats",
        "parentId": null,
        "children": []
    }
]
```
####To Flat Hierarchy
To convert the above hierarchy into a flat collection, but in the same order as it would be in the hierarchy, we do:
```
var flat_but_in_hierarchical_order_cats = selfref.toFlatHier({childrenKey: 'children'}, cats_hierarchy);
```
flat_but_in_hierarchical_order_cats now has the following structure:
```
[
       {
              item: object: <your original item>
              hierPos: string: <position of item in a hierarchy such as 1.1 or 1.2.1 as in a table of contents in a book>
              depth: int: <depth of item in hierarchy, root has the value of zero>
              childCount: int: <number of children>
       }
       ...
]
```
```
[
    {
        "item": {
            "id": 1,
            "title": "Colors",
            "parentId": null
        },
        "hierPos": "1",
        "depth": 0,
        "childCount": 2
    },
    {
        "item": {
            "id": 4,
            "title": "Warm Colors",
            "parentId": 1
        },
        "hierPos": "1.1",
        "depth": 1,
        "childCount": 2
    },
    {
        "item": {
            "id": 6,
            "title": "Red",
            "parentId": 4
        },
        "hierPos": "1.1.1",
        "depth": 2,
        "childCount": 0
    },
    {
        "item": {
            "id": 7,
            "title": "Orange",
            "parentId": 4
        },
        "hierPos": "1.1.2",
        "depth": 2,
        "childCount": 0
    },
    {
        "item": {
            "id": 5,
            "title": "Cold Colors",
            "parentId": 1
        },
        "hierPos": "1.2",
        "depth": 1,
        "childCount": 0
    },
    {
        "item": {
            "id": 2,
            "title": "Fruits",
            "parentId": null
        },
        "hierPos": "2",
        "depth": 0,
        "childCount": 1
    },
    {
        "item": {
            "id": 8,
            "title": "Apple",
            "parentId": 2
        },
        "hierPos": "2.1",
        "depth": 1,
        "childCount": 0
    },
    {
        "item": {
            "id": 3,
            "title": "Meats",
            "parentId": null
        },
        "hierPos": "3",
        "depth": 0,
        "childCount": 0
    }
]
```
####Root Elements
Finally, to get only the root elements of our collection, we do:
```
var root_cats = selfref.rootItems({selfKey: 'id', parentKey:'parentId'}, categories);
```
root_cats now has the following data:
```
[
    {
        "id": 1,
        "title": "Colors",
        "parentId": null
    },
    {
        "id": 2,
        "title": "Fruits",
        "parentId": null
    },
    {
        "id": 3,
        "title": "Meats",
        "parentId": null
    }
]
```

###Config Parameters & Usage
Configuration parameter cfg can have the following properties:

`selfKey`:  name of property that is uniquely identifies this record

`parentKey`:  name of property that whose value refers to its parent's unique id

`childrenKey`:  name of the property that the children of this model should be set to

`rootParentValues`: null|string|number|array
> Sets nodes whose parentKey values you are specifying as the root nodes in hierarchy and goes from there  


`rootSelfValues`: null|string|number|array
> Sets nodes whose selfKey values you are specifying as the root nodes in hierarchy and goes from there  

> if any of those rootXValues are omitted, all of items with no matching parents will be picked as root items and then
> hierarchy will be generated with them and their children.

> You cannot specify both rootParentValues and rootSelfValues at the same time

 `selfref.toHier(cfg, collectionData);` cfg must have all of the above properties (except rootParentValues)

`selfref.toFlatHier(cfg, hierarchyCollection);` cfg must have `childrenKey` property only

`selfref.rootItems(cfg, collectionData);` cfg must have `selfKey` and `parentKey` properties

`selfref.getAncestors(cfg, collectionData, selfKeyValue)` returns ancestors of the item having the selfKey property value of selfKeyValue.  
    cfg must have `selfKey` and `parentKey` properties

`selfref.getChildren(cfg, collectionData, selfKeyValue)` returns children of the item having the selfKey property value of selfKeyValue.  
    cfg must have `selfKey` and `parentKey` properties
