import { moduleForComponent, test } from 'ember-qunit';
import { fillIn } from 'ember-native-dom-helpers';
import { skip } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import { typeInSearch, clickTrigger, selectChoose } from '../../helpers/ember-power-select';

moduleForComponent('dynamic-fields', 'Integration | Component | dynamic fields', {
  integration: true
});

test('it yields content once when there are no data', function(assert) {
  this.render(hbs`{{dynamic-fields}}`);
  assert.equal(this.$().text().trim(), '');

  this.render(hbs`
    {{#dynamic-fields}}
      template block text
    {{/dynamic-fields}}
  `);
  assert.equal(this.$().text().trim(), 'template block text');
});

test('it yields content according to number of records from dataObject', function(assert) {
  this.set('data', Ember.A(['first', 'second']));
  this.render(hbs`
    {{#dynamic-fields dataObject=data as |record index dynamicUpdate|}}
      <input
        value={{record}}
        oninput={{action dynamicUpdate '' index}}
      />
    {{/dynamic-fields}}
    `);

  const input1 = this.$('input')[0];

  assert.equal(input1.value, 'first', 'The first input box contains right string');
  assert.equal(3, this.$('input').length, 'There are two filled input boxes and one empty');
});

test('it yields content according to number of records from dataObjectKey', function(assert) {
  this.set('data', Ember.Object.create());
  this.set('data.foo', Ember.A(['first', 'second']));
  this.render(hbs`
    {{#dynamic-fields dataObject=data dataObjectKey='foo' as |record index dynamicUpdate|}}
      <input
        value={{record}}
        oninput={{action dynamicUpdate '' index}}
      />
    {{/dynamic-fields}}
    `);

  const input1 = this.$('input')[0];

  assert.equal(input1.value, 'first', 'The first input box contains right string');
  assert.equal(3, this.$('input').length, 'There are two filled input boxes and one empty');
});

test('it adds new line when last one is not empty', async function(assert) {
  this.set('data', Ember.Object.create());
  this.render(hbs`
    {{#dynamic-fields dataObject=data as |record index dynamicUpdate|}}
      <input
        value={{record}}
        oninput={{action dynamicUpdate '' index}}
      />
    {{/dynamic-fields}}
    `);
  assert.equal(1, this.$('input').length, 'There is one input box');
  const input1 = this.$('input')[0];

  await fillIn(input1, 'first');
  assert.equal(2, this.$('input').length, 'There are two input boxes because first one contains text');

  const input2 = this.$('input')[1];
  await fillIn(input1, 'new-first');
  assert.equal(2, this.$('input').length, 'There are still two input boxes because only first one contains text');

  await fillIn(input2, 'second');
  assert.equal(3, this.$('input').length, 'There are three input boxes because second one contains text');

  assert.equal('new-first', this.get('data')[0], 'First element in the result is okay');
  assert.equal('second', this.get('data')[1], 'Second element in the result is okay');
});

test('it adds new line when last one is not empty and there is less than "max" lines', async function(assert) {
  this.set('data', Ember.Object.create());
  this.render(hbs`
    {{#dynamic-fields dataObject=data max=2 as |record index dynamicUpdate|}}
      <input
        value={{record}}
        oninput={{action dynamicUpdate '' index}}
      />
    {{/dynamic-fields}}
    `);
  assert.equal(1, this.$('input').length, 'There is one input box');
  const input1 = this.$('input')[0];

  await fillIn(input1, 'first');
  assert.equal(2, this.$('input').length, 'There are two input boxes because first one contains text');

  const input2 = this.$('input')[1];
  await fillIn(input1, 'new-first');
  assert.equal(2, this.$('input').length, 'There are still two input boxes because only first one contains text');

  await fillIn(input2, 'second');
  assert.equal(2, this.$('input').length, 'There are still just two input boxes because of "max" limit');

  assert.equal('new-first', this.get('data')[0], 'First element in the result is okay');
  assert.equal('second', this.get('data')[1], 'Second element in the result is okay');
});

