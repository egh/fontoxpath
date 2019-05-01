import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import StaticContext from '../StaticContext';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import ISequence from './ISequence';
import RestArgument from './RestArgument';
import sequenceFactory from './sequenceFactory';
import TypeDeclaration from './TypeDeclaration';
import Value from './Value';
import QName from './valueTypes/QName';

export type FunctionSignature = (
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	...args: ISequence[]
) => ISequence;

function expandRestArgumentToArity(argumentTypes, arity) {
	let indexOfRest = -1;
	for (let i = 0; i < argumentTypes.length; i++) {
		if (argumentTypes[i].isRestArgument) {
			indexOfRest = i;
		}
	}

	if (indexOfRest > -1) {
		const replacePart = new Array(arity - (argumentTypes.length - 1)).fill(
			argumentTypes[indexOfRest - 1]
		);

		return argumentTypes.slice(0, indexOfRest).concat(replacePart);
	}
	return argumentTypes;
}

class FunctionValue extends Value {
	public value: FunctionSignature;
	private _argumentTypes: (TypeDeclaration | RestArgument)[];
	private _arity: number;
	private _isAnonymous: boolean;
	private _localName: string;
	private _namespaceURI: string;
	private _returnType: TypeDeclaration;

	constructor({
		argumentTypes,
		arity,
		isAnonymous = false,
		localName,
		namespaceURI,
		returnType,
		value
	}: {
		argumentTypes: (TypeDeclaration | RestArgument)[];
		arity: number;
		isAnonymous?: boolean;
		localName: string;
		namespaceURI: string;
		returnType: TypeDeclaration;
		value: FunctionSignature;
	}) {
		super('function(*)', null);

		this.value = value;
		this._argumentTypes = expandRestArgumentToArity(argumentTypes, arity);
		this._arity = arity;
		this._isAnonymous = isAnonymous;
		this._localName = localName;
		this._namespaceURI = namespaceURI;
		this._returnType = returnType;
	}

	/**
	 * Apply these arguments to curry them into a new function
	 */
	public applyArguments(appliedArguments) {
		const fn = this.value;

		const argumentSequenceCreators = appliedArguments.map(arg => {
			if (arg === null) {
				return null;
			}
			return createDoublyIterableSequence(arg);
		});

		// fn (dynamicContext, ...arg)
		function curriedFunction(dynamicContext, executionParameters, staticContext) {
			const newArguments = Array.from(arguments).slice(3);
			const allArguments = argumentSequenceCreators.map(function(createArgumentSequence) {
				// If createArgumentSequence === null, it is a placeholder, so use a provided one
				if (createArgumentSequence === null) {
					return newArguments.shift();
				}
				return createArgumentSequence();
			});
			return fn.apply(
				undefined,
				[dynamicContext, executionParameters, staticContext].concat(allArguments)
			);
		}
		const argumentTypes = appliedArguments.reduce(
			((indices, arg, index) => {
				if (arg === null) {
					indices.push(this._argumentTypes[index]);
				}
				return indices;
			}).bind(this),
			[]
		);

		const functionItem = new FunctionValue({
			argumentTypes,
			arity: argumentTypes.length,
			isAnonymous: true,
			localName: 'boundFunction',
			namespaceURI: this._namespaceURI,
			returnType: this._returnType,
			value: curriedFunction
		});

		return sequenceFactory.singleton(functionItem);
	}

	public getArgumentTypes() {
		return this._argumentTypes;
	}

	public getArity() {
		return this._arity;
	}

	public getName() {
		return this._localName;
	}

	public getQName() {
		return new QName('', this._namespaceURI, this._localName);
	}

	public getReturnType() {
		return this._returnType;
	}

	public isAnonymous() {
		return this._isAnonymous;
	}
}

export default FunctionValue;