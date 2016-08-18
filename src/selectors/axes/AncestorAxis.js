define([
	'fontoxml-blueprints',

	'../Selector',
	'../dataTypes/Sequence'
], function (
	blueprints,

	Selector,
	Sequence
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	/**
	 * @param  {Selector}  ancestorSelector
	 */
	function AncestorAxis (ancestorSelector) {
		Selector.call(this, ancestorSelector.specificity);

		this._ancestorSelector = ancestorSelector;
	}

	AncestorAxis.prototype = Object.create(Selector.prototype);
	AncestorAxis.prototype.constructor = AncestorAxis;

	/**
	 * @param  {Node}       node
	 * @param  {Blueprint}  blueprint
	 */
	AncestorAxis.prototype.matches = function (node, blueprint) {
		var parentNode = blueprint.getParentNode(node);
		if (!parentNode) {
			// Out of document, fail
			return false;
		}

		return !!blueprintQuery.findClosestAncestor(blueprint, parentNode, function (ancestorNode) {
			return this._ancestorSelector.matches(ancestorNode, blueprint);
		}.bind(this));
	};

	AncestorAxis.prototype.equals = function (otherSelector) {
		if (this === otherSelector) {
			return true;
		}

		return otherSelector instanceof AncestorAxis &&
			this._ancestorSelector.equals(otherSelector._ancestorSelector);
	};

	AncestorAxis.prototype.evaluate = function (dynamicContext) {
		var nodeSequence = dynamicContext.contextItem,
			blueprint = dynamicContext.blueprint;

		return nodeSequence.value.reduce(function (resultingSequence, node) {
			return resultingSequence.merge(new Sequence(
				blueprintQuery.findAllAncestors(blueprint, node, false)
					.filter(function (node) {
						return this._ancestorSelector.evaluate({
							contextItem: Sequence.singleton(node),
							contextSequence: null,
							blueprint: blueprint
						}).getEffectiveBooleanValue();
					}.bind(this))));
			}.bind(this), new Sequence());
	};

	return AncestorAxis;
});