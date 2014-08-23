
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
   
    function rootItems(cfg, list){
        if (!isDefined(cfg.selfKey) || !isDefined(cfg.parentKey)){
            throw new Error("Both selfKey and parentKey properties of cfg parameter must be defined");
        }
        // cfg.selfKey, 
        // cfg.parentKey      
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



    function toHier(cfg, list){
        if (!isDefined(cfg.selfKey) 
                || !isDefined(cfg.parentKey) 
                || !isDefined(cfg.childrenKey) ){
            throw new Error("selfKey, parentKey, and childrenKey properties of cfg parameter must be defined");
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
        if (typeof cfg.rootParentValues !== 'undefined') {
            var rootValues;
            if (isArray(cfg.rootParentValues)) {
                rootValues = cfg.rootParentValues;
            } else {
                rootValues = [cfg.rootParentValues];
            }
            for (var i=1; i<list.length; i++){
                var item = list[i];
                if (rootValues.indexOf(item[cfg.parentKey]) >=0) {
                    rootItems_.push(item);
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
        return results;
    };
    
    function toFlatHier(cfg, hier){
        //var hier = toHier(cfg, list);
        return flattenHierarchy(cfg, hier);
    };
        
    var selfRef = function(){       
        return {
            toHier: toHier,
            toHierarchy: toHier,
            rootItems: rootItems,
            toFlatHier: toFlatHier,
            toFlatHierarchy: toFlatHier      
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
