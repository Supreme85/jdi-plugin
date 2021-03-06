import { getChildren, drawMap, searchElement } from '../functional parts/tree';
import { findPage, findElement } from '../functional parts/common';

let map = new Map();
let resTree = [];
let genRand = (name) => {
    return (name + (Math.floor(Math.random() * (1000 - 1)) + 1) + (Math.floor(Math.random() * (1000 - 1)) + 1));
};

export let showPage = (mainObj, id) => {
    let pageElements = findPage(id, mainObj.PageObjects).elements;
    map = drawMap(pageElements, new Map());
    resTree = getChildren(map, null);
    return Object.assign({}, mainObj, {
        searchElement: "",
        activeTabPageId: id,
        settingsForSite: false,
        resultTree: resTree,
        pageMap: map,
        selectedElement: "",
        rulesSettings: false,
        mainSettings: false,
        selectedRule: '',
        showCode: false,
        ruleId: -1
    })
};

export let changeTree = (mainObj, treeData) => {
    let objCopy = Object.assign({}, mainObj);
    let pageId = objCopy.activeTabPageId;
    let copyPageObjectsArray = findPage(pageId, objCopy.PageObjects).elements;

    treeData.forEach((el) => {
        el.parent = null;
    });

    function check(nodeArr) {
        let result = [];
        for (let k = 0; k < nodeArr.length; k++) {
            let m = [];
            let children = [];
            if (nodeArr[k].children.length) {
                let newParentId = nodeArr[k].elId;
                let newParent = nodeArr[k].Name;
                children = nodeArr[k].children;
                children.forEach((el) => {
                    el.parentId = newParentId;
                    el.parent = newParent;
                });
                m = result.concat(nodeArr[k].children);
                result = m;
            }
        }
        if (result.length) {
            check(result);
        }
    }

    check(treeData);

    map = drawMap(copyPageObjectsArray, new Map());

    objCopy.pageMap = map;
    objCopy.resultTree = treeData;

    return objCopy;
};

export let addElement = (mainObj, element) => {
    let objCopy = Object.assign({}, mainObj);
    let pageId = objCopy.activeTabPageId;
    let elementsArray = findPage(pageId, objCopy.PageObjects).elements;
    let parent = null;
    if (element.parentId !== null) {
        parent = elementsArray.find((el) => {
            if (el.elId === element.parentId) {
                return el;
            }
        });
        elementsArray.map((el) => {
            if (el.elId === parent.elId) {
                return el.expanded = true;
            }
        });
    }

    element.parent = parent;
    element.Name = genRand("Element");
    element.elId = genRand("El");

    elementsArray.push(element);
    map = drawMap(elementsArray, new Map());
    objCopy.pageMap = map;
    objCopy.resultTree = getChildren(map, null);
    return objCopy;
};

export let deleteElement = (mainObj, elId) => {
    function del(arr, id) {
        return arr.filter((el) => {
            if (el.elId !== id) {
                return el;
            }
        })
    }

    let objCopy = Object.assign({}, mainObj);
    let pageId = objCopy.activeTabPageId;
    let elementsArray = findPage(pageId, objCopy.PageObjects).elements;
    let element = findElement(elId, elementsArray);
    let newArr = del(elementsArray, elId);

    if (element.children && element.children.length) {
        let children = element.children;
        children.forEach((child) => {
            newArr = del(newArr, child.elId);
        });
    }

    map = drawMap(newArr, new Map());
    resTree = getChildren(map, null);

    objCopy.PageObjects.map((page) => {
        if (pageId === page.pageId) {
            page.elements = newArr;
        }
        return page
    });

    objCopy.pageMap = map;
    objCopy.resultTree = resTree;
    objCopy.selectedElement = "";

    return objCopy;
};

export let selectElement = (mainObj, elId) => {
    let objCopy = Object.assign({}, mainObj);
    let pageId = objCopy.activeTabPageId;
    let elementsArray = findPage(pageId, objCopy.PageObjects).elements;
    let element = findElement(elId, elementsArray);
    objCopy.selectedElement = element;
    objCopy.showCode = false; 
    return objCopy;
};

