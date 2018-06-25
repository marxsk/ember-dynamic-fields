import { module, test } from "qunit";
import { setupRenderingTest, skip } from "ember-qunit";
import { render } from "@ember/test-helpers";
import { fillIn } from "ember-native-dom-helpers";
import hbs from "htmlbars-inline-precompile";

import Ember from "ember";
import {
  typeInSearch,
  clickTrigger,
  selectChoose
} from "ember-power-select/test-support/helpers";

module("Integration | Component | form-dynamic", function(hooks) {
  setupRenderingTest(hooks);

  test("it yields content when only empty dataset is available", async function(assert) {
    this.set("data", Ember.A());
    await render(hbs`{{form-dynamic dataObject=data}}`);
    assert.equal(this.element.textContent.trim(), "");

    this.set("data2", Ember.A());
    // @todo: use 'data' instead of data2 - content is preserved, why??
    await render(hbs`
      {{#form-dynamic dataObject=data2}}
        template block text
      {{/form-dynamic}}
    `);
    assert.equal(this.element.textContent.trim(), "template block text");
  });

  test("it yields content when only empty dataset is available using dataObjectKey", async function(assert) {
    this.set("data", Ember.Object.create());
    await render(hbs`{{form-dynamic dataObject=data dataObjectKey='text'}}`);
    assert.equal(this.element.textContent.trim(), "");

    this.set("data2", Ember.A());
    // @todo: use 'data' instead of data2 - content is preserved, why??
    await render(hbs`
      {{#form-dynamic dataObject=data2}}
        template block text
      {{/form-dynamic}}
    `);
    assert.equal(this.element.textContent.trim(), "template block text");
  });

  test("it yields proper count of elements for multiple records (including new empty one)", async function(assert) {
    this.set("data", Ember.A(["first", "second"]));
    await render(hbs`
          {{#form-dynamic dataObject=data as |record|}}
            <input value={{record}} /> <br />
          {{/form-dynamic}}
          `);
    assert.equal(
      this.$("input").length,
      2 + 1,
      "Count of yielded elements matches"
    );
  });

  test("it yields content for multiple records according to input data", async function(assert) {
    this.set("data", Ember.A([]));
    this.get("data").pushObject(Ember.Object.create({ value: "first" }));
    this.get("data").pushObject(Ember.Object.create({ value: "second" }));
    await render(hbs`
          {{#form-dynamic dataObject=data as |record|}}
            <span>{{record.value}}</span><br />
          {{/form-dynamic}}
          `);
    assert.equal(
      this.$("span")[0].innerText,
      this.get("data")
        .objectAt(0)
        .get("value"),
      "Content of the first element matches"
    );
    assert.equal(
      this.$("span")[2].innerText,
      "",
      "Content of the last/empty element matches"
    );
  });

  test("it yields content for multiple records according to input data using dataObjectKey", async function(assert) {
    this.set("data", Ember.Object.create());
    this.set("data.spans", Ember.A([]));
    this.get("data.spans").pushObject(Ember.Object.create({ value: "first" }));
    this.get("data.spans").pushObject(Ember.Object.create({ value: "second" }));
    this.set("isEmpty", record => {
      return record && record.value === "";
    });

    await render(hbs`
          {{#form-dynamic dataObject=data dataObjectKey='spans' isEmpty=isEmpty as |record|}}
            <span>{{record.value}}</span><br />
          {{/form-dynamic}}
          `);

    assert.equal(
      this.$("span")[0].innerText,
      this.get("data.spans")
        .objectAt(0)
        .get("value"),
      "Content of the first element matches"
    );
    assert.equal(
      this.$("span")[2].innerText,
      "",
      "Content of the last/empty element matches"
    );
  });

  test("it reacts to the changes on the last record by creating new field", async function(assert) {
    this.set("data", Ember.A());

    await render(hbs`
            {{#form-dynamic dataObject=data as |record index dynAction|}}
              <input value={{record.value}} oninput={{action dynAction index}}/>
              <br />
            {{/form-dynamic}}
            `);

    await fillIn(this.$("input")[0], "first");
    assert.equal(
      this.$("input").length,
      2,
      "New field is spawned because last one is empty"
    );
    assert.equal(this.$("input")[1].value, "", "Created field is empty");

    await fillIn(this.$("input")[0], "again");
    assert.equal(
      this.$("input").length,
      2,
      "Another new field is not spawned as last field is still empty"
    );
  });

  test("it reacts to the empty record by deleting the field", async function(assert) {
    this.set("data", Ember.A([]));
    this.get("data").pushObject(Ember.Object.create({ value: "first" }));
    this.get("data").pushObject(Ember.Object.create({ value: "second" }));

    this.set("isEmpty", record => {
      return record.value === "";
    });

    await render(hbs`
            {{#form-dynamic dataObject=data isEmpty=isEmpty as |record index dynAction|}}
              <input value={{record.value}} oninput={{action (pipe (action (mut record.value)) (action dynAction index)) value="target.value"}}/>
              <br />
            {{/form-dynamic}}
            `);
    assert.equal(
      this.$("input")[0].value,
      this.get("data")[0].value,
      "Content of the first element matches"
    );
    await fillIn(this.$("input")[0], "");
    assert.equal(
      this.$("input").length,
      2,
      "Third field is not spawned as the last field is still empty"
    );
    assert.equal(
      this.$("input")[0].value,
      "second",
      "Content of the first element matches after deletion"
    );
    assert.equal(
      this.$("input")[1].value,
      "",
      "Content of the last element matches after deletion"
    );
  });

  test("it reacts to the empty record by deleting the field using dataObjectKey", async function(assert) {
    this.set("data", Ember.Object.create());
    this.set("data.spans", Ember.A([]));
    this.get("data.spans").pushObject(Ember.Object.create({ value: "first" }));
    this.get("data.spans").pushObject(Ember.Object.create({ value: "second" }));

    this.set("isEmpty", record => {
      return record && record.value === "";
    });

    await render(hbs`
            {{#form-dynamic dataObject=data dataObjectKey='spans' isEmpty=isEmpty as |record index dynAction|}}
              <input value={{record.value}} oninput={{action (pipe (action (mut record.value)) (action dynAction index)) value="target.value"}}/>
              <br />
            {{/form-dynamic}}
            `);
    assert.equal(
      this.$("input")[0].value,
      this.get("data.spans")[0].value,
      "Content of the first element matches"
    );
    await fillIn(this.$("input")[0], "");
    assert.equal(
      this.$("input").length,
      2,
      "Third field is not spawned as the last field is still empty"
    );
    assert.equal(
      this.$("input")[0].value,
      "second",
      "Content of the first element matches after deletion"
    );
    assert.equal(
      this.$("input")[1].value,
      "",
      "Content of the last element matches after deletion"
    );
  });

  skip("it changes focused field after deletion of a record", async function() {
    // @todo: I'm unable to get focused element via jQuery
    // manual testing only:
    // * delete line, check if an element has focus (= typed text appears)
    return new Ember.RSVP.Promise(() => {});
  });

  test("it adds new fields when limit is not set", async function(assert) {
    this.set("data", Ember.A([]));
    this.get("data").pushObject(Ember.Object.create({ value: "first" }));
    this.get("data").pushObject(Ember.Object.create({ value: "second" }));

    this.set("isEmpty", record => {
      return record.value === "";
    });

    await render(hbs`
            {{#form-dynamic dataObject=data isEmpty=isEmpty as |record index dynAction|}}
              <input value={{record.value}} oninput={{action (pipe (action (mut record.value)) (action dynAction index)) value="target.value"}}/>
              <br />
            {{/form-dynamic}}
            `);
    await fillIn(this.$("input")[2], "foo");
    await fillIn(this.$("input")[3], "bar");
    assert.equal(
      this.$("input").length,
      4 + 1,
      "Count of yielded elements matches"
    );
  });

  test("it adds new fields unlit limit is reached", async function(assert) {
    this.set("data", Ember.A([]));
    this.get("data").pushObject(Ember.Object.create({ value: "first" }));
    this.get("data").pushObject(Ember.Object.create({ value: "second" }));

    this.set("isEmpty", record => {
      return record.value === "";
    });

    await render(hbs`
            {{#form-dynamic dataObject=data isEmpty=isEmpty limit=4 as |record index dynAction|}}
              <input value={{record.value}} oninput={{action (pipe (action (mut record.value)) (action dynAction index)) value="target.value"}}/>
              <br />
            {{/form-dynamic}}
            `);
    await fillIn(this.$("input")[2], "foo");
    await fillIn(this.$("input")[3], "bar");
    assert.equal(
      this.$("input").length,
      4 + 0,
      "Count of yielded elements matches"
    );
  });

  test("it works with ember-power-select", async function(assert) {
    this.set("data", Ember.A([]));
    this.get("data").pushObject(Ember.Object.create({ selected: "abc" }));
    this.get("data").pushObject(Ember.Object.create({ selected: "def" }));

    this.set("options", ["abc", "abc2", "def", "xyz"]);

    this.set("setSelected", (record, value) => {
      record.set("selected", value);
    });

    this.set("isEmpty", record => {
      return !(
        record && (record.selected !== undefined) & (record.selected !== null)
      );
    });

    await this.render(hbs`
      {{#form-dynamic dataObject=data isEmpty=isEmpty as |record index dynAction|}}
        {{#power-select
          selected=record.selected
          options=options
          onchange=(action (pipe (action setSelected record) (action dynAction index)))
          allowClear=true
          as |r|
        }}
          {{r}}
        {{/power-select}}
      {{/form-dynamic}}
    `);

    await clickTrigger();
    assert.equal(
      Ember.$(".ember-power-select-dropdown").length,
      1,
      "Dropdown is rendered"
    );
    assert.equal(
      Ember.$(".ember-power-select-option").length,
      this.get("options").length,
      "Dropdown contains all items"
    );

    await typeInSearch("ab");
    // only abc and abc2 options are visible
    assert.equal(
      Ember.$(".ember-power-select-option").length,
      2,
      "Dropdown contains matching items after filtering"
    );
    await selectChoose("", "abc");

    assert.equal(
      this.get("data.firstObject.selected"),
      "abc",
      "Selected element is available in dataObject"
    );
    assert.equal(
      Ember.$(".ember-power-select-trigger").length,
      2 + 1,
      "Two filled ember-power-select and one empty are rendered"
    );
  });
});