test('it adds new line when last one is not empty (with dataObjectKey)', async function(assert) {
  this.set('data', Ember.Object.create());

  this.render(hbs`
    {{#dynamic-fields dataObject=data dataObjectKey='foo' as |record index dynamicUpdate|}}
      <span id={{record.name}}>
        <input
            value={{record}}
            oninput={{action dynamicUpdate '' index}}
        />
      </span>
    {{/dynamic-fields}}
    `);
  assert.equal(1, this.$('input').length, 'There is one input box');
  const input1 = this.$('input')[0];

  await fillIn(input1, 'first');
  assert.equal(2, this.$('input').length, 'There are two input boxes because first one contains text');

  const input2 = this.$('input')[1];
  await fillIn(input1, 'second');
  assert.equal(2, this.$('input').length, 'There are still two input boxes because first one contains text');

  await fillIn(input2, 'second');
  assert.equal(3, this.$('input').length, 'There are three input boxes because second one contains text');

  assert.equal('second', this.get('data.foo')[0], 'First element in the result is okay');
  assert.equal('second', this.get('data.foo')[1], 'Second element in the result is okay');
});

test('it removes line when it is empty and it is not last one', async function(assert) {
  this.set('data', Ember.Object.create());

  this.render(hbs`
    {{#dynamic-fields dataObject=data as |record index dynamicUpdate|}}
      <span id={{record.name}}>
        <input
            value={{record.value}}
            oninput={{action dynamicUpdate '' index}}
        />
      </span>
    {{/dynamic-fields}}
    `);
  assert.equal(1, this.$('input').length, 'There is one input box');
  const input1 = this.$('input')[0];

  await fillIn(input1, 'first');
  assert.equal(2, this.$('input').length, 'There are two input boxes because first one contains text');

  await fillIn(input1, '');
  assert.equal(1, this.$('input').length, 'There is just one input box because first one was empty');
});

test('it works with ember-power-select', async function(assert) {
  this.set('data', Ember.Object.create());
  this.set('options', ['abc', 'abc2', 'def', 'xyz']);

  this.render(hbs`
    {{#dynamic-fields dataObject=data as |record index dynamicUpdate|}}
      {{#power-select
        selected=record
        options=options
        onchange=(action dynamicUpdate '' index)
        allowClear=true
        as |record|
      }}
        {{record}}
      {{/power-select}}
    {{/dynamic-fields}}
  `);

  await clickTrigger();
  assert.equal(Ember.$('.ember-power-select-dropdown').length, 1, 'Dropdown is rendered');
  assert.equal(Ember.$('.ember-power-select-option').length, this.get('options').length, 'Dropdown contains all items');

  await typeInSearch('ab');
  // only abc and abc2 options are visible
  assert.equal(Ember.$('.ember-power-select-option').length, 2, 'Dropdown contains matching items after filtering');
  await selectChoose('', 'abc');

  assert.equal(this.get('data.firstObject'), 'abc', 'Selected element is available in dataObject');
  assert.equal(Ember.$('.ember-power-select-trigger').length, 2, 'Two ember-power-select are rendered');
});

test('it works with ember-power-select-multiple', async function(assert) {
  this.set('data', Ember.Object.create());
  this.set('options', ['abc', 'abc2', 'def', 'xyz']);

  this.render(hbs`
    {{#dynamic-fields dataObject=data as |record index dynamicUpdate|}}
      {{#power-select-multiple
        selected=record
        options=options
        onchange=(action dynamicUpdate '' index)
        allowClear=true
        as |record|
      }}
        {{record}}
      {{/power-select-multiple}}
    {{/dynamic-fields}}
  `);

  await clickTrigger();
  assert.equal(Ember.$('.ember-power-select-dropdown').length, 1, 'Dropdown is rendered');
  assert.equal(Ember.$('.ember-power-select-option').length, this.get('options').length, 'Dropdown contains all items');

  await typeInSearch('ab');
  // only abc and abc2 options are visible and only visible options can be selectChoose-d
  assert.equal(Ember.$('.ember-power-select-option').length, 2, 'Dropdown contains matching items after filtering');
  await selectChoose('', 'abc');
  await selectChoose('', 'xyz');

  assert.deepEqual(this.get('data.firstObject'), ['abc', 'xyz'], 'There are two selected items in the first field');
  assert.equal(Ember.$('.ember-power-select-trigger').length, 2, 'Two ember-power-select-multiple are rendered');
});

skip('it works with ember-form-for', function(assert) {
  assert.ok(false);
});
