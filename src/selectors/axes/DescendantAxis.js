import Selector from '../Selector';
import Sequence from '../dataTypes/Sequence';
import NodeValue from '../dataTypes/NodeValue';

/**
 * @constructor
 * @extends {Selector}
 * @param  {!Selector}  descendantSelector
 * @param  {?Object=}   options
 */
function DescendantAxis (descendantSelector, options) {
    options = options || {};
    Selector.call(this, descendantSelector.specificity, Selector.RESULT_ORDER_SORTED);

    this._descendantSelector = descendantSelector;
    this._isInclusive = !!options.inclusive;
}

DescendantAxis.prototype = Object.create(Selector.prototype);
DescendantAxis.prototype.constructor = DescendantAxis;

DescendantAxis.prototype.equals = function (otherSelector) {
    return otherSelector instanceof DescendantAxis &&
        this._isInclusive === otherSelector._isInclusive &&
        this._descendantSelector.equals(otherSelector._descendantSelector);
};

DescendantAxis.prototype.evaluate = function (dynamicContext) {
    var contextItem = dynamicContext.contextItem,
        domFacade = dynamicContext.domFacade;

    // Assume singleton, since axes are only valid in paths
    var isMatchingDescendant = function (descendantNode) {
        var scopedContext = dynamicContext.createScopedContext({
            contextItem: Sequence.singleton(new NodeValue(domFacade, descendantNode)),
            contextSequence: null
        });
        return this._descendantSelector.evaluate(scopedContext).getEffectiveBooleanValue();
    }.bind(this);
    var nodeValues = [];

    function findMatchingDescendants (matchingDescendants, node) {
        if (isMatchingDescendant(node)) {
            matchingDescendants.push(new NodeValue(domFacade, node));
        }
        domFacade.getChildNodes(node)
            .forEach(function (childNode) {
                findMatchingDescendants(matchingDescendants, childNode);
            });
    }

    if (this._isInclusive) {
        findMatchingDescendants(nodeValues, contextItem.value[0].value);
    }
 else {
        domFacade.getChildNodes(contextItem.value[0].value).forEach(function (childNode) {
            findMatchingDescendants(nodeValues, childNode);
        });
    }

    return new Sequence(nodeValues);
};

export default DescendantAxis;
