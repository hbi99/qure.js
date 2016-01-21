
var main = function() {
	
};

main.prototype = {
	transform : function(opt) {
		// transformer function
		var processor = new XSLTProcessor(),
			span      = document.createElement('span'),
			tmpltXpath = '//xsl:template[@name="'+ opt.template +'"]',
			temp;

		temp = xNode.selectSingleNode(opt.xsl, tmpltXpath);
		temp.setAttribute('match', opt.match);
		processor.importStylesheet(opt.xsl);
		span.appendChild(processor.transformToFragment(opt.xml, document));
		temp.removeAttribute('match');

		return span.innerHTML;
	}
};

module.exports = new main();

/*
 * XML Node 'selectNodes' & 'selectSingleNode'
 */
window.xNode = function() {

};

xNode.selectNodes = function(XNode, XPath) {
	if (XNode.evaluate) {
		var ns = XNode.createNSResolver(XNode.documentElement),
			qI = XNode.evaluate(XPath, XNode, ns, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null),
			res = [],
			i   = 0,
			il  = qI.snapshotLength;
		for (; i<il; i++) {
			res.push( qI.snapshotItem(i) );
		}
		return res;
	} else {
		return XNode.selectNodes(XPath);
	}
};

xNode.selectSingleNode = function(XNode, XPath) {
	if (XNode.evaluate) {
		var xI = this.selectNodes(XNode, XPath);
		return (xI.length > 0)? xI[0] : null;
	} else {
		return XNode.selectSingleNode(XPath);
	}
};
