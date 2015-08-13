define([
	'./Selector',
	'./CompositeSelector',
	'./Specificity'
], function (
	Selector,
	CompositeSelector,
	Specificity
	) {
	'use strict';

	/**
	 * @param  {Function}  isMatchingNode  called with node and blueprint
	 */
	function NodePredicateSelector (isMatchingNode) {
		Selector.call(this, new Specificity({external: 1}));

		this._isMatchingNode = isMatchingNode;
	}

	NodePredicateSelector.prototype = Object.create(Selector.prototype);
	NodePredicateSelector.prototype.constructor = NodePredicateSelector;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	NodePredicateSelector.prototype.matches = function (node, blueprint) {
		return this._isMatchingNode.call(undefined, node, blueprint);
	};

	NodePredicateSelector.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof NodePredicateSelector &&
			// Not perfect, but function logically compare cannot be done
			this._isMatchingNode === otherSelector.isMatchingNode;
	};

	/**
	 * @param  {Function}  isMatchingNode
	 */
	Selector.prototype.requireNodePredicate = function (isMatchingNode) {
		return new CompositeSelector(this, new NodePredicateSelector(isMatchingNode));
	};

	return NodePredicateSelector;
});
