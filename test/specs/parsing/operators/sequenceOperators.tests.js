define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/addXPathCustomTest',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprint,
	jsonMLMapper,
	slimdom,

	parseSelector,
	addXPathCustomTest,
	evaluateXPath
) {
	'use strict';

	var documentNode;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
	});
	describe('sequence', function () {
		it('creates a sequence', function () {
			var selector = parseSelector('(1,2,3)');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([1,2,3]);
		});

		it('creates an empty sequence', function () {
			var selector = parseSelector('()');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([]);
		});

		it('normalizes sequences', function () {
			var selector = parseSelector('(1,2,(3,4))');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([1,2,3,4]);
		});
	});

	describe('range', function () {
		it('creates a sequence', function () {
			var selector = parseSelector('1 to 10');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([1,2,3,4,5,6,7,8,9,10]);
		});
	});


	describe('union', function () {
		it('can parse union', function () {
			var selector = parseSelector('(//someNode | //someChildNode)');
			jsonMLMapper.parse([
				'someNode',
				['someChildNode']
			], documentNode);

			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([documentNode.firstChild, documentNode.firstChild.firstChild]);
		});

		it('dedupes nodes', function () {
			var selector = parseSelector('(//* | //*)');
			jsonMLMapper.parse([
				'someNode',
				['someChildNode']
			], documentNode);

			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([documentNode.firstChild, documentNode.firstChild.firstChild]);
		});

		it('throws an error when not passed a node sequence', function () {
			var selector = parseSelector('(1,2,3) | (4,5,6)');
			chai.expect(function () {
				evaluateXPath(selector, documentNode, blueprint);
			}).to.throw(/ERRXPTY0004/);
		});

		it('sorts nodes', function () {
			// Not implemented yet: performance reasons
			var selector = parseSelector('(//C | //B | //A)');
			jsonMLMapper.parse([
				'someNode',
				['A'],
				['B'],
				['C']
			], documentNode);

			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(Array.from(documentNode.firstChild.childNodes));
		});
	});

});