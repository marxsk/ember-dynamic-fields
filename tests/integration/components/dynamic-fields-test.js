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

test('it changes the name of element according to elementPrefix', function(assert) {
  this.render(hbs`
    {{#dynamic-fields as |record|}}
      {{record.name}}
    {{/dynamic-fields}}
    `);
  assert.equal(this.$().text().trim(), 'dynamic_0');

  this.render(hbs`
    {{#dynamic-fields elementPrefix='other' as |record|}}
      {{record.name}}
    {{/dynamic-fields}}
    `);
  assert.equal(this.$().text().trim(), 'other_0');
});

skip('it yields content according to number of records from dataObject', function(assert) {
  // @todo: There is no support for showing existing content yet
  assert.ok(false);
});

test('it adds new line when last one is not empty', async function(assert) {
  this.set('data', Ember.Object.create());
  this.render(hbs`
    {{#dynamic-fields dataObject=data as |record dynamicUpdate|}}
      <span id={{record.name}}>
        {{input value=record.value change=(action dynamicUpdate '' record.name)}}
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

  assert.equal('first', this.get('data').objectAt(0).get('value'), 'First element in the result is okay');
  assert.equal('second', this.get('data').objectAt(1).get('value'), 'Second element in the result is okay');
});

test('it adds new line when last one is not empty (with dataObjectKey)', async function(assert) {
  this.set('data', Ember.Object.create());

  this.render(hbs`
    {{#dynamic-fields dataObject=data dataObjectKey='foo' as |record dynamicUpdate|}}
      <span id={{record.name}}>
        {{input value=record.value change=(action dynamicUpdate '' record.name)}}
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

  assert.equal('first', this.get('data.foo').objectAt(0).get('value'), 'First element in the result is okay');
  assert.equal('second', this.get('data.foo').objectAt(1).get('value'), 'Second element in the result is okay');
});

test('it removes line when it is empty and it is not last one', async function(assert) {
  this.set('data', Ember.Object.create());

  this.render(hbs`
    {{#dynamic-fields dataObject=data as |record dynamicUpdate|}}
      <span id={{record.name}}>
        <input
            value={{record.value}}
            oninput={{action dynamicUpdate '' record.name}}
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
  assert.expect(5);

  this.set('data', Ember.Object.create());
  this.set('options', ['abc', 'abc2', 'def', 'xyz']);

  this.render(hbs`
    {{#dynamic-fields dataObject=data as |record dynamicUpdate|}}
      {{#power-select
        selected=record.value
        options=options
        onchange=(action dynamicUpdate '' record.name)
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
  await selectChoose('.ember-power-select-trigger', 'abc');

  assert.equal(this.get('data.firstObject.value'), 'abc', 'Selected element is available in dataObject');
  assert.equal(Ember.$('.ember-power-select-trigger').length, 2, 'Two ember-power-select are rendered');
});

skip('it works with ember-power-select-multiple', function(assert) {
  assert.ok(false);
  // @todo: also check stored value in array
});
