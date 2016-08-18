define([
	'fontoxml-blueprints',
	'../Selector',
	'../dataTypes/Sequence',
	'../dataTypes/BooleanValue'
], function (
	blueprints,
	Selector,
	Sequence,
	BooleanValue
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	/**
	 * @param  {Selector}  descendantSelector
	 */
	function DescendantAxis (descendantSelector) {
		Selector.call(this, descendantSelector.specificity);

		this._descendantSelector = descendantSelector;
	}

	DescendantAxis.prototype = Object.create(Selector.prototype);
	DescendantAxis.prototype.constructor = DescendantAxis;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	DescendantAxis.prototype.matches = function (node, blueprint) {
		return blueprintQuery.findDescendants(blueprint, node, function (descendantNode) {
			return this._descendantSelector.matches(descendantNode, blueprint);
		}.bind(this)).length > 0;
	};

	DescendantAxis.prototype.equals = function (otherSelector) {
		return otherSelector instanceof DescendantAxis &&
			this._descendantSelector.equals(otherSelector._descendantSelector);
	};

	DescendantAxis.prototype.evaluate = function (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem,
			blueprint = dynamicContext.blueprint;
		return nodeSequence.value.reduce(function (resultingSequence, node) {
			return resultingSequence.merge(
				new Sequence(blueprintQuery.findDescendants(blueprint, node, function (descendantNode) {
					return new BooleanValue(this._descendantSelector.evaluate({
						blueprint: blueprint,
						contextItem: Sequence.singleton(descendantNode),
						contextSequence: null
					}).getEffectiveBooleanValue());
				}.bind(this))));
		}.bind(this), new Sequence());
	};


	return DescendantAxis;
});