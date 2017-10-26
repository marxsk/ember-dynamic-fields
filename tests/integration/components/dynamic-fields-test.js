import { moduleForComponent, test } from 'ember-qunit';
import { fillIn } from 'ember-native-dom-helpers';
import { skip } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

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
        {{input value=record.value change=(action dynamicUpdate record.name)}}
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
});

test('it removes line when it is empty and it is not last one', async function(assert) {
  this.set('data', Ember.Object.create());

  // @note: this is not working; change is executed only once
  //         {{input value=record.value change=(action dynamicUpdate record.name)}}
  // @send stackoverflow
  this.render(hbs`
    {{#dynamic-fields dataObject=data as |record dynamicUpdate|}}
      <span id={{record.name}}>
        <input
            value={{record.value}}
            oninput={{action dynamicUpdate record.name}}
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
