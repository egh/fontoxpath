import Sequence from '../../dataTypes/Sequence';
import valueCompare from './valueCompare';


var OPERATOR_TRANSLATION = {
    '=': 'eq',
    '>': 'gt',
    '<': 'lt',
    '!=': 'ne',
    '<=': 'le',
    '>=': 'ge'
};

export default function generalCompare (operator, firstSequence, secondSequence) {
    // Atomize both sequences
    var firstAtomizedSequence = firstSequence.atomize();
    var secondAtomizedSequence = secondSequence.atomize();

    // Change operator to equivalent valueCompare operator
    operator = OPERATOR_TRANSLATION[operator];

    return firstAtomizedSequence.value.some(function (firstValue) {
        var firstSingletonSequence = Sequence.singleton(firstValue);
        return secondAtomizedSequence.value.some(function (secondValue) {
            return valueCompare(operator, firstSingletonSequence, Sequence.singleton(secondValue));
        });
    });
}
