import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import Ember from "ember";

module("Integration | Component | form-dynamic", function(hooks) {
  setupRenderingTest(hooks);

  test("it yields content once when only empty dataset available", async function(assert) {
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

  test("it yields fields according to number of records in dataObject (including new empty one)", async function(assert) {
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

  test("it yields content according to input data (including new empty one)", async function(assert) {
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
});
