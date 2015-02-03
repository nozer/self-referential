
(function() {
    'use strict';
    var isArray = (function() {
        if (typeof Array.isArray !== 'function') {
          return function(value) {
            return toString.call(value) === '[object Array]';
          };
        }
        return Array.isArray;
    })();

    function isDefined(val) {
        return typeof val !== 'undefined';
    };

    function rootItems(cfg, listArg){
       var list = listArg; //safeCopy(listArg);
        if (!isDefined(cfg.selfKey) || !isDefined(cfg.parentKey)){
            throw new Error("Both selfKey and parentKey properties of cfg parameter must be defined");
        }


        var ids = [];
        for (var i in list){
            var v = list[i][cfg.selfKey];
            if (isDefined(v)) {
                ids.push(v);
            }
        }
        if (ids.length <= 0){
            return [];
        }
        var roots = [];

        for (var i in list){
            var item = list[i];
            var v = item[cfg.parentKey];
            if (!isDefined(v)) {
                continue;
            }
            if (ids.indexOf(v) < 0) {
                //roots.push(item[cfg.parentKey]);
                roots.push(item);
            }
        }
        return roots;
    };

    function itemsWithTheseSelfVals(cfg, vals, list){
        if (!list || !isArray(list)){
            return [];
        }
        var results = [];
        for (var i in list){
            if (vals.indexOf(list[i][cfg.selfKey]) >=0 ) {
                results.push(list[i]);
            }
        }
        return results;
    };

    function makeArrayIfNot(val){
        return isArray(val)  ? val : [val];
    }

    function toHier(cfg, listArg){
       var list = listArg; //safeCopy(listArg);
        if (!isDefined(cfg.selfKey)
                || !isDefined(cfg.parentKey)
                || !isDefined(cfg.childrenKey) ){
            throw new Error("selfKey, parentKey, and childrenKey properties of cfg parameter must be defined");
        }

        if (isDefined(cfg.rootParentValues) && isDefined(cfg.rootSelfValues)){
            throw new Error("rootParentValues and rootSelfValues are mutually exclusive; please set only one of them");
        }

        //var iterations = 0;
        function getChildren(parent){
            var results = [];
            for (var i in list){
                var item = list[i];
                //iterations++;
                if (item[cfg.parentKey] === parent) {
                    results.push(item);
                    item[cfg.childrenKey] = getChildren(item[cfg.selfKey]);
                }
            }
            return results;
        };
        if (!list || !list.length){
            return [];
        }
        var results = [];

        var rootItems_ = [];
        var rootsDefined = isDefined(cfg.rootSelfValues) || isDefined(cfg.rootParentValues);
        if (rootsDefined){
            if (isDefined(cfg.rootSelfValues)) {
                var selfValues = makeArrayIfNot(cfg.rootSelfValues);
                rootItems_ = itemsWithTheseSelfVals(cfg, selfValues, list);
            } else {
                var rootValues = makeArrayIfNot(cfg.rootParentValues);
                for (var i=0; i<list.length; i++){
                    var item = list[i];
                    if (rootValues.indexOf(item[cfg.parentKey]) >=0) {
                        rootItems_.push(item);
                    }
                }
            }
        } else {
            rootItems_ = rootItems(cfg, list);
            //rootValues = pluck(rootItems_, cfg.selfKey);
        }

        var tmp = [];
        for (var i in rootItems_){
            var item = rootItems_[i];
            item[cfg.childrenKey] = getChildren(rootItems_[i][cfg.selfKey]);

            tmp.push(item);
        }
        for (var i = 0; i <tmp.length; i++){
            results = results.concat(tmp[i]);
        }

        return results;
    };

    function flattenHierarchy(cfg, hierList){
        if ( !isDefined(cfg.childrenKey)){
            throw new Error("childrenKey property of cfg parameter must be defined");
        }

        //childrenKey
        //
        function flattenLevel(listArg, results, parentHierPosition, depth){
            if (!listArg || !listArg.length) {
                return;
            }
            parentHierPosition += parentHierPosition !== '' ? '.' : '';

            for (var i = 0; i <listArg.length; i++){
                var item = listArg[i];
                var pos = parentHierPosition + (i+1);
                results.push({
                    item: item, hierPos: pos, depth: depth,
                    childCount:item.children ? item.children.length : 0
                });
                flattenLevel(item[cfg.childrenKey], results, pos, depth+1);
                delete item.children;
            }
        }
        var results = [];
        flattenLevel(hierList, results, '', 0);
        for (var i = 0, len = results.length; i < len; i++){
            delete results[i].item[cfg.childrenKey];
        }
        return results;
    };

    function toFlatHier(cfg, hierArg){
       var hier = hierArg; //safeCopy(hierArg);
        //var hier = toHier(cfg, list);
        return flattenHierarchy(cfg, hier);
    };

    function findInFlatHier(flatHier, propName, propVal){
       for (var i = 0, len = flatHier.length; i < len; i++){
            if (flatHier[i].item[propName] === propVal) {
               return flatHier[i];
            }
        }
        return null;
    }

    function getKidsAncestorsHelper(cfg, listArg, selfKeyVal, isAncestors){
        var childrenKey = "children__" + (new Date()).getTime();
        cfg.childrenKey = childrenKey;
        var hier = toHier(cfg, listArg);
        var flatHier = toFlatHier(cfg, hier);
        var obj = findInFlatHier(flatHier, cfg.selfKey, selfKeyVal);
        if (!obj){
            return [];
        }
        var result =[];
        for (var i = 0, len = flatHier.length; i < len; i++){
            var elem = flatHier[i];
            if (elem.hierPos === obj.hierPos){
                continue;
              }
              if ((isAncestors && obj.hierPos.indexOf(elem.hierPos) === 0)
                      || (!isAncestors && elem.hierPos.indexOf(obj.hierPos) === 0) ) {
                    result.push(elem.item);
              }
         };
         return result;
    }

    function getKids(cfg, listArg, selfKeyVal){
        return getKidsAncestorsHelper(cfg, listArg, selfKeyVal, false);
    }

    // selfKey and parentKey
    function getAncestors(cfg, listArg, selfKeyVal){
        return getKidsAncestorsHelper(cfg, listArg, selfKeyVal, true);
    }

    var selfRef = function(){
        return {
            toHier: toHier,
            toHierarchy: toHier,
            rootItems: rootItems,
            getRootItems: rootItems,
            toFlatHier: toFlatHier,
            toFlatHierarchy: toFlatHier,
            getAncestors: getAncestors,
            getChildren: getKids
        };
    }();

    //exposing

    var hasModule = (typeof module !== 'undefined' && module.exports);
    // CommonJS module is defined
    if (hasModule) {
        module.exports = selfRef;
    }

    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `numeral` as a global object via a string identifier,
        // for Closure Compiler 'advanced' mode
        this['selfReferential'] = selfRef;
    }

    /*global define:false */
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return selfRef;
        });
    }

}).call(this);
