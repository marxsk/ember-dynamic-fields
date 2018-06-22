import { module, test } from "qunit";
import { setupRenderingTest, skip } from "ember-qunit";
import { render } from "@ember/test-helpers";
import { fillIn } from "ember-native-dom-helpers";
import hbs from "htmlbars-inline-precompile";

import Ember from "ember";

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
    this.set("data", Ember.A(["first", "second"]));
    await render(hbs`
          {{#form-dynamic dataObject=data as |record|}}
            <span>{{record}}</span><br />
          {{/form-dynamic}}
          `);
    assert.equal(
      this.$("span")[0].innerText,
      this.get("data")[0],
      "Content of the first element matches"
    );
    assert.equal(
      this.$("span")[2].innerText,
      "",
      "Content of the last/empty element matches"
    );
  });

  test("it react to the changes on the last record by creating new field", async function(assert) {
    this.set("data", Ember.A());

    await render(hbs`
            {{#form-dynamic dataObject=data as |record index dynAction|}}
              <input value={{record}} oninput={{action dynAction '' index}}/>
              <br />
            {{/form-dynamic}}
            `);

    await fillIn(this.$("input")[0], "first");
    assert.equal(this.$("input").length, 2, "Second field is spawned");
    assert.equal(this.$("input")[1].value, "", "Second field is empty");

    await fillIn(this.$("input")[0], "again");
    assert.equal(
      this.$("input").length,
      2,
      "Third field is not spawned as last field is still empty"
    );
  });
});
