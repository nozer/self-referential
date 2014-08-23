self-referential
================

Allows a self referential collection to be converted into a nested or flat hierarchy

###Install
```
npm install self-referential 
```

###Require
```
var selfref = require('self-referential');
```

###Usage
`selfref.toHier(cfg, collectionData);`

`selfref.toFlatHier(cfg, collectionData);`

`selfref.rootElements(cfg, collectionData);`

Where cfg has the following properties: 

`selfKey`:  name of property that is uniquely identifies this record

`parentKey`:  name of property that refers to its parent's unique id

***Following two are not required for .rootElements method***

`childrenKey`:  name of the property that the children of this model should be set to 

`rootValues`: optional: (null|string|number|array), values of parentKeys that identifies a record as one of the root models; if none is given, they will be figured out by the system



###Examples
Imagine a table named `categories` like below where parentId refers to a record in the same `categories` table with some foreign key (in this case parentId)

id | title | parentId
--- | --- | ---
1 | Colors | null
2 | Fruits | null
3 | Mears | null
4 | Warm Colors | 1
5 | Cold Colors | 1
6 | Red | 4
7 | Orange | 4
8 | Apple | 2

We can represent this table as an array of objects as follows:

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

####To Hierarchy
To convert this to a hierarchy, we do...
```
var cfg = {
    selfKey: 'id'
    parentKey: 'parentId'
    childrenKey: 'children'
    rootValues: null 
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
To convert this into a flat list of collection but in hierarchical order, we do: 
```
var flat_but_in_hierarchical_order_cats = selfref.toFlatHier(cfg, categories);
```
flat_but_in_hierarchical_order_cats now has the following structure: 
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

Finally, to get only the root elements of our collection, we do: 
```
// only selfKey and parentKey is necessary for cfg parameter
var root_cats = selfref.rootElements(cfg, categories);
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


