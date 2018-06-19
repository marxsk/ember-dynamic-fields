import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import Ember from "ember";

module("Integration | Component | form-dynamic", function(hooks) {
  setupRenderingTest(hooks);

  test("it yields content once when no data are available", async function(assert) {
    await render(hbs`{{form-dynamic}}`);
    assert.equal(this.element.textContent.trim(), "");

    await render(hbs`
      {{#form-dynamic}}
        template block text
      {{/form-dynamic}}
    `);
    assert.equal(this.element.textContent.trim(), "template block text");
  });

  test("it yields content according to number of records in dataObject", async function(assert) {
    this.set("data", Ember.A(["first", "second"]));
    await render(hbs`
          {{#form-dynamic dataObject=data as |record|}}
            <input value={{record}} /> <br />
          {{/form-dynamic}}
          `);
    assert.equal(
      this.$("input").length,
      this.get("data.length"),
      "Count of yielded elements matches"
    );
  });
});