export let searchEl = (mainObj, elName) => {
    let objCopy = Object.assign({}, mainObj);
    let pageId = objCopy.activeTabPageId;
    let elementsArray = findPage(pageId, objCopy.PageObjects).elements;

    if (elName === "" || elName.replace(/\s/g, "") === "") {
        map = drawMap(elementsArray, new Map());
        resTree = getChildren(map, null);
    } else {
        let res = searchElement(elName, elementsArray);
        map = drawMap(res, new Map());
        resTree = getChildren(map, null);
    }

    objCopy.resultTree = resTree;
    objCopy.pageMap = map;
    objCopy.selectedElement = "";

    return objCopy;
};

export let editElement = (mainObj, elField, value) => {
    let objCopy = Object.assign({}, mainObj);

    if (value.length || typeof value === "boolean") {
        let pageId = objCopy.activeTabPageId;
        let elementsArray = findPage(pageId, objCopy.PageObjects).elements;
        let selectedElement = objCopy.selectedElement;
        let typesMap = objCopy.ElementFields;

        if (elField[0] === "Type") {
            if (selectedElement.children) {
                let l = selectedElement.children.length;
                for (let k = 0; k < l; k++) {
                    elementsArray = elementsArray.filter((el) => {
                        if (el.elId !== selectedElement.children[k].elId) {
                            return el;
                        }
                    })
                }
            }
            let commonFields = {
                "Name": selectedElement.Name,
                "Type": selectedElement.Type,
                "parent": selectedElement.parent,
                "parentId": selectedElement.parentId,
                "elId": selectedElement.elId
            };
            selectedElement = {};
            let fields = typesMap.get(value);
            for (let field in fields) {
                if (fields[field] === "ComboBoxTextField") {
                    let n = {
                        "path": "",
                        "type": ""
                    }
                    selectedElement[field] = n;
                }
                if (fields[field] === "Checkbox") {
                    selectedElement[field] = false;
                }
                if (fields[field] === "TextField") {
                    selectedElement[field] = "";
                }
                if (fields[field] === "ComboBox") {
                    selectedElement[field] = "";
                }
                if (fields[field] === "internal") {
                    selectedElement[field] = false;
                    if (field === "isSection") {
                        selectedElement[field] = true;
                    }
                }
                if (field === "Name") {
                    selectedElement.Name = commonFields.Name
                }
                if (field === "parent") {
                    selectedElement.parent = commonFields.parent
                }
                if (field === "parentId") {
                    selectedElement.parentId = commonFields.parentId
                }
                if (field === "elId") {
                    selectedElement.elId = commonFields.elId
                }
            }
            selectedElement.children = [];
        }

        if (elField.length > 1) {
            selectedElement[elField[0]][elField[1]] = value;
        } else {
            selectedElement[elField[0]] = value;
        }

        elementsArray = elementsArray.map((element) => {
            if (element.elId === selectedElement.elId) {
                element = selectedElement
            }
            return element;
        });

        objCopy.PageObjects.map((page) => {
            if (pageId === page.pageId) {
                page.elements = elementsArray;
            }
            return page
        });


        map = drawMap(elementsArray, new Map());
        resTree = getChildren(map, null);
        objCopy.resultTree = resTree;
        objCopy.pageMap = map;
        objCopy.selectedElement = selectedElement;
    }
    return objCopy;
};


export let generateElements = (mainObj) => {
    let objCopy = mainObj;
    let result = [];
    let unique = ["className", "id", "name", "value", "alt", "title"];
    let page = objCopy.PageObjects.find((page) => {
        if (page.pageId === objCopy.activeTabPageId) {
            return page
        }
    })
    
    let composites = Object.keys(objCopy.CompositeRules);
    let complex = Object.keys(objCopy.ComplexRules);
    let simple = Object.keys(objCopy.SimpleRules);

    page.elements = [];

    chrome.devtools.inspectedWindow.eval('document.location', (r, err) => {
        page.url = r.pathname;
        objCopy.SiteInfo.hostName = r.hostname;
        page.title = r.pathname.split("/").pop().replace(/\.html|\.htm/, '');
        objCopy.SiteInfo.origin = r.origin;
    });

    chrome.devtools.inspectedWindow.eval('document.domain', (r, err) => {
        if (r !== objCopy.SiteInfo.domainName){
            objCopy.SiteInfo.domainName = r;
        }
    });

    chrome.devtools.inspectedWindow.eval('document.title', (r, err) => {
        if (r !== objCopy.SiteInfo.siteTitle){
            objCopy.SiteInfo.siteTitle = r;
        }
    });
    

    chrome.devtools.inspectedWindow.eval(
        'document.body.outerHTML', (r, err) => {
            if (err) {
                alert('Error, loading data from active page!');
            }

            let parser = new DOMParser();
            let observedDOM = parser.parseFromString(r, "text/html").body;
            let copyOfDom = parser.parseFromString(r, "text/html").body;

            let isDescendant = (parent, child) => {
                let node = child.parentNode;
                let deep = 0;
                while (node != null) {
                    deep++;
                    if (node == parent) {
                        return {
                            parent: true,
                            deep
                        };
                    }
                    node = node.parentNode;
                }
                return {
                    parent: false,
                    deep: -1
                };
            }

            let getComposite = (dom, t) => {
                //change composite

                let rules = objCopy.Rules[t];

                rules.forEach((rule, i) => {
                    if(!!rule.Locator){
                        search(rule.Locator, t, dom);
                    }
                })
            }

            let getComplex = (dom, t, parentLocator) => {
                //change complex
                let rules = objCopy.Rules[t];

                observedDOM = dom;
                rules.forEach((rule, i) => {
                    if (!!rule.Root) {
                        search(rule.Root, t, observedDOM, parentLocator, rule.id);
                    }
                });
            }

            let getSimple= (dom, t, parentLocator) => {
                //change simple
                let rules = objCopy.Rules[t];
                
                observedDOM = dom;
                rules.forEach((rule, i) => {
                    if(!!rule.Locator){
                        search(rule.Locator, t, observedDOM, parentLocator, rule.id);
                    }
                    
                });
            }

            function getElementByXpath(path, dom) {
                return document.evaluate(path, dom, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            }

            let searchBySelector = (dom, locator) => {
                let e = dom.querySelectorAll(locator);
                if (e != null) {
                    if (e.length == 1) {
                        return 1;
                    }
                    if (e.length > 0) {
                        return 0;
                    }
                }
                return -1;
            }

            let applyResult = (locator, type, content, parentLocator, ruleId) => {
                let fields;
                if (type !== "") {
                    fields = objCopy.ElementFields.get(type);
                }
                if (composites.indexOf(type) > -1) {
                    let eid = genRand("El");
                    page.elements.push({
                        "expanded": false,
                        "Name": genRand(type),
                        "parent": null,
                        "elId": eid,
                        "parentId": null,
                        "Locator": locator,
                        "Type": type
                    })
                    result.push({ Locator: locator, type: type, content: content, elId: eid, parentId: null, nest: -1, parent: null});
                    for (let f in fields) {
                        if (!page.elements[page.elements.length - 1].hasOwnProperty(f)) {
                            page.elements[page.elements.length - 1][f] = "";
                            if (f === 'isSection') {
                                page.elements[page.elements.length - 1].isSection = true;
                            }
                        }
                    }
                }
                if (complex.indexOf(type) > -1) {
                    page.elements.push({
                        "Name": genRand(type),
                        "elId": genRand("El"),
                        "Root": locator,
                        "Type": type
                    })
                    //change RULES
                    let rules = objCopy.Rules[type];
                    let r = rules.find((rule) => {
                        if (rule.id === ruleId) {
                            return rule;
                        }
                    })
                    
                    for (let f in r) {
                       if (!page.elements[page.elements.length - 1].hasOwnProperty(f) && f !== 'Root') {
                            page.elements[page.elements.length - 1][f] = r[f];
                        }
                    }

                }
                if (simple.indexOf(type) > -1){
                    page.elements.push({
                        "Name": genRand(type),
                        "elId": genRand("El"),
                        "Locator": locator,
                        "Type": type
                    })
                }
                if ("body" === parentLocator) {
                    page.elements[page.elements.length - 1].parent = null;
                    page.elements[page.elements.length - 1].parentId = null;
                } else {
                    page.elements.find((pElement) => {
                        if (pElement.Locator === parentLocator) {
                            page.elements[page.elements.length - 1].parent = pElement.Name;
                            page.elements[page.elements.length - 1].parentId = pElement.elId;
                        }
                    })
                }

            }

            let createCorrectXpath = (locator, addPart, value) => {
                let i = locator.indexOf(']');
                return locator.slice(0, i) + ' and @' + addPart + '=' + value + locator.slice(i);
            }

            let search = (locator, type, dom, parentLocator, ruleId, locUp) => {
                if (locator.indexOf('/') !== 0) {
                    let res = searchBySelector(dom, locator);
                    let l = "";
                    let locUp = "";
                    if (res === 1) {
                        applyResult(locator, type, dom.querySelector(locator), parentLocator, ruleId);
                        //dom = dom.querySelector(locator).parentNode.removeChild(dom.querySelector(locator));
                    }
                    if (res === 0) {
                        let els = dom.querySelectorAll(locator);
                        for (let j = 0; j < els.length; j++) {
                            for (let i = 0; i < unique.length; i++) { 
                                if (els[j][unique[i]]){
                                    if (unique[i] === "className"){
                                        l = locator + "[class='" + els[j][unique[i]] + "']";
                                    } else {
                                        l = locator + "["+ unique[i] + "='" + els[j][unique[i]] + "']";
                                    }
                                    res = searchBySelector(dom, l);
                                    if (res === 1) {
                                        applyResult(l, type, dom.querySelector(l), parentLocator, ruleId);
                                        //dom = dom.querySelector(locator).parentNode.removeChild(dom.querySelector(locator));
                                        break;
                                    }
                                }    
                            }
                            locUp = dom.querySelectorAll(locator)[j].parentNode; 
                            while (locUp !== dom.parentNode && res === 0) {
                                l = locUp.tagName.toLowerCase() + " " + locator;
                                res = searchBySelector(dom, l);
                                if (res === 1) {
                                    applyResult(l, type, dom.querySelector(l), parentLocator, ruleId);
                                    break;
                                }
                                for (let i = 0; i < unique.length; i++) {
                                    if (locUp[unique[i]]){
                                        if (unique[i] === "className"){
                                            l =  locUp.tagName.toLowerCase() + "[class='" + locUp[unique[i]] + "'] " + locator;
                                        } else {
                                            l =  locUp.tagName.toLowerCase() + "["+ unique[i] + "='" + locUp[unique[i]] + "'] " + locator;
                                        }                    
                                        res = searchBySelector(dom, l);
                                        if (res === 1) {
                                            applyResult(l, type, dom.querySelector(l), parentLocator, ruleId);
                                            break;
                                        }
                                        if (res === 0) {
                                            locUp = locUp.parentNode; 
                                        }
                                    }    
                                }
                            }
                        }
                    }
                      //  }
                    //}
                } else {
                    
                    let elements = getElementByXpath(locator, dom);
                    let len = elements.snapshotLength;
                    let locUp = "";
                    if (len === 1) {
                        applyResult(locator, type, elements.snapshotItem(0), parentLocator, ruleId);
                        //dom = elements.snapshotItem(0).parentNode.removeChild(elements.snapshotItem(0));
                    }
                    if (len > 1) {
                        let e = {};
                        let l = "";
                        for (let i = 0; i < len; i++) {
                            for (let j = 0; j < unique.length; j++) {
                                if (elements.snapshotItem(i)[unique[j]]){
                                    if (unique[j] === "className"){
                                       l = locator + "[@class" + "='" + elements.snapshotItem(i)[unique[j]]+ "']";     
                                    }else {
                                        l = locator + "[@"+ unique[j] + "='" + elements.snapshotItem(i)[unique[j]]+ "']";
                                    }
                                    e = getElementByXpath(l, dom);
                                    if (e.snapshotLength === 1) {
                                        applyResult(l, type, e, parentLocator, ruleId);
                                        //dom = e.snapshotItem(0).parentNode.removeChild(e.snapshotItem(0));
                                        break;
                                    }        
                                }
                            }
                            locUp = elements.snapshotItem(i).parentNode; 
                            while (locUp !== dom.parentNode && len !== 1) {
                                let l = '//' + locUp.tagName.toLowerCase() + locator.slice(1);
                                let elems = getElementByXpath(l, dom);
                                if (elems.snapshotLength === 1){
                                    len = 1;
                                    applyResult(l, type, elems.snapshotItem(0), parentLocator, ruleId);
                                    break;
                                };
                                for (let i = 0; i < unique.length; i++) {
                                     if (locUp[unique[i]]){
                                        if (unique[i] === "className"){
                                            l = '//' + locUp.tagName.toLowerCase() + "[@class='" + locUp[unique[i]] + "']/" + locator;
                                        } else {
                                            l = '//' + locUp.tagName.toLowerCase() + "[@"+ unique[i] + "='" + locUp[unique[i]] + "']/" + locator;
                                        }                    
                                        len = getElementByXpath(l, dom).snapshotLength;
                                        if (len === 1) {
                                            applyResult(l, type, getElementByXpath(l, dom).snapshotItem(0), parentLocator, ruleId);
                                        }
                                        if (len > 0) {
                                            locator = '//' + locUp.tagName.toLowerCase() + '/' + locator;
                                            locUp = locUp.parentNode; 
                                        }
                                    }    
                                }
                            }
                            len = 2;
                        }
                    }
                }
                return dom;
            }

            composites.forEach((rule) => {
                getComposite(observedDOM, rule);
            });

            for (let i = 0; i < result.length; i++){
                let composite = result[i];
                let check;
                for (let j = 0; j < result.length; j++){
                    let parent = result[j];
                    if (composite !== parent){
                        check = isDescendant(parent.content, composite.content);
                        if (check.parent){
                            if (composite.nest === -1 || composite.nest > check.deep ){
                                composite.nest = check.deep;
                                composite.parentId = parent.elId; 
                                composite.parent = parent.type;
                            } 
                        }
                    }
                }
            }

            for (let i = 0; i < page.elements.length; i++){
                let element = page.elements[i];
                for (let j = 0; j < result.length; j++){
                    let res = result[j];
                    if (element.elId === res.elId){
                        element.parentId = res.parentId;
                        element.parent = res.parent;
                    }
                }
            }

            for (let i=0; i < result.length; i++){
                let res = result[i];
                if (res.parentId === null){
                    if (res.Locator.indexOf('/') !== 0) {
                        observedDOM.querySelector(res.Locator).parentNode.removeChild(observedDOM.querySelector(res.Locator));
                    } else {
                        let e = getElementByXpath(res.Locator, observedDOM);
                        e.snapshotItem(0).parentNode.removeChild(e.snapshotItem(0));
                    }
                } else {
                    for (let n=0; n<result.length; n++){
                        if (result[n].elId === res.parentId){
                            if (res.Locator.indexOf('/') !== 0) {
                                result[n].content.querySelector(res.Locator).parentNode.removeChild(result[n].content.querySelector(res.Locator));
                            } else {
                                let e = getElementByXpath(res.Locator, result[n].content);
                                e.snapshotItem(0).parentNode.removeChild(e.snapshotItem(0));
                            }       
                        }
                    }
                }
            }
         
            result.push({ Locator: "body", type: null, content: observedDOM, elId: null, nest: -1, parentId: null });

            for (let i = 0; i < result.length; i++){
                let res = result[i];
                complex.forEach((element) => {
                    getComplex(res.content, element, res.Locator)
                });
                
                simple.forEach((element) => {
                    getSimple(res.content, element, res.Locator)
                });
            }

            /*for (let k=0; k<objCopy.PageObjects.length; k++){
                if (objCopy.PageObjects.pageId === objCopy.activeTabPageId){
                    objCopy.PageObjects = page;
                }
            }*/

            // objCopy.PageObjects.find((page) => {
            //     if (page.pageId === objCopy.activeTabPageId) {
            //         return page
            //     }
            // })
            //objCopy.PageObjects[0].elements = page.elements;
            //showPage(objCopy, objCopy.activeTabPageId);

            document.querySelector("[data-tabid='"+ objCopy.activeTabPageId +"']").click();
            
            // result.forEach((res) => {
            //     complex.forEach((element) => {
            //         getComplex(res.content, element, res.Locator)
            //     })
                
            //     simple.forEach((element) => {
            //         getSimple(res.content, element, res.Locator)
            //     })
            //     //showPage
            // })

            
            //alert(JSON.stringify(objCopy.PageObjects[0].elements))
        }
    );

    /*map = drawMap(page.elements, new Map());
    objCopy.pageMap = map;
    objCopy.resultTree = getChildren(map, null);*/

    return objCopy;
}




/*console.log( getElementByXpath("//html[1]/body[1]/div[1]") );*/